import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId } = body;

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
            return NextResponse.json({ success: true, updated: 0 });
        }

        // Get all unread notifications for this user
        const query = defineQuery(`*[_type == "notification" && recipient._ref == $sanityUserId && !read]._id`);
        const notificationIds = await adminClient.fetch(query, { sanityUserId });

        // Mark all as read
        if (notificationIds.length > 0) {
            const transaction = adminClient.transaction();
            notificationIds.forEach((id: string) => {
                transaction.patch(id, { set: { read: true } });
            });
            await transaction.commit();
        }

        return NextResponse.json({
            success: true,
            updated: notificationIds.length
        });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return NextResponse.json(
            { error: "Failed to mark notifications as read" },
            { status: 500 }
        );
    }
}
