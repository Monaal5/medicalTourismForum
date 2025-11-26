import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function POST() {
    try {
        console.log("=== FIXING USER CLERKID ===");

        const userId = "user_34Ap7w8zb07qG5PGlnFRS8l0O67";
        const clerkId = "user_34Ap7w8zb07qG5PGlnFRS8l0O67";

        console.log("Updating user:", userId);
        console.log("Setting clerkId to:", clerkId);

        // Update the user to add clerkId
        const result = await adminClient
            .patch(userId)
            .set({ clerkId: clerkId })
            .commit();

        console.log("✓ Update successful:", result);

        return NextResponse.json({
            success: true,
            message: "Added clerkId to user",
            user: result,
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}
