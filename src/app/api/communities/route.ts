import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { addUser } from "@/sanity/lib/user/addUser";
import { generateUsername } from "@/lib/username";

// Helper to generate slug
const slugify = (text: string) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received community create request:", body);

    const {
      title,
      description,
      userId,
      userEmail,
      userFullName,
      userImageUrl,
    } = body;

    if (!title || !userId) {
      return NextResponse.json(
        { error: "Title and User ID are required" },
        { status: 400 }
      );
    }

    // Ensure user exists in Sanity
    let sanityUser = await adminClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]`,
      { clerkId: userId }
    );

    if (!sanityUser) {
      console.log("Creating new user in Sanity...");
      sanityUser = await addUser({
        id: userId,
        username: generateUsername(userFullName || "User", userId),
        email: userEmail || "user@example.com",
        imageUrl: userImageUrl || "",
      });
    }

    // Check if slug already exists
    let slug = slugify(title);
    const existingCommunity = await adminClient.fetch(
      `*[_type == "subreddit" && slug.current == $slug][0]`,
      { slug }
    );

    if (existingCommunity) {
      // Append random number if slug exists
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const communityData = {
      _type: "subreddit",
      title,
      description: description || "",
      slug: { _type: "slug", current: slug },
      moderator: {
        _type: "reference",
        _ref: sanityUser._id,
      },
      createdAt: new Date().toISOString(),
    };

    console.log("Creating community:", communityData);
    const community = await adminClient.create(communityData);

    return NextResponse.json({ success: true, community });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json(
      { error: "Failed to create community", details: error },
      { status: 500 }
    );
  }
}
