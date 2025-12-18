import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { questionId, userId, action } = body;

        if (!questionId || !userId || !action) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get User
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (action === "add") {
            const { error } = await supabase
                .from('bookmarks')
                .insert({
                    user_id: user.id,
                    question_id: questionId
                });

            // Ignore uniqueness violation (already bookmarked)
            if (error && error.code !== '23505') {
                throw error;
            }
        } else if (action === "remove") {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('user_id', user.id)
                .eq('question_id', questionId);

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error managing bookmark:", error);
        return NextResponse.json(
            { error: "Failed to manage bookmark" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ bookmarks: [] });
        }

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!user) {
            return NextResponse.json({ bookmarks: [] });
        }

        const { data: bookmarks } = await supabase
            .from('bookmarks')
            .select('question_id')
            .eq('user_id', user.id);

        return NextResponse.json({
            bookmarks: bookmarks?.map((b: any) => b.question_id) || []
        });
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        return NextResponse.json({ bookmarks: [] });
    }
}
