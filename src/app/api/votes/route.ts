
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      targetId,
      targetType, // 'post', 'comment', 'answer'
      voteType, // 'upvote' or 'downvote'
      userId,
    } = body;

    // Supabase needs only userId, targetId, voteType
    if (!targetId || !targetType || !voteType || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Get User
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', userId).single();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 2. Check Existing Vote
    // We used a polymorphic 'votes' table structure in SQL: item_type, item_id
    // But previously defined multiple queries. In Supabase we use one table.

    // item_type mapping: 'post', 'comment', 'answer'
    // Ensure targetType matches allowed set.

    // Check if vote exists
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_type', targetType)
      .eq('item_id', targetId)
      .single();


    // Helper to update reputation and award badges
    const updateReputation = async (targetUserId: string, change: number) => {
      // Check if user is voting on their own content? (Optionally prevent self-reputation)
      if (targetUserId === user.id) return;

      const { data: targetUser } = await supabase.from('users').select('reputation').eq('id', targetUserId).single();
      const currentRep = targetUser?.reputation || 0;
      const newRep = currentRep + change;

      await supabase.from('users').update({ reputation: newRep }).eq('id', targetUserId);

      // Check Badges
      const milestones = [
        { score: 50, name: 'Rising Star' },
        { score: 100, name: 'Top Contributor' },
        { score: 500, name: 'Expert' }
      ];

      for (const m of milestones) {
        if (newRep >= m.score && currentRep < m.score) {
          // Award Badge
          const { data: badge } = await supabase.from('badges').select('id').eq('name', m.name).single();
          if (badge) {
            await supabase.from('user_badges').upsert(
              { user_id: targetUserId, badge_id: badge.id },
              { onConflict: 'user_id, badge_id', ignoreDuplicates: true }
            );
          }
        }
      }
    };

    // Get Target Author ID
    let table = '';
    if (targetType === 'post') table = 'posts';
    else if (targetType === 'question') table = 'questions';
    else if (targetType === 'answer') table = 'answers';
    else if (targetType === 'comment') table = 'comments';

    let targetAuthorId = null;
    if (table) {
      const { data: item } = await supabase.from(table).select('author_id').eq('id', targetId).single();
      if (item) targetAuthorId = item.author_id;
    }

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote
        await supabase.from('votes').delete().eq('id', existingVote.id);

        // Revert reputation
        if (targetAuthorId) {
          const points = voteType === 'upvote' ? -5 : 2; // Revert: Up was +5, so -5. Down was -2, so +2.
          await updateReputation(targetAuthorId, points);
        }

        return NextResponse.json({
          success: true,
          action: "removed",
          voteType: null,
        });
      } else {
        // Change vote (e.g. Up to Down)
        await supabase.from('votes').update({ vote_type: voteType }).eq('id', existingVote.id);

        if (targetAuthorId) {
          // Revert old effect and apply new effect
          // If old was Up (+5), new is Down (-2) -> Change is -7
          // If old was Down (-2), new is Up (+5) -> Change is +7
          const points = voteType === 'upvote' ? 7 : -7;
          await updateReputation(targetAuthorId, points);
        }

        return NextResponse.json({
          success: true,
          action: "updated",
          voteType,
        });
      }
    } else {
      // Create new vote
      await supabase.from('votes').insert({
        user_id: user.id,
        item_type: targetType,
        item_id: targetId,
        vote_type: voteType
      });

      if (targetAuthorId) {
        const points = voteType === 'upvote' ? 5 : -2;
        await updateReputation(targetAuthorId, points);
      }

      return NextResponse.json({
        success: true,
        action: "created",
        voteType,
      });
    }

  } catch (error) {
    console.error("Error handling vote:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get("targetId");
    const targetType = searchParams.get("targetType"); // 'post', 'question', 'answer', 'comment'
    const userId = searchParams.get("userId");

    if (!targetId || !targetType || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', userId).single();

    // Get all votes for this item
    const { data: votes } = await supabase
      .from('votes')
      .select('vote_type, user_id')
      .eq('item_type', targetType)
      .eq('item_id', targetId);

    const upvotes = (votes || []).filter((v: any) => v.vote_type === 'upvote').length;
    const downvotes = (votes || []).filter((v: any) => v.vote_type === 'downvote').length;
    const voteCount = upvotes - downvotes;

    const userVoteObj = user ? (votes || []).find((v: any) => v.user_id === user.id) : null;
    const userVote = userVoteObj ? userVoteObj.vote_type : null;

    return NextResponse.json({
      voteCount,
      userVote,
      upvotes,
      downvotes,
    });

  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 },
    );
  }
}
