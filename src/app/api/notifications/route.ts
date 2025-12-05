import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

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

        // Find the Sanity user ID based on the Clerk ID
        const userQuery = defineQuery(`*[_type == "user" && (clerkId == $userId || _id == $userId)][0]._id`);
        const sanityUserId = await adminClient.fetch(userQuery, { userId });

        if (!sanityUserId) {
            return NextResponse.json({ success: true, notifications: [] });
        }

        const query = defineQuery(`*[_type == "notification" && recipient._ref == $sanityUserId] | order(createdAt desc) {
            _id,
            type,
            read,
            createdAt,
            sender->{
                username,
                imageUrl
            },
            question->{
                _id,
                title,
                slug
            }
        }`);

        const notifications = await adminClient.fetch(query, { sanityUserId });



        return NextResponse.json({
            success: true,
            notifications,
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

        await adminClient
            .patch(notificationId)
            .set({ read: true })
            .commit();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 }
        );
    }
}
