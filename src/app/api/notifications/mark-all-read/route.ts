import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

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

        // Get all unread notifications for this user
        const query = `*[_type == "notification" && recipient._ref == "${userId}" && !read]._id`;
        const notificationIds = await adminClient.fetch(query);

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
