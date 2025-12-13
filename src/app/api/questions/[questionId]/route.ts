import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { currentUser } from "@clerk/nextjs/server";
import { defineQuery } from "groq";

// GET method to fetch question with answers and comments
export async function GET(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;

    console.log('=== API GET /api/questions/[questionId] ===');
    console.log('Question ID:', questionId);
    console.log('Request URL:', request.url);

    // First, try a simple query to see if the question exists at all
    const simpleCheckQuery = `*[_type == "question" && _id == $questionId][0]{ _id, title, isDeleted }`;
    console.log('Running simple check query...');

    const simpleCheck = await adminClient.fetch(simpleCheckQuery, { questionId });
    console.log('Simple check result:', simpleCheck);

    if (!simpleCheck) {
      console.log('❌ Question not found in database');
      return NextResponse.json(
        {
          success: false,
          error: "Question not found",
          questionId,
          message: "This question does not exist in the database"
        },
        { status: 404 }
      );
    }

    if (simpleCheck.isDeleted) {
      console.log('❌ Question is marked as deleted');
      return NextResponse.json(
        {
          success: false,
          error: "Question has been deleted",
          questionId
        },
        { status: 404 }
      );
    }

    console.log('✓ Question exists, fetching full details...');

    // Simplified query to avoid nested query issues
    const questionQuery = `
      *[_type == "question" && _id == $questionId && !isDeleted][0] {
        _id,
        title,
        description,
        author->{
          _id,
          username,
          imageUrl,
          bio,
          clerkId
        },
        category->{
          name,
          color,
          slug
        },
        tags,
        createdAt,
        updatedAt,
        "answerCount": count(*[_type == "answer" && references(^._id) && !isDeleted]),
        "viewCount": 0,
        "followerCount": 0,
        "isFollowing": false,
        "isBookmarked": false
      }
    `;

    console.log('Executing question query...');
    const question = await adminClient.fetch(questionQuery, { questionId });

    console.log('Question fetch result:', question ? 'Found' : 'Not found');

    if (!question) {
      console.log('❌ Query returned no result');
      return NextResponse.json(
        {
          success: false,
          error: "Question not found"
        },
        { status: 404 }
      );
    }

    // Fetch answers separately to avoid complex nested queries
    const answersQuery = `
      *[_type == "answer" && references($questionId) && !isDeleted] | order(createdAt desc) {
        _id,
        content,
        author->{
          _id,
          username,
          imageUrl,
          bio,
          clerkId
        },
        createdAt,
        updatedAt,
        "voteCount": 0,
        "userVote": null,
        "isAccepted": false,
        "commentCount": 0,
        "comments": *[_type == "comment" && answer._ref == ^._id && !isDeleted] | order(createdAt asc) {
          _id,
          comment,
          createdAt,
          author->{
            username,
            imageUrl,
            clerkId
          }
        }
      }
    `;

    console.log('Fetching answers...');
    const answers = await adminClient.fetch(answersQuery, { questionId });
    console.log('Answers found:', answers?.length || 0);

    // Add answers to question
    question.answers = answers || [];

    console.log('✓ Returning question successfully');
    return NextResponse.json({
      success: true,
      question
    });
  } catch (error) {
    console.error("❌ Error fetching question:", error);
    console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch question",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> },
) {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;

    console.log('=== DELETE QUESTION API ===');
    console.log('Question ID:', questionId);
    console.log('Clerk User ID:', clerkUser.id);

    // Get the current user's Sanity username
    const currentSanityUser = await adminClient.fetch(
      `*[_type == "user" && clerkId == $userId][0]{ username }`,
      { userId: clerkUser.id }
    );

    console.log('Current Sanity User:', currentSanityUser);

    if (!currentSanityUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Fetch the question to verify ownership
    const question = await adminClient.fetch(
      `*[_type == "question" && _id == $questionId][0]{
        _id,
        author->{
          username
        }
      }`,
      { questionId },
    );

    console.log('Question data:', question);
    console.log('Question author username:', question?.author?.username);
    console.log('Current user username:', currentSanityUser.username);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    // Verify the user owns this question by comparing usernames
    if (question.author?.username?.toLowerCase() !== currentSanityUser.username?.toLowerCase()) {
      console.log('❌ Ownership check failed');
      return NextResponse.json(
        {
          error: "You can only delete your own questions",
          details: `Author: ${question.author?.username}, Current: ${currentSanityUser.username}`
        },
        { status: 403 },
      );
    }

    console.log('✅ Ownership verified, deleting question...');

    // Soft delete by setting isDeleted flag
    await adminClient.patch(questionId).set({ isDeleted: true }).commit();

    console.log('✅ Question deleted successfully');

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 },
    );
  }
}


