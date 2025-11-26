import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        console.log("=== USER DIAGNOSTIC ===");
        console.log("Clerk User ID:", userId);

        // Try to find user by clerkId
        const userByClerkId = await adminClient.fetch(
            `*[_type == "user" && clerkId == $userId][0]`,
            { userId }
        );

        // Try to find user by _id
        const userById = await adminClient.fetch(
            `*[_type == "user" && _id == $userId][0]`,
            { userId }
        );

        console.log("User found by clerkId:", userByClerkId ? "YES" : "NO");
        console.log("User found by _id:", userById ? "YES" : "NO");

        if (userByClerkId) {
            console.log("User data (by clerkId):", userByClerkId);
        }
        if (userById) {
            console.log("User data (by _id):", userById);
        }

        return NextResponse.json({
            clerkUserId: userId,
            foundByClerkId: !!userByClerkId,
            foundById: !!userById,
            userByClerkId,
            userById,
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
