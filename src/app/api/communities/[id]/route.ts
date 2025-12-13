import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { currentUser } from "@clerk/nextjs/server";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Fetch the community to verify ownership
        const community = await adminClient.fetch(
            `*[_type == "subreddit" && _id == $id][0]{
        moderator->{
          clerkId
        }
      }`,
            { id }
        );

        if (!community) {
            return NextResponse.json({ error: "Community not found" }, { status: 404 });
        }

        // Verify ownership
        if (community.moderator?.clerkId !== clerkUser.id) {
            return NextResponse.json(
                { error: "You can only delete communities you moderate" },
                { status: 403 }
            );
        }

        // Soft delete
        await adminClient.patch(id).set({ isDeleted: true }).commit();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting community:", error);
        return NextResponse.json(
            { error: "Failed to delete community" },
            { status: 500 }
        );
    }
}
