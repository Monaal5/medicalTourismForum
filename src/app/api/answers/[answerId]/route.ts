import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ answerId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answerId } = await params;

    // Fetch the answer to verify ownership
    const answer = await adminClient.fetch(
      `*[_type == "answer" && _id == $answerId][0]{
        _id,
        author->{
          clerkId
        }
      }`,
      { answerId }
    );

    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    // Verify the user owns this answer
    if (answer.author?.clerkId !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own answers" },
        { status: 403 }
      );
    }

    // Soft delete by setting isDeleted flag
    await adminClient.patch(answerId).set({ isDeleted: true }).commit();

    return NextResponse.json({
      success: true,
      message: "Answer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting answer:", error);
    return NextResponse.json(
      { error: "Failed to delete answer" },
      { status: 500 }
    );
  }
}

