import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clerkId, newUsername } = body;

        if (!clerkId || !newUsername) {
            return NextResponse.json(
                { error: "Missing clerkId or newUsername" },
                { status: 400 }
            );
        }

        // Find user by Clerk ID
        const user = await adminClient.fetch(
            `*[_type == "user" && clerkId == $clerkId][0]{_id, username}`,
            { clerkId }
        );

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Update username
        const updatedUser = await adminClient
            .patch(user._id)
            .set({ username: newUsername })
            .commit();

        return NextResponse.json({
            success: true,
            message: `Username updated from "${user.username}" to "${newUsername}"`,
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating username:", error);
        return NextResponse.json(
            { error: "Failed to update username" },
            { status: 500 }
        );
    }
}
