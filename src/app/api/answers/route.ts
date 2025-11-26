import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { addUser } from "@/sanity/lib/user/addUser";
import { generateUsername } from "@/lib/username";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("=== API POST /api/answers ===");
    console.log("Received answer request body:", body);

    const {
      content,
      questionId,
      userId,
      userEmail,
      userFullName,
      userImageUrl,
    } = body;

    if (!content || !questionId || !userId) {
      console.log("❌ Missing required fields:", { content: !!content, questionId: !!questionId, userId: !!userId });
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "content, questionId, and userId are required"
        },
        { status: 400 },
      );
    }

    // Verify question exists
    console.log("Verifying question exists...");
    const questionExists = await adminClient.fetch(
      `*[_type == "question" && _id == $questionId && !isDeleted][0]{ _id }`,
      { questionId }
    );

    if (!questionExists) {
      console.log("❌ Question not found:", questionId);
      return NextResponse.json(
        { error: "Question not found or has been deleted" },
        { status: 404 },
      );
    }
    console.log("✓ Question exists");

    // Ensure user exists in Sanity
    console.log("Fetching/creating user in Sanity...");

    // First, check if user already exists by Clerk ID
    let sanityUser = await adminClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]`,
      { clerkId: userId }
    );

    if (sanityUser) {
      console.log("✓ Existing user found:", sanityUser._id, "with username:", sanityUser.username);
    } else {
      // User doesn't exist, create new one
      console.log("Creating new user in Sanity...");
      sanityUser = await addUser({
        id: userId,
        username: generateUsername(userFullName || "User", userId),
        email: userEmail || "user@example.com",
        imageUrl: userImageUrl || "",
      });
      console.log("✓ New user created:", sanityUser._id);
    }

    // Create the answer
    const answerData: any = {
      _type: "answer",
      content: [
        {
          _type: "block",
          children: [
            {
              _type: "span",
              text: content,
            },
          ],
        },
      ],
      question: {
        _type: "reference",
        _ref: questionId,
      },
      author: {
        _type: "reference",
        _ref: sanityUser._id,
      },
      isAccepted: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };

    console.log("Creating answer in Sanity...");
    const answer = await adminClient.create(answerData);
    console.log("✓ Answer created successfully:", answer._id);

    // Create notification for question author
    try {
      // Fetch question author
      const question = await adminClient.fetch(
        `*[_type == "question" && _id == $questionId][0]{ author->{ _id } }`,
        { questionId }
      );

      if (question?.author?._id && question.author._id !== sanityUser._id) {
        await adminClient.create({
          _type: "notification",
          recipient: {
            _type: "reference",
            _ref: question.author._id,
          },
          sender: {
            _type: "reference",
            _ref: sanityUser._id,
          },
          type: "answer",
          question: {
            _type: "reference",
            _ref: questionId,
          },
          read: false,
          createdAt: new Date().toISOString(),
        });
        console.log("✓ Notification created for question author");
      }
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      answer,
      message: "Answer created successfully"
    });
  } catch (error) {
    console.error("❌ Error creating answer:", error);
    console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        error: "Failed to create answer",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 },
    );
  }
}
