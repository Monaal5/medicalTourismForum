import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { questionId, userId, action } = body;

        if (!questionId || !userId || !action) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Since we don't have the Sanity User ID directly from Clerk ID in all cases,
        // we should fetch the user first.
        const user = await adminClient.fetch(
            `*[_type == "user" && clerkId == $userId][0]`,
            { userId }
        );

        // If user not found by clerkId, maybe userId IS the sanity ID (fallback)
        const sanityUserId = user ? user._id : userId;

        if (action === "add") {
            await adminClient
                .patch(sanityUserId)
                .setIfMissing({ bookmarks: [] })
                .append("bookmarks", [
                    {
                        _type: "reference",
                        _ref: questionId,
                        _key: questionId, // Use questionId as key to prevent duplicates if possible, or generate unique key
                    },
                ])
                .commit();
        } else if (action === "remove") {
            await adminClient
                .patch(sanityUserId)
                .unset([`bookmarks[_ref=="${questionId}"]`])
                .commit();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error managing bookmark:", error);
        return NextResponse.json(
            { error: "Failed to manage bookmark" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ bookmarks: [] });
        }

        const user = await adminClient.fetch(
            `*[_type == "user" && clerkId == $userId][0]{ bookmarks }`,
            { userId }
        );

        // If user not found by clerkId, try fetching by _id directly
        let bookmarks = user?.bookmarks || [];
        if (!user) {
            const userById = await adminClient.fetch(
                `*[_type == "user" && _id == $userId][0]{ bookmarks }`,
                { userId }
            );
            bookmarks = userById?.bookmarks || [];
        }

        return NextResponse.json({
            bookmarks: bookmarks.map((b: any) => b._ref)
        });
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        return NextResponse.json({ bookmarks: [] });
    }
}
