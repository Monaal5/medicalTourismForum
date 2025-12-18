import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { targetUserId, action } = body;

        if (!targetUserId || !action) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get current user from Clerk
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Get current user's Supabase ID
        const { data: currentUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', clerkUserId)
            .single();

        if (userError || !currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (currentUser.id === targetUserId) {
            return NextResponse.json(
                { error: "You cannot follow yourself" },
                { status: 400 }
            );
        }

        if (action === "follow") {
            // Check if already following to prevent duplicate error
            const { data: existing } = await supabase
                .from('followers')
                .select('*')
                .eq('follower_id', currentUser.id)
                .eq('following_id', targetUserId)
                .single();

            if (existing) {
                return NextResponse.json({ success: true });
            }

            const { error: followError } = await supabase
                .from('followers')
                .insert({
                    follower_id: currentUser.id,
                    following_id: targetUserId
                });

            if (followError) {
                console.error("Follow insert error:", followError);
                return NextResponse.json({ error: "Failed to follow: " + followError.message }, { status: 500 });
            }

            // Create notification
            await createNotification({
                recipientId: targetUserId,
                senderId: currentUser.id,
                type: 'follow'
            });

        } else if (action === "unfollow") {
            const { error: unfollowError } = await supabase
                .from('followers')
                .delete()
                .eq('follower_id', currentUser.id)
                .eq('following_id', targetUserId);

            if (unfollowError) {
                console.error("Unfollow error:", unfollowError);
                return NextResponse.json({ error: "Failed to unfollow: " + unfollowError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error managing follow:", error);
        return NextResponse.json(
            { error: error.message || "Failed to manage follow" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const targetId = searchParams.get("targetId");

        if (!targetId) {
            return NextResponse.json({ isFollowing: false });
        }

        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json({ isFollowing: false });
        }

        const { data: currentUser } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', clerkUserId)
            .single();

        if (!currentUser) return NextResponse.json({ isFollowing: false });

        const { count, error } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', currentUser.id)
            .eq('following_id', targetId);

        return NextResponse.json({ isFollowing: !!count && count > 0 });

    } catch (error) {
        console.error("Error checking follow status:", error);
        return NextResponse.json({ isFollowing: false });
    }
}
