import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { addUser } from "@/sanity/lib/user/addUser";
import { generateUsername } from "@/lib/username";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);

    const {
      postTitle,
      postBody,
      subredditId,
      imageBase64,
      imageFileName,
      imageContentType,
      userId,
      userEmail,
      userFullName,
      userImageUrl,
    } = body;

    if (!postTitle || !subredditId || !userId) {
      console.log("Missing required fields:", {
        postTitle,
        subredditId,
        userId,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Ensure user exists in Sanity
    console.log("Fetching/creating user in Sanity...");

    // First, check if user already exists by Clerk ID
    let sanityUser = await adminClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]`,
      { clerkId: userId }
    );

    if (sanityUser) {
      console.log("✓ Existing user found:", sanityUser._id, "with username:", sanityUser.username);
    } else {
      // User doesn't exist, create new one
      console.log("Creating new user in Sanity...");
      sanityUser = await addUser({
        id: userId,
        username: generateUsername(userFullName || "User", userId),
        email: userEmail || "user@example.com",
        imageUrl: userImageUrl || "",
      });
      console.log("✓ New user created:", sanityUser._id);
    }

    // Handle image upload if provided
    let imageAsset = null;
    if (imageBase64 && imageFileName && imageContentType) {
      try {
        const base64Data = imageBase64.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        imageAsset = await adminClient.assets.upload("image", buffer, {
          filename: `post-${Date.now()}.${imageFileName.split(".").pop()}`,
          contentType: imageContentType,
          title: `Post image for ${postTitle}`,
          description: `Post image for ${postTitle}`,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        // Continue without image if upload fails
      }
    }

    // Create the post
    const postData: any = {
      _type: "post",
      postTitle: postTitle,
      author: {
        _type: "reference",
        _ref: sanityUser._id,
      },
      subreddit: {
        _type: "reference",
        _ref: subredditId,
      },
      body: postBody
        ? [
          {
            _type: "block",
            children: [
              {
                _type: "span",
                text: postBody,
              },
            ],
          },
        ]
        : [],
      publishedAt: new Date().toISOString(),
      isReported: false,
      isDeleted: false,
    };

    // Add image if available
    if (imageAsset) {
      postData.image = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: imageAsset._id,
        },
        alt: `Post image for ${postTitle}`,
        hotspot: {
          _type: "sanity.imageHotspot",
          x: 0.5,
          y: 0.5,
          height: 1,
          width: 1,
        },
        crop: {
          _type: "sanity.imageCrop",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
      };
    }

    console.log("Creating post with data:", postData);
    const post = await adminClient.create(postData);
    console.log("Post created successfully:", post._id);

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
