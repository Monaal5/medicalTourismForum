import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username");

        if (!username) {
            return NextResponse.json({ error: "Username required" }, { status: 400 });
        }

        console.log("=== TEST FOLLOWERS/FOLLOWING ===");
        console.log("Username:", username);

        // Query user with followers/following
        const query = `
      *[_type == "user" && username == $username][0] {
        _id,
        username,
        "followersCount": count(followers),
        "followingCount": count(following),
        "followersRaw": followers,
        "followingRaw": following,
        "followers": followers[]->{ _id, username, imageUrl },
        "following": following[]->{ _id, username, imageUrl }
      }
    `;

        const user = await adminClient.fetch(query, { username });

        console.log("User found:", user ? "YES" : "NO");
        if (user) {
            console.log("Followers count:", user.followersCount);
            console.log("Following count:", user.followingCount);
            console.log("Followers raw:", user.followersRaw);
            console.log("Following raw:", user.followingRaw);
            console.log("Followers resolved:", user.followers);
            console.log("Following resolved:", user.following);
        }

        return NextResponse.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}
