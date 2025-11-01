import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;

    // Fetch the comment to verify ownership
    const comment = await adminClient.fetch(
      `*[_type == "comment" && _id == $commentId][0]{
        _id,
        author->{
          clerkId
        }
      }`,
      { commentId }
    );

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Verify the user owns this comment
    if (comment.author?.clerkId !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    // Soft delete by setting isDeleted flag
    await adminClient.patch(commentId).set({ isDeleted: true }).commit();

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}

