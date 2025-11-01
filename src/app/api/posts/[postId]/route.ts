import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { currentUser } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;

    console.log('=== DELETE POST API ===');
    console.log('Post ID:', postId);
    console.log('Clerk User ID:', clerkUser.id);

    // Get the current user's Sanity username
    const currentSanityUser = await adminClient.fetch(
      `*[_type == "user" && _id == $userId][0]{ username }`,
      { userId: clerkUser.id }
    );

    console.log('Current Sanity User:', currentSanityUser);

    if (!currentSanityUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Fetch the post to verify ownership
    const post = await adminClient.fetch(
      `*[_type == "post" && _id == $postId][0]{
        _id,
        author->{
          username
        }
      }`,
      { postId }
    );

    console.log('Post data:', post);
    console.log('Post author username:', post?.author?.username);
    console.log('Current user username:', currentSanityUser.username);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify the user owns this post by comparing usernames
    if (post.author?.username?.toLowerCase() !== currentSanityUser.username?.toLowerCase()) {
      console.log('❌ Ownership check failed');
      return NextResponse.json(
        { 
          error: "You can only delete your own posts",
          details: `Author: ${post.author?.username}, Current: ${currentSanityUser.username}`
        },
        { status: 403 }
      );
    }

    console.log('✅ Ownership verified, deleting post...');

    // Soft delete by setting isDeleted flag
    await adminClient.patch(postId).set({ isDeleted: true }).commit();

    console.log('✅ Post deleted successfully');

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

