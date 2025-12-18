import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const { postId } = await params;

        // Fetch current view count
        // Note: This assumes 'view_count' column exists on 'posts' table.
        const { data: post, error: fetchError } = await supabase
            .from('posts')
            .select('view_count')
            .eq('id', postId)
            .single();

        if (fetchError) {
            // If column doesn't exist, this will error. 
            // We can't fix schema from here, so we just log and return error.
            console.error("Error fetching post for view increment:", fetchError);
            return NextResponse.json(
                { error: "Post not found or view_count not supported" },
                { status: 404 }
            );
        }

        const newCount = (post.view_count || 0) + 1;

        // Update view count
        const { error: updateError } = await supabase
            .from('posts')
            .update({ view_count: newCount })
            .eq('id', postId);

        if (updateError) {
            console.error("Error updating post view count:", updateError);
            return NextResponse.json(
                { error: "Failed to update view count" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, viewCount: newCount });
    } catch (error) {
        console.error("Error in view increment API:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
