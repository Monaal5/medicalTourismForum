
import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;

    // 1. Fetch Post to check owner
    const { data: post, error } = await supabase
      .from('posts')
      .select('author_id, author:users!author_id(clerk_id)')
      .eq('id', postId)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 2. Check Ownership
    const author = Array.isArray(post.author) ? post.author[0] : post.author;
    const isOwner = author?.clerk_id === user.id;
    const isAdmin = user.emailAddresses[0]?.emailAddress === 'monaalmamen@gmail.com';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized: You can only delete your own posts" }, { status: 403 });
    }

    // 3. Delete
    // Cascade delete handles comments/images if configured, or we assume simple delete for now.
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post: " + error.message },
      { status: 500 }
    );
  }
}
