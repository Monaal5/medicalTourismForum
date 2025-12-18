
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("=== API POST /api/comments ===");
    console.log("Received comment request body:", body);

    const {
      comment,
      content,  // For answer comments, frontend might send 'content'
      postId,
      answerId,
      parentCommentId, // Reply
      userId,
    } = body;

    const commentText = comment || content;

    if (!commentText || (!postId && !answerId) || !userId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "comment/content, (postId or answerId), and userId are required"
        },
        { status: 400 },
      );
    }

    // 1. Get User
    const { data: user } = await supabase.from('users').select('id, username').eq('clerk_id', userId).single();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Create Comment
    const { data: newComment, error } = await supabase
      .from('comments')
      .insert({
        author_id: user.id,
        post_id: postId || null,
        answer_id: answerId || null,
        parent_comment_id: parentCommentId || null,
        body: commentText
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23503') { // Foreign key violation
        return NextResponse.json({ error: "Post or Answer not found" }, { status: 404 });
      }
      throw error;
    }

    console.log("✓ Comment created successfully:", newComment.id);

    // 3. Send Notification
    try {
      let recipientId = null;
      let notifType: 'comment' | 'reply' = 'comment';

      if (parentCommentId) {
        const { data: parent } = await supabase.from('comments').select('author_id').eq('id', parentCommentId).single();
        if (parent) {
          recipientId = parent.author_id;
          notifType = 'reply';
        }
      } else if (postId) {
        const { data: post } = await supabase.from('posts').select('author_id').eq('id', postId).single();
        if (post) recipientId = post.author_id;
      } else if (answerId) {
        const { data: answer } = await supabase.from('answers').select('author_id').eq('id', answerId).single();
        if (answer) recipientId = answer.author_id;
      }

      if (recipientId) {
        await createNotification({
          recipientId,
          senderId: user.id,
          type: notifType,
          postId,
          answerId,
          commentId: newComment.id, // Direct link to this comment?
          // questionId? If answerId, maybe fetch questionId? 
          // Let's keep it simple.
        });
      }

    } catch (notifError) {
      console.error("Error sending notification:", notifError);
    }

    return NextResponse.json({
      success: true,
      comment: { ...newComment, _id: newComment.id },
      message: "Comment created successfully"
    });
  } catch (error: any) {
    console.error("❌ Error creating comment:", error);
    return NextResponse.json(
      {
        error: "Failed to create comment: " + error.message,
        details: error.message
      },
      { status: 500 },
    );
  }
}
