import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { addUser } from "@/sanity/lib/user/addUser";
import { defineQuery } from "groq";
import { sanityFetch } from "@/sanity/lib/live";
import { generateUsername } from "@/lib/username";

export async function POST(request: NextRequest) {
  try {
    const {
      targetId,
      targetType, // 'post' or 'comment'
      voteType, // 'upvote' or 'downvote'
      userId,
      userEmail,
      userFullName,
      userImageUrl,
    } = await request.json();

    if (!targetId || !targetType || !voteType || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Ensure user exists in Sanity
    const sanityUser = await addUser({
      id: userId,
      username: generateUsername(userFullName || "User", userId),
      email: userEmail || "user@example.com",
      imageUrl: userImageUrl || "",
    });

    // Check if user already voted on this target
    const existingVoteQuery = defineQuery(`
      *[_type == "vote" && user._ref == $userId && ${targetType}._ref == $targetId][0] {
        _id,
        voteType
      }
    `);

    const existingVote = await sanityFetch({
      query: existingVoteQuery,
      params: { userId: sanityUser._id, targetId },
    });

    if (existingVote.data) {
      // User already voted, update or remove vote
      if (existingVote.data.voteType === voteType) {
        // Same vote type, remove the vote
        await adminClient.delete(existingVote.data._id);
        return NextResponse.json({
          success: true,
          action: "removed",
          voteType: null,
        });
      } else {
        // Different vote type, update the vote
        await adminClient
          .patch(existingVote.data._id)
          .set({ voteType })
          .commit();

        return NextResponse.json({
          success: true,
          action: "updated",
          voteType,
        });
      }
    } else {
      // New vote, create it
      const voteData: any = {
        _type: "vote",
        user: {
          _type: "reference",
          _ref: sanityUser._id,
        },
        voteType,
        createdAt: new Date().toISOString(),
      };

      if (targetType === "post") {
        voteData.post = {
          _type: "reference",
          _ref: targetId,
        };
      } else if (targetType === "comment") {
        voteData.comment = {
          _type: "reference",
          _ref: targetId,
        };
      }

      const newVote = await adminClient.create(voteData);

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
    const targetType = searchParams.get("targetType");
    const userId = searchParams.get("userId");

    if (!targetId || !targetType || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Get vote count and user's vote
    const voteQuery = defineQuery(`
      {
        "votes": *[_type == "vote" && ${targetType}._ref == $targetId] {
          voteType
        },
        "userVote": *[_type == "vote" && user._ref == $userId && ${targetType}._ref == $targetId][0] {
          voteType
        }
      }
    `);

    const result = await sanityFetch({
      query: voteQuery,
      params: { targetId, userId },
    });

    if (result.data) {
      const votes = result.data.votes || [];
      const upvotes = votes.filter(
        (vote: any) => vote.voteType === "upvote",
      ).length;
      const downvotes = votes.filter(
        (vote: any) => vote.voteType === "downvote",
      ).length;
      const voteCount = upvotes - downvotes;
      const userVote = result.data.userVote?.voteType || null;

      return NextResponse.json({
        voteCount,
        userVote,
        upvotes,
        downvotes,
      });
    }

    return NextResponse.json({
      voteCount: 0,
      userVote: null,
      upvotes: 0,
      downvotes: 0,
    });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 },
    );
  }
}
