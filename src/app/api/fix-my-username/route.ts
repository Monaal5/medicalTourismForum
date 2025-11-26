import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const clerkId = searchParams.get("clerkId");
        const newUsername = searchParams.get("newUsername");

        if (!clerkId || !newUsername) {
            return NextResponse.json(
                {
                    error: "Missing parameters",
                    usage: "GET /api/fix-my-username?clerkId=YOUR_CLERK_ID&newUsername=Monaal6157"
                },
                { status: 400 }
            );
        }

        console.log("=== FIXING USERNAME ===");
        console.log("Clerk ID:", clerkId);
        console.log("New Username:", newUsername);

        // Find user by Clerk ID
        const user = await adminClient.fetch(
            `*[_type == "user" && clerkId == $clerkId][0]{
        _id, 
        username, 
        email,
        clerkId
      }`,
            { clerkId }
        );

        if (!user) {
            console.log("❌ User not found with Clerk ID:", clerkId);
            return NextResponse.json(
                { error: "User not found with this Clerk ID" },
                { status: 404 }
            );
        }

        console.log("✓ Found user:", user._id);
        console.log("Current username:", user.username);

        // Check if username is already correct
        if (user.username === newUsername) {
            console.log("✓ Username is already correct!");
            return NextResponse.json({
                success: true,
                message: "Username is already set to " + newUsername,
                user
            });
        }

        // Update username
        console.log("Updating username to:", newUsername);
        const updatedUser = await adminClient
            .patch(user._id)
            .set({ username: newUsername })
            .commit();

        console.log("✓ Username updated successfully!");

        return NextResponse.json({
            success: true,
            message: `Username updated from "${user.username}" to "${newUsername}"`,
            oldUsername: user.username,
            newUsername: updatedUser.username,
            userId: updatedUser._id
        });
    } catch (error) {
        console.error("❌ Error updating username:", error);
        return NextResponse.json(
            {
                error: "Failed to update username",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
