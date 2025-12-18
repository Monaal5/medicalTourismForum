import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { pollId, optionId } = await req.json();

        // Get internal user ID
        const { data: dbUser } = await supabase.from('users').select('id').eq('clerk_id', user.id).single();
        if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Check if user already voted
        const { data: existingVote } = await supabase
            .from('poll_votes')
            .select('*')
            .eq('poll_id', pollId)
            .eq('user_id', dbUser.id)
            .single();

        if (existingVote) {
            return NextResponse.json({ error: "Already voted" }, { status: 400 });
        }

        // Insert Vote
        const { error: voteError } = await supabase
            .from('poll_votes')
            .insert({
                poll_id: pollId,
                option_id: optionId,
                user_id: dbUser.id
            });

        if (voteError) throw voteError;

        // Increment option count
        // Using RPC or raw query is better for concurrency, but for simple app:
        // We can use the rpc 'increment_vote' if we created one, or just fetch-update (risky race condition)
        // For now, let's just insert. The count can be aggregated from votes table or we trigger a function.
        // Let's rely on aggregation for display or a simple update.

        // Simple update (race condition possible but acceptable for MVP)
        const { data: option } = await supabase.from('poll_options').select('vote_count').eq('id', optionId).single();
        await supabase.from('poll_options').update({ vote_count: (option?.vote_count || 0) + 1 }).eq('id', optionId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Vote error:", error);
        return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
    }
}
