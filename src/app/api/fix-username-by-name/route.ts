import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username");
        const newUsername = searchParams.get("newUsername");

        if (!username || !newUsername) {
            return NextResponse.json(
                {
                    error: "Missing parameters",
                    usage: "GET /api/fix-username-by-name?username=monaalmamen&newUsername=Monaal6157"
                },
                { status: 400 }
            );
        }

        console.log("=== FIXING USERNAME BY CURRENT USERNAME ===");
        console.log("Current Username:", username);
        console.log("New Username:", newUsername);

        // Find user by current username
        const user = await adminClient.fetch(
            `*[_type == "user" && username == $username][0]{
        _id, 
        username, 
        email,
        clerkId
      }`,
            { username }
        );

        if (!user) {
            console.log("❌ User not found with username:", username);

            // Try to list all users to help debug
            const allUsers = await adminClient.fetch(
                `*[_type == "user"][0...10]{_id, username, email, clerkId}`
            );

            return NextResponse.json(
                {
                    error: "User not found with this username",
                    availableUsers: allUsers.map((u: any) => ({
                        username: u.username,
                        clerkId: u.clerkId || "NO CLERK ID"
                    }))
                },
                { status: 404 }
            );
        }

        console.log("✓ Found user:", user._id);
        console.log("Current username:", user.username);
        console.log("Clerk ID:", user.clerkId || "NOT SET");

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
            userId: updatedUser._id,
            clerkId: updatedUser.clerkId || "NOT SET"
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
