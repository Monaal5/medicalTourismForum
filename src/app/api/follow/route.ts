
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { targetUserId, action } = await request.json(); // userId of user to follow, action='follow'|'unfollow'

        if (!targetUserId) {
            return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
        }

        // Get current user DB ID
        const { data: currentUserDb } = await supabase.from('users').select('id, username').eq('clerk_id', user.id).single();
        if (!currentUserDb) return NextResponse.json({ error: "Current user not found" }, { status: 404 });

        // Implementation for Followers table needed
        // Assuming table 'followers' (follower_id, following_id)

        if (action === 'follow') {
            const { error } = await supabase
                .from('followers')
                .insert({
                    follower_id: currentUserDb.id,
                    following_id: targetUserId
                });

            if (error) {
                if (error.code === '23505') { // Unique violation = already following
                    return NextResponse.json({ success: true, message: "Already following" });
                }
                throw error;
            }

            // Notify
            await createNotification({
                recipientId: targetUserId,
                senderId: currentUserDb.id,
                type: 'follow'
            });

            return NextResponse.json({ success: true, message: "Followed successfully" });

        } else if (action === 'unfollow') {
            const { error } = await supabase
                .from('followers')
                .delete()
                .match({
                    follower_id: currentUserDb.id,
                    following_id: targetUserId
                });

            if (error) throw error;
            return NextResponse.json({ success: true, message: "Unfollowed successfully" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("Error in follow API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
