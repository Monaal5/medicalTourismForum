import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "groq";
import { generateUsername } from "@/lib/username";
import { addUser } from "@/sanity/lib/user/addUser";

export async function GET() {
  try {
    const { userId } = await auth();

    console.log("=== GET CURRENT USER API ===");
    console.log("Clerk User ID:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists in Sanity by clerkId
    const currentUserQuery = defineQuery(`
      *[_type == "user" && clerkId == $userId][0] {
        _id,
        username,
        email,
        imageUrl,
        clerkId
      }
    `);

    const result = await sanityFetch({
      query: currentUserQuery,
      params: { userId },
    });

    console.log("User found in Sanity:", result.data ? result.data.username : "NOT FOUND");

    if (result.data?.username) {
      // User exists, return their username
      return NextResponse.json({
        success: true,
        username: result.data.username,
        exists: true,
      });
    }

    // User doesn't exist in Sanity
    console.log("User not found in Sanity, needs to be created");
    return NextResponse.json({
      success: false,
      username: null,
      exists: false,
      message: "User not found in Sanity",
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, email, imageUrl } = body;

    // Generate consistent username
    const username = generateUsername(fullName || "User", userId);

    // Create or update user in Sanity
    const sanityUser = await addUser({
      id: userId,
      username,
      email: email || "user@example.com",
      imageUrl: imageUrl || "",
    });

    return NextResponse.json({
      success: true,
      username: sanityUser.username,
      user: sanityUser,
    });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      { error: "Failed to create/update user" },
      { status: 500 }
    );
  }
}
