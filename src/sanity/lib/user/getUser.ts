import { sanityFetch } from "../live";
import { defineQuery } from "groq";
import { addUser } from "../user/addUser";
import { currentUser } from "@clerk/nextjs/server";
import { generateUsername } from "@/lib/username";

interface UserResult {
  _id: string;
  username: string;
  email: string;
  imageUrl: string;
}

export async function getUser(): Promise<UserResult | { error: string }> {
  try {
    console.log("Getting current user from clerk ");
    const loggedInUser = await currentUser();
    if (!loggedInUser) {
      console.log("No user logged in");
      return { error: "User not found" };
    }
    console.log(`Found Clerk user ${loggedInUser.id}`);
    //check if user exists in database first
    const getExistingUserQuery = defineQuery(
      `*[_type == "user" && (_id == $id || clerkId == $id)][0]`,
    );
    console.log("Checking if user exists in sanity database ");
    const existingUser = await sanityFetch({
      query: getExistingUserQuery,
      params: { id: loggedInUser.id },
    });
    //if user exists, return the user
    if (existingUser.data?._id) {
      console.log(`User found in database with Id:${existingUser.data._id}`);
      const user = {
        _id: existingUser.data._id,
        username: existingUser.data.username!,
        email: existingUser.data.email!,
        imageUrl: existingUser.data.imageUrl!,
      };
      return user;
    }
    //if user doesn't exist, create a new user
    const newUser = await addUser({
      id: loggedInUser.id,
      username: generateUsername(loggedInUser.fullName!, loggedInUser.id),
      email:
        loggedInUser.primaryEmailAddress?.emailAddress ||
        loggedInUser.emailAddresses[0].emailAddress,
      imageUrl: loggedInUser.imageUrl,
    });
    console.log(`Created new user in database with Id:${newUser._id}`);
    const user = {
      _id: newUser._id,
      username: newUser.username!,
      imageUrl: newUser.imageUrl!,
      email: newUser.email,
    };
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return { error: "Failed to get user" };
  }
}
