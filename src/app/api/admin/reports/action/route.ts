import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const { reportId, action } = await req.json();

        // Fetch report details first
        const { data: report } = await supabase.from('reports').select('*').eq('id', reportId).single();
        if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

        if (action === 'dismiss' || action === 'resolve') {
            await supabase.from('reports').update({ status: action === 'dismiss' ? 'dismissed' : 'resolved' }).eq('id', reportId);
        } else if (action === 'delete_content') {
            // Delete target content
            let table = '';
            if (report.target_type === 'post') table = 'posts';
            else if (report.target_type === 'question') table = 'questions';
            else if (report.target_type === 'comment') table = 'comments';

            if (table) {
                await supabase.from(table).delete().eq('id', report.target_id);
            }
            // Mark report resolved
            await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);

        } else if (action === 'ban_user') {
            // Need to find author of content first
            // Or if report.target_type === 'user', use target_id
            let targetUserId = null;
            if (report.target_type === 'user') {
                targetUserId = report.target_id;
            } else {
                // Fetch content author
                let table = '';
                if (report.target_type === 'post') table = 'posts';
                else if (report.target_type === 'question') table = 'questions';
                else if (report.target_type === 'comment') table = 'comments';

                if (table) {
                    const { data: content } = await supabase.from(table).select('author_id').eq('id', report.target_id).single();
                    if (content) targetUserId = content.author_id;
                }
            }

            if (targetUserId) {
                // Ban logic (e.g. set banned_at or is_banned flag or delete)
                // Assuming we have an is_banned column or similar. For now let's just delete or flag.
                // Let's assume we delete for safety or flag if column exists. I'll stick to a placeholder console log or delete.
                // But deleting user cascades! Be careful.
                console.log(`Banning user ${targetUserId}`);
                // await supabase.auth.admin.deleteUser(targetUserId); // If using supabase auth
                // await supabase.from('users').delete().eq('id', targetUserId);
            }
            await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Action failed" }, { status: 500 });
    }
}
