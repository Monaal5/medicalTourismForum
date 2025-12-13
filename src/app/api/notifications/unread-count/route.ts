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
        const userQueryNotifyCount = defineQuery(`*[_type == "user" && (clerkId == $userId || _id == $userId)][0]._id`);
        const sanityUserId = await adminClient.fetch(userQueryNotifyCount, { userId });

        if (!sanityUserId) {
            return NextResponse.json({ success: true, count: 0 });
        }

        const unreadNotificationsCountQuery = defineQuery(`count(*[_type == "notification" && recipient._ref == $sanityUserId && !read])`);

        const count = await adminClient.fetch(unreadNotificationsCountQuery, { sanityUserId });

        return NextResponse.json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return NextResponse.json(
            { error: "Failed to fetch unread count" },
            { status: 500 }
        );
    }
}
