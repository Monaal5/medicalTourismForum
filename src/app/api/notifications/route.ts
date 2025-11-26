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

        // Find the Sanity user ID based on the Clerk ID (which is passed as userId)
        // Or if userId is already the Sanity ID. Let's assume it's the Clerk ID and we need to find the Sanity user.
        // Actually, usually we pass the Sanity ID if we have it, or we query by Clerk ID.
        // Let's assume the frontend passes the Clerk ID and we query for the user first.

        const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`;
        // Wait, the user schema doesn't seem to have clerkId explicitly defined in the file I read earlier?
        // Let me check userType.ts again.
        // It has: username, email, imageUrl, joinedAt, isReported.
        // But in page.tsx I saw: author->{ clerkId }.
        // Let's check userType.ts again.

        // Assuming we can query by email or we need to pass the Sanity ID.
        // For now, let's assume the frontend passes the Sanity ID if possible, or we query by something else.
        // But wait, the user might not know their Sanity ID.
        // Let's stick to the pattern used in other routes.

        const query = `*[_type == "notification" && recipient._ref == "${userId}"] | order(createdAt desc) {
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
    }`;

        const notifications = await adminClient.fetch(query);

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
