import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { location, education, employment } = body;

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

        // Construct update object with only defined fields
        const updates: any = {};
        if (location !== undefined) updates.location = location;
        if (education !== undefined) updates.education = education;
        if (employment !== undefined) updates.employment = employment;

        await adminClient
            .patch(currentUser._id)
            .set(updates)
            .commit();

        return NextResponse.json({ success: true, ...updates });
    } catch (error) {
        console.error("Error updating credentials:", error);
        return NextResponse.json(
            { error: "Failed to update credentials" },
            { status: 500 }
        );
    }
}
