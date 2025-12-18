import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "Missing userId" },
                { status: 400 }
            );
        }

        // Find the Supabase user ID based on the Clerk ID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!user) {
            return NextResponse.json({ success: true, notifications: [] });
        }

        const { data: notifications, error } = await supabase
            .from('notifications')
            .select(`
id,
    type,
    read,
    created_at,
    sender: users!sender_id(
        username,
        image_url
    ),
        question: questions(
            id,
            title
        )
            `)
            .eq('recipient_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching notifications query:", error);
            throw error;
        }

        const mappedNotifications = notifications.map((n: any) => ({
            _id: n.id,
            type: n.type,
            read: n.read,
            createdAt: n.created_at,
            sender: {
                username: n.sender?.username || "Unknown",
                imageUrl: n.sender?.image_url
            },
            question: n.question ? {
                _id: n.question.id,
                title: n.question.title,
                slug: { current: n.question.id } // Use ID as slug or fetch slug if exists
            } : null
        }));

        return NextResponse.json({
            success: true,
            notifications: mappedNotifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { notificationId } = body;

        if (!notificationId) {
            return NextResponse.json(
                { error: "Missing notificationId" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 }
        );
    }
}
