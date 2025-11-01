import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { addUser } from "@/sanity/lib/user/addUser";
import { generateUsername } from "@/lib/username";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("=== API POST /api/comments ===");
    console.log("Received comment request body:", body);
    
    const {
      comment,
      content,  // For answer comments
      postId,
      answerId,
      parentCommentId,
      userId,
      userEmail,
      userFullName,
      userImageUrl,
    } = body;

    const commentText = comment || content;

    if (!commentText || (!postId && !answerId) || !userId) {
      console.log("❌ Missing required fields:", { 
        commentText: !!commentText, 
        postId: !!postId, 
        answerId: !!answerId, 
        userId: !!userId 
      });
      return NextResponse.json(
        { 
          error: "Missing required fields",
          details: "comment/content, (postId or answerId), and userId are required"
        },
        { status: 400 },
      );
    }

    // Verify answer or post exists
    if (answerId) {
      console.log("Verifying answer exists...");
      const answerExists = await adminClient.fetch(
        `*[_type == "answer" && _id == $answerId && !isDeleted][0]{ _id }`,
        { answerId }
      );
      
      if (!answerExists) {
        console.log("❌ Answer not found:", answerId);
        return NextResponse.json(
          { error: "Answer not found or has been deleted" },
          { status: 404 },
        );
      }
      console.log("✓ Answer exists");
    }

    // Ensure user exists in Sanity
    console.log("Creating/fetching user in Sanity...");
    const sanityUser = await addUser({
      id: userId,
      username: generateUsername(userFullName || "User", userId),
      email: userEmail || "user@example.com",
      imageUrl: userImageUrl || "",
    });
    console.log("✓ User created/found:", sanityUser._id);

    // Create the comment
    const commentData: any = {
      _type: "comment",
      comment: commentText,
      author: {
        _type: "reference",
        _ref: sanityUser._id,
      },
      createdAt: new Date().toISOString(),
      isReported: false,
      isDeleted: false,
    };

    // Add post or answer reference
    if (postId) {
      commentData.post = {
        _type: "reference",
        _ref: postId,
      };
    } else if (answerId) {
      commentData.answer = {
        _type: "reference",
        _ref: answerId,
      };
    }

    // Add parent comment reference if this is a reply
    if (parentCommentId) {
      commentData.parentComment = {
        _type: "reference",
        _ref: parentCommentId,
      };
    }

    console.log("Creating comment in Sanity...");
    const newComment = await adminClient.create(commentData);
    console.log("✓ Comment created successfully:", newComment._id, 'for', postId ? `post ${postId}` : `answer ${answerId}`);

    return NextResponse.json({ 
      success: true,
      comment: newComment,
      message: "Comment created successfully"
    });
  } catch (error) {
    console.error("❌ Error creating comment:", error);
    console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: "Failed to create comment",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 },
    );
  }
}
