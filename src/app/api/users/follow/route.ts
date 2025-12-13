import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { targetUserId, action } = body;

        console.log("=== FOLLOW API ===");
        console.log("Target User ID (Sanity):", targetUserId);
        console.log("Action:", action);

        if (!targetUserId || !action) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get current user from Clerk
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        console.log("Clerk User ID:", clerkUserId);

        // Find current user in Sanity by Clerk ID
        const currentUser = await adminClient.fetch(
            `*[_type == "user" && clerkId == $userId][0]`,
            { userId: clerkUserId }
        );

        // Get target user
        const targetUser = await adminClient.fetch(
            `*[_type == "user" && _id == $targetUserId][0]`,
            { targetUserId }
        );

        console.log("Current user found:", currentUser ? currentUser.username : "NOT FOUND");
        console.log("Target user found:", targetUser ? targetUser.username : "NOT FOUND");

        if (!currentUser || !targetUser) {
            console.log("❌ User lookup failed");
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const currentSanityId = currentUser._id;
        const targetSanityId = targetUser._id;

        console.log("Current Sanity ID:", currentSanityId);
        console.log("Target Sanity ID:", targetSanityId);

        if (currentSanityId === targetSanityId) {
            return NextResponse.json(
                { error: "You cannot follow yourself" },
                { status: 400 }
            );
        }

        if (action === "follow") {
            console.log("✓ Following user...");

            // Add target to current user's following
            console.log("Step 1: Adding to current user's following array...");
            const followingUpdate = await adminClient
                .patch(currentSanityId)
                .setIfMissing({ following: [] })
                .append("following", [
                    {
                        _type: "reference",
                        _ref: targetSanityId,
                        _key: targetSanityId,
                    },
                ])
                .commit();

            console.log("Following update result:", followingUpdate);

            // Add current user to target's followers
            console.log("Step 2: Adding to target user's followers array...");
            const followersUpdate = await adminClient
                .patch(targetSanityId)
                .setIfMissing({ followers: [] })
                .append("followers", [
                    {
                        _type: "reference",
                        _ref: currentSanityId,
                        _key: currentSanityId,
                    },
                ])
                .commit();

            console.log("Followers update result:", followersUpdate);

            console.log("✓ Follow successful - both arrays updated");

            // Verify the update
            const verifyUser = await adminClient.fetch(
                `*[_type == "user" && _id == $userId][0]{ _id, username, following }`,
                { userId: currentSanityId }
            );
            console.log("Verification - Current user following array:", verifyUser?.following);

            // Create notification for the target user
            try {
                await adminClient.create({
                    _type: "notification",
                    type: "follow",
                    recipient: {
                        _type: "reference",
                        _ref: targetSanityId,
                    },
                    sender: {
                        _type: "reference",
                        _ref: currentSanityId,
                    },
                    read: false,
                    createdAt: new Date().toISOString(),
                });
                console.log("✓ Notification created");
            } catch (notifError) {
                console.error("Failed to create notification:", notifError);
                // Don't fail the request if notification creation fails
            }

        } else if (action === "unfollow") {
            console.log("✓ Unfollowing user...");
            // Remove target from current user's following
            await adminClient
                .patch(currentSanityId)
                .unset([`following[_ref=="${targetSanityId}"]`])
                .commit();

            // Remove current user from target's followers
            await adminClient
                .patch(targetSanityId)
                .unset([`followers[_ref=="${currentSanityId}"]`])
                .commit();

            console.log("✓ Unfollow successful");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("❌ Error managing follow:", error);
        return NextResponse.json(
            { error: "Failed to manage follow" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const targetId = searchParams.get("targetId");

        if (!targetId) {
            return NextResponse.json({ isFollowing: false });
        }

        // Get current user from Clerk
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return NextResponse.json({ isFollowing: false });
        }

        const user = await adminClient.fetch(
            `*[_type == "user" && clerkId == $userId][0]{ following }`,
            { userId: clerkUserId }
        );

        const isFollowing = user?.following?.some(
            (ref: any) => ref._ref === targetId
        ) || false;

        return NextResponse.json({ isFollowing });
    } catch (error) {
        console.error("Error checking follow status:", error);
        return NextResponse.json({ isFollowing: false });
    }
}
