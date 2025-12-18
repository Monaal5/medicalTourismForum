
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { extractHashtags } from "@/lib/hashtags";

// IMPORTANT: MEDIA UPLOAD TO SUPABASE STORAGE
// We assuming the bucket 'post-media' exists or we need to create it.
// Previous Sanity code handled uploads. Supabase requires storage bucket.
// For now, I will omit the file upload implementation details or put placeholder
// assuming 'post-images' bucket is public.

export async function POST(request: NextRequest) {
  try {
    let formData;
    try {
      formData = await request.formData();
    } catch (e: any) {
      console.error("Error parsing FormData:", e);
      return NextResponse.json(
        { error: "Failed to parse request body. File size might be too large." },
        { status: 400 }
      );
    }

    const postTitle = formData.get("postTitle") as string;
    const postBody = formData.get("postBody") as string | null;
    const subredditId = (formData.get("subredditId") || formData.get("communityId")) as string;
    const userId = formData.get("userId") as string;
    // const userEmail = formData.get("userEmail") as string | null;
    // const userFullName = formData.get("userFullName") as string | null;
    // const userImageUrl = formData.get("userImageUrl") as string | null;

    // Get all files with key 'mediaFiles'
    const mediaFiles = formData.getAll("mediaFiles") as File[];

    console.log(`Received request for post: "${postTitle}" with ${mediaFiles.length} media files.`);

    if (!postTitle || !subredditId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Get User ID (internal UUID) - using clerk_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      console.error("User not found for post creation:", userId);
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // 2. Process Media (Client-side uploaded URLs or Server-side fallback)
    const galleryAssets: any[] = [];
    let mainImageUrl: string | null = null;

    // Check for client-side uploaded media
    const mediaUrlsJson = formData.get("mediaUrls") as string | null;

    if (mediaUrlsJson) {
      try {
        const uploadedMedia = JSON.parse(mediaUrlsJson);
        if (Array.isArray(uploadedMedia)) {
          uploadedMedia.forEach((media: any) => {
            galleryAssets.push({
              _type: media.type === 'video' ? "file" : "image",
              url: media.url,
              asset: { url: media.url }
            });

            if (!mainImageUrl && media.type === 'image') {
              mainImageUrl = media.url;
            }
          });
        }
      } catch (e) {
        console.error("Error parsing mediaUrls:", e);
      }
    }
    // Fallback: Legacy Server-side Upload (only if no client uploads provided)
    else if (mediaFiles && mediaFiles.length > 0) {
      console.log(`Processing ${mediaFiles.length} gallery items... (Legacy Upload)`);

      // Setup Storage Client (already have 'supabase')
      // Ensure 'post-images' bucket exists in Supabase Dashboard!

      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        // Add to gallery
        galleryAssets.push({
          _type: file.type.startsWith('video') ? "file" : "image",
          url: publicUrl,
          asset: { url: publicUrl } // Sanity compat
        });

        if (!mainImageUrl && file.type.startsWith('image')) {
          mainImageUrl = publicUrl;
        }
      }
    }

    // 3. Extract Tags
    const explicitTagsJson = formData.get("tags") as string | null;
    let explicitTags: string[] = [];
    if (explicitTagsJson) {
      try {
        explicitTags = JSON.parse(explicitTagsJson);
      } catch (e) {
        console.error("Error parsing tags:", e);
      }
    }

    const extractedTags = [
      ...explicitTags,
      ...extractHashtags(postTitle),
      ...extractHashtags(postBody || ""),
    ];
    const tags = extractedTags.length > 0 ? [...new Set(extractedTags)] : [];

    // 4. Create Post
    let community_id: string | null = (formData.get("communityId") || formData.get("subredditId")) as string | null;
    let category_id: string | null = formData.get("categoryId") as string | null;

    // Validate IDs exist if provided (optional but good practice)
    // If only subredditId was provided (legacy), try to resolve it
    if (community_id && !category_id) {
      // Check if it is a community
      const { data: comm } = await supabase.from('communities').select('id').eq('id', community_id).single();
      if (!comm) {
        // If not community, maybe it's a category?
        const { data: cat } = await supabase.from('categories').select('id').eq('id', community_id).single();
        if (cat) {
          category_id = cat.id;
          community_id = null; // It was actually a category
        }
      }
    }

    const isAnonymous = formData.get("isAnonymous") === "true";

    const { data: newPost, error: createError } = await supabase
      .from('posts')
      .insert({
        title: postTitle,
        body: postBody ? { content: postBody } : null, // Simple JSON for now
        author_id: user.id,
        community_id: community_id,
        category_id: category_id,
        image_url: mainImageUrl,
        gallery: galleryAssets.length > 0 ? galleryAssets : null,
        tags: tags,
        is_anonymous: isAnonymous,
        published_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error("Supabase create failed:", createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    console.log("Post created successfully:", newPost.id);

    // 5. Create Poll (if data provided)
    const pollDataJson = formData.get("pollData") as string | null;
    if (pollDataJson) {
      try {
        const { question, options } = JSON.parse(pollDataJson);
        if (question && options && Array.isArray(options) && options.length >= 2) {
          const { data: poll, error: pollError } = await supabase.from('polls').insert({
            question,
            author_id: user.id,
            post_id: newPost.id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default 7 days
          }).select().single();

          if (!pollError && poll) {
            // Insert options
            const optionsData = options.map((opt: string) => ({
              poll_id: poll.id,
              option_text: opt
            }));
            await supabase.from('poll_options').insert(optionsData);
          } else {
            console.error("Poll creation failed:", pollError);
          }
        }
      } catch (e) {
        console.error("Error creating poll linked to post:", e);
      }
    }

    return NextResponse.json({ post: { _id: newPost.id } }); // Return Sanity-like ID

  } catch (error: any) {
    console.error("Error processing post request:", error);
    return NextResponse.json(
      { error: `Failed to create post: ${error.message || "Unknown error"}` },
      { status: 500 },
    );
  }
}
