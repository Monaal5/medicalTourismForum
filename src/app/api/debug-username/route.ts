import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const clerkId = searchParams.get("clerkId");

        if (!clerkId) {
            return NextResponse.json(
                { error: "Missing clerkId parameter" },
                { status: 400 }
            );
        }

        // Fetch user by Clerk ID
        const user = await adminClient.fetch(
            `*[_type == "user" && clerkId == $clerkId][0]{
        _id,
        username,
        email,
        clerkId,
        imageUrl
      }`,
            { clerkId }
        );

        if (!user) {
            return NextResponse.json(
                { error: "User not found in Sanity" },
                { status: 404 }
            );
        }

        // Fetch recent answers by this user
        const answers = await adminClient.fetch(
            `*[_type == "answer" && author._ref == $userId] | order(createdAt desc) [0...5] {
        _id,
        createdAt,
        author->{
          _id,
          username,
          clerkId
        }
      }`,
            { userId: user._id }
        );

        return NextResponse.json({
            success: true,
            user,
            recentAnswers: answers,
            message: `Found user with username: ${user.username}`
        });
    } catch (error) {
        console.error("Error in debug endpoint:", error);
        return NextResponse.json(
            { error: "Failed to fetch user data" },
            { status: 500 }
        );
    }
}
