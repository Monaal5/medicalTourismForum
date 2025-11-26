import { adminClient } from "../adminClient";

export async function addUser({
    id,
    username,
    email,
    imageUrl,
}: {
    id: string;
    username: string;
    email: string;
    imageUrl: string;
}) {
    console.log("=== ADD USER ===");
    console.log("Clerk ID:", id);
    console.log("Username:", username);

    // First check if user already exists by clerkId
    const existingUser = await adminClient.fetch(
        `*[_type == "user" && clerkId == $clerkId][0]`,
        { clerkId: id }
    );

    if (existingUser) {
        console.log("User already exists:", existingUser._id);
        return existingUser;
    }

    // Create new user with clerkId
    const user = await adminClient.create({
        _type: "user",
        clerkId: id,
        username,
        email,
        imageUrl,
        joinedAt: new Date().toISOString(),
    });

    console.log("User created:", user._id);
    return user;
}