import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { addUser } from "@/sanity/lib/user/addUser";
import { generateUsername } from "@/lib/username";
import { extractHashtags } from "@/lib/hashtags";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const postTitle = formData.get("postTitle") as string;
    const postBody = formData.get("postBody") as string | null;
    const subredditId = formData.get("subredditId") as string;
    const userId = formData.get("userId") as string;
    const userEmail = formData.get("userEmail") as string | null;
    const userFullName = formData.get("userFullName") as string | null;
    const userImageUrl = formData.get("userImageUrl") as string | null;

    // Get all files with key 'mediaFiles'
    const mediaFiles = formData.getAll("mediaFiles") as File[];

    console.log(`Received request for post: "${postTitle}" with ${mediaFiles.length} media files.`);

    if (!postTitle || !subredditId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Ensure user exists in Sanity
    // First, check if user already exists by Clerk ID
    let sanityUser = await adminClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]`,
      { clerkId: userId }
    );

    if (!sanityUser) {
      // User doesn't exist, create new one
      console.log("Creating new user in Sanity...");
      sanityUser = await addUser({
        id: userId,
        username: generateUsername(userFullName || "User", userId),
        email: userEmail || "user@example.com",
        imageUrl: userImageUrl || "",
      });
    }

    // Process Media Gallery
    const galleryAssets: any[] = [];
    let mainImageAsset = null;

    if (mediaFiles && mediaFiles.length > 0) {
      console.log(`Processing ${mediaFiles.length} gallery items...`);

      for (const file of mediaFiles) {
        if (file.size > 0) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const isVideo = file.type.startsWith("video/");
            const assetType = isVideo ? "file" : "image";

            console.log(`Uploading ${assetType}: ${file.name} (${file.size} bytes)...`);

            const asset = await adminClient.assets.upload(assetType, buffer, {
              filename: `${isVideo ? 'video' : 'img'}-${Date.now()}-${file.name}`,
              contentType: file.type,
            });

            if (isVideo) {
              galleryAssets.push({
                _type: "file",
                asset: {
                  _type: "reference",
                  _ref: asset._id
                },
                title: file.name
              });
            } else {
              galleryAssets.push({
                _type: "image",
                asset: {
                  _type: "reference",
                  _ref: asset._id
                },
                alt: file.name,
                hotspot: {
                  _type: "sanity.imageHotspot",
                  x: 0.5, y: 0.5, height: 1, width: 1
                }
              });
              // Keep reference to at least one image to use as main image if needed
              if (!mainImageAsset) {
                mainImageAsset = asset;
              }
            }
          } catch (err) {
            console.error("Error uploading gallery item:", err);
          }
        }
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
      // Map subredditId to category field as requested by current logic
      category: {
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

    if (galleryAssets.length > 0) {
      postData.contentGallery = galleryAssets;
      // If we found an image in the gallery, use it as main image
      // (This behavior was present in previous logic)
      if (mainImageAsset) {
        postData.image = {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: mainImageAsset._id,
          },
          alt: `Post image for ${postTitle}`,
          hotspot: { _type: "sanity.imageHotspot", x: 0.5, y: 0.5, height: 1, width: 1 },
        };
      }
    }

    // Extract tags
    const extractedTags = [
      ...extractHashtags(postTitle),
      ...extractHashtags(postBody || ""),
    ];

    if (extractedTags.length > 0) {
      postData.tags = extractedTags;
    }

    console.log("Creating post in Sanity...");

    try {
      const post = await adminClient.create(postData);
      console.log("Post created successfully:", post._id);
      return NextResponse.json({ post });
    } catch (createError: any) {
      console.error("Sanity create failed:", createError);
      // Fallback logic for subreddit reference if category fails
      if (createError.message && createError.message.includes("Reference")) {
        console.log("Attempting fallback: assigning to subreddit field instead...");
        delete postData.category;
        postData.subreddit = { _type: "reference", _ref: subredditId };
        const postRetry = await adminClient.create(postData);
        console.log("Retry successful:", postRetry._id);
        return NextResponse.json({ post: postRetry });
      }
      throw createError;
    }

  } catch (error: any) {
    console.error("Error processing post request:", error);
    return NextResponse.json(
      { error: `Failed to create post: ${error.message || "Unknown error"}` },
      { status: 500 },
    );
  }
}
