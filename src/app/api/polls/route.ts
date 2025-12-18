import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        const { question, categoryId, options, userId, isAdminPost, expires_in_days, post_id } = await req.json();

        if (!question || !options || !Array.isArray(options) || options.length < 2) {
            return NextResponse.json({ error: "Invalid poll data" }, { status: 400 });
        }

        // If not admin post, verify user
        let authorId = null;
        if (!isAdminPost) {
            const user = await currentUser();
            if (!user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            // Get Supabase user ID
            const { data: dbUser } = await supabase
                .from("users")
                .select("id")
                .eq("clerk_id", user.id)
                .single();

            if (!dbUser) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
            authorId = dbUser.id;
        }

        // Calculate expiry
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (expires_in_days || 7));

        // Create poll
        const { data: poll, error: pollError } = await supabaseAdmin
            .from("polls")
            .insert({
                question,
                category_id: categoryId || null,
                author_id: authorId, // null for admin posts
                post_id: post_id || null,
                total_votes: 0,
                expires_at: expiresAt.toISOString()
            })
            .select()
            .single();

        if (pollError) {
            console.error("Poll creation error:", pollError);
            return NextResponse.json({ error: pollError.message }, { status: 500 });
        }

        // Create poll options
        const pollOptions = options.map((option: string, index: number) => ({
            poll_id: poll.id,
            option_text: option,
            vote_count: 0,
            option_order: index,
        }));

        const { error: optionsError } = await supabaseAdmin
            .from("poll_options")
            .insert(pollOptions);

        if (optionsError) {
            console.error("Poll options error:", optionsError);
            // Rollback: delete the poll
            await supabaseAdmin.from("polls").delete().eq("id", poll.id);
            return NextResponse.json({ error: optionsError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, pollId: poll.id });
    } catch (error) {
        console.error("Error creating poll:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId");

        let query = supabase
            .from("polls")
            .select(`
                *,
                category:categories(name, slug),
                author:users(username),
                poll_options(id, option_text, vote_count, option_order)
            `)
            .order("created_at", { ascending: false });

        if (categoryId) {
            query = query.eq("category_id", categoryId);
        }

        const { data: polls, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ polls });
    } catch (error) {
        console.error("Error fetching polls:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
