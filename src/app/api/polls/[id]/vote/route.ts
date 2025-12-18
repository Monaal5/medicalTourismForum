import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: pollId } = await params;
        const { optionId } = await req.json();

        if (!optionId) {
            return NextResponse.json({ error: "Option ID required" }, { status: 400 });
        }

        // Get user's internal ID
        const { data: dbUser } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("clerk_id", user.id)
            .single();

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user already voted
        const { data: existingVote } = await supabaseAdmin
            .from("poll_votes")
            .select("id")
            .eq("poll_id", pollId)
            .eq("user_id", dbUser.id)
            .single();

        if (existingVote) {
            return NextResponse.json(
                { error: "You have already voted in this poll" },
                { status: 400 }
            );
        }

        // Record vote
        const { error: voteError } = await supabaseAdmin
            .from("poll_votes")
            .insert({
                poll_id: pollId,
                option_id: optionId,
                user_id: dbUser.id,
            });

        if (voteError) {
            console.error("Vote error:", voteError);
            return NextResponse.json(
                { error: "Failed to record vote" },
                { status: 500 }
            );
        }

        // Increment option vote count
        const { error: optionError } = await supabaseAdmin.rpc(
            "increment_poll_option_votes",
            { option_id: optionId }
        );

        // If RPC doesn't exist, do it manually
        if (optionError) {
            // Fallback: Fetch and update (not atomic, but valid TS)
            const { data: currentOption } = await supabaseAdmin
                .from("poll_options")
                .select("vote_count")
                .eq("id", optionId)
                .single();

            if (currentOption) {
                await supabaseAdmin
                    .from("poll_options")
                    .update({ vote_count: (currentOption.vote_count || 0) + 1 })
                    .eq("id", optionId);
            }
        }

        // Increment total poll votes
        const { error: pollRpcError } = await supabaseAdmin.rpc(
            "increment_poll_total_votes",
            { poll_id: pollId }
        );

        // If RPC doesn't exist, do it manually
        if (pollRpcError) {
            const { data: currentPoll } = await supabaseAdmin
                .from("polls")
                .select("total_votes")
                .eq("id", pollId)
                .single();

            if (currentPoll) {
                await supabaseAdmin
                    .from("polls")
                    .update({ total_votes: (currentPoll.total_votes || 0) + 1 })
                    .eq("id", pollId);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error recording vote:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
