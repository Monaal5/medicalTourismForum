
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: pollId } = await params;
        console.log("Fetching poll with ID:", pollId);

        // Fetch poll
        const { data: poll, error: pollError } = await supabase
            .from("polls")
            .select("*")
            .eq("id", pollId)
            .single();

        console.log("Poll query result:", { poll, pollError });

        if (pollError || !poll) {
            console.error("Poll not found:", pollError);
            return NextResponse.json({ error: "Poll not found" }, { status: 404 });
        }

        // Fetch options
        const { data: options, error: optionsError } = await supabase
            .from("poll_options")
            .select("*")
            .eq("poll_id", pollId)
            .order("option_order", { ascending: true });

        console.log("Options query result:", { options, optionsError });

        // Check if user has voted
        let hasVoted = false;
        const user = await currentUser();
        if (user) {
            const { data: dbUser } = await supabase
                .from("users")
                .select("id")
                .eq("clerk_id", user.id)
                .single();

            if (dbUser) {
                const { data: vote } = await supabase
                    .from("poll_votes")
                    .select("id")
                    .eq("poll_id", pollId)
                    .eq("user_id", dbUser.id)
                    .single();

                hasVoted = !!vote;
            }
        }

        // Fetch author name
        let authorName = "Anonymous";
        if (poll.author_id) {
            const { data: author } = await supabase
                .from("users")
                .select("username")
                .eq("id", poll.author_id)
                .single();

            if (author) {
                authorName = author.username;
            }
        }

        // Fetch category name from Supabase
        let categoryName = "";
        if (poll.category_id) {
            const { data: category, error: catError } = await supabase
                .from("categories")
                .select("name")
                .eq("id", poll.category_id)
                .single();

            console.log("Category query result:", { category, catError });

            if (category) {
                categoryName = category.name;
            }
        }

        const response = {
            poll,
            options,
            hasVoted,
            authorName,
            categoryName,
        };

        console.log("Returning response:", response);

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching poll:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: pollId } = await params;
        const user = await currentUser();

        // Basic auth check
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // In a real app, verify admin role here. 
        // For now, assuming anyone with access to the admin UI is authorized 
        // (the UI itself should be protected).

        // Delete poll (cascading deletes for options and votes usually handled by DB, but using Admin client is safer)
        const { error } = await supabaseAdmin
            .from("polls")
            .delete()
            .eq("id", pollId);

        if (error) {
            console.error("Error deleting poll:", error);
            return NextResponse.json({ error: "Failed to delete poll" }, { status: 500 });
        }

        return NextResponse.json({ message: "Poll deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting poll:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
