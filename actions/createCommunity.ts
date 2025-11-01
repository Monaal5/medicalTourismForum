"use server";
import { createSubreddit } from "@/sanity/lib/subreddit/createSubreddit";
import { addUser } from "@/sanity/lib/user/addUser";
import { generateUsername } from "@/lib/username";

export type ImageData = {
  base64: string;
  fileName: string;
  contentType: string;
} | null;

const parseUsername = (username: string) => {
  //remove whitespace and convert to camelcase with random number to avoid conflicts
  const randonum = Math.floor(1000 + Math.random() * 9000);
  //Convert whitespace to camelcase and add rndom number to avoid conflicts
  return (
    username
      .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) //Convert whitespace to camelcase
      .replace(/\s+/g, "") + randonum //remove all whitespaces and random number
  );
};

export async function createCommunity(
  name: string,
  slug: string,
  imageBase64: string | null | undefined,
  imageFileName: string | null | undefined,
  imageContentType: string | null | undefined,
  description?: string,
  userId?: string,
  userEmail?: string,
  userFullName?: string,
  userImageUrl?: string,
) {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    // Create user in Sanity if they don't exist
    const sanityUser = await addUser({
      id: userId,
      username: generateUsername(userFullName || "User", userId),
      email: userEmail || "user@example.com",
      imageUrl: userImageUrl || "",
    });

    //Prepare image data if provided
    let imageData: ImageData = null;
    if (imageBase64 && imageFileName && imageContentType) {
      imageData = {
        base64: imageBase64,
        fileName: imageFileName,
        contentType: imageContentType,
      };
    }
    const result = await createSubreddit(
      name,
      sanityUser._id,
      imageData,
      slug,
      description,
    );
    return result;
  } catch (error) {
    console.error("Error in creating community:", error);
    return { error: "Failed to create community" };
  }
}
