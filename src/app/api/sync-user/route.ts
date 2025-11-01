import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { addUser } from "@/sanity/lib/user/addUser";
import { generateUsername } from "@/lib/username";
import { defineQuery } from "groq";
import { sanityFetch } from "@/sanity/lib/live";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      userFullName,
      userEmail,
      userImageUrl,
      forceUpdate = false,
    } = body;

    console.log("Syncing user:", userId);

    // Check if user exists in Sanity
    const existingUserQuery = defineQuery(`
      *[_type == "user" && _id == $userId][0] {
        _id,
        username,
        email,
        imageUrl
      }
    `);

    const existingUser = await sanityFetch({
      query: existingUserQuery,
      params: { userId },
    });

    if (existingUser.data && !forceUpdate) {
      // User exists and no force update requested
      return NextResponse.json({
        success: true,
        action: "no_change",
        user: existingUser.data,
        message: "User already exists in Sanity",
      });
    }

    // Generate consistent username
    const username = generateUsername(userFullName || "User", userId);

    if (existingUser.data && forceUpdate) {
      // Update existing user
      const updatedUser = await adminClient
        .patch(userId)
        .set({
          username,
          email: userEmail || existingUser.data.email,
          imageUrl: userImageUrl || existingUser.data.imageUrl,
        })
        .commit();

      return NextResponse.json({
        success: true,
        action: "updated",
        user: updatedUser,
        message: "User updated successfully",
      });
    } else {
      // Create new user
      const newUser = await addUser({
        id: userId,
        username,
        email: userEmail || "user@example.com",
        imageUrl: userImageUrl || "",
      });

      return NextResponse.json({
        success: true,
        action: "created",
        user: newUser,
        message: "User created successfully",
      });
    }
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user data from Sanity
    const syncUserQuery = defineQuery(`
      *[_type == "user" && _id == $userId][0] {
        _id,
        username,
        email,
        imageUrl,
        joinedAt
      }
    `);

    const result = await sanityFetch({
      query: syncUserQuery,
      params: { userId },
    });

    if (!result.data) {
      return NextResponse.json({
        exists: false,
        message: "User not found in Sanity",
      });
    }

    return NextResponse.json({
      exists: true,
      user: result.data,
      message: "User found in Sanity",
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      { error: "Failed to check user" },
      { status: 500 }
    );
  }
}
