import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function POST() {
    try {
        console.log("=== MIGRATING USERS TO ADD CLERKID ===");

        // Get all users without clerkId
        const usersWithoutClerkId = await adminClient.fetch(
            `*[_type == "user" && !defined(clerkId)] {
        _id,
        username,
        email
      }`
        );

        console.log(`Found ${usersWithoutClerkId.length} users without clerkId`);

        if (usersWithoutClerkId.length === 0) {
            return NextResponse.json({
                success: true,
                message: "All users already have clerkId",
                updated: 0,
            });
        }

        // For users whose _id starts with "user_", use that as clerkId
        const updates = [];
        for (const user of usersWithoutClerkId) {
            if (user._id.startsWith("user_")) {
                console.log(`Updating user ${user.username} with clerkId: ${user._id}`);

                const update = adminClient
                    .patch(user._id)
                    .set({ clerkId: user._id })
                    .commit();

                updates.push(update);
            }
        }

        await Promise.all(updates);

        console.log(`✓ Updated ${updates.length} users`);

        return NextResponse.json({
            success: true,
            message: `Updated ${updates.length} users with clerkId`,
            updated: updates.length,
        });
    } catch (error) {
        console.error("Error migrating users:", error);
        return NextResponse.json(
            { error: "Failed to migrate users" },
            { status: 500 }
        );
    }
}
