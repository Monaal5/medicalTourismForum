import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const { targetId, targetType, reason, userId } = await req.json();

        if (!targetId || !targetType || !reason || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Get internal user ID from Clerk ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (userError || !user) {
            console.error("Reporter user not found:", userId);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Create Report
        const { error: reportError } = await supabase
            .from('reports')
            .insert({
                reporter_id: user.id,
                target_type: targetType,
                target_id: targetId,
                reason: reason
            });

        if (reportError) {
            console.error("Error creating report:", reportError);
            return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
        }

        // 2. Mark item as reported (flagging)
        let table = '';
        if (targetType === 'post') table = 'posts';
        else if (targetType === 'question') table = 'questions';
        else if (targetType === 'answer') table = 'answers';
        else if (targetType === 'comment') table = 'comments';
        else if (targetType === 'user') table = 'users';

        if (table) {
            await supabase.from(table).update({ is_reported: true }).eq('id', targetId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in report API:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
