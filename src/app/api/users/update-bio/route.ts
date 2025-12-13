import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bio } = body;

        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Find current user in Sanity by Clerk ID
        const currentUser = await adminClient.fetch(
            `*[_type == "user" && clerkId == $userId][0]`,
            { userId: clerkUserId }
        );

        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        await adminClient
            .patch(currentUser._id)
            .set({ bio: bio })
            .commit();

        return NextResponse.json({ success: true, bio });
    } catch (error) {
        console.error("Error updating bio:", error);
        return NextResponse.json(
            { error: "Failed to update bio" },
            { status: 500 }
        );
    }
}
