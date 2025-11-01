import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { addUser } from "@/sanity/lib/user/addUser";
import { defineQuery } from "groq";
import { generateUsername } from "@/lib/username";

const getCategoriesQuery = defineQuery(`
  *[_type == "category"] | order(createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    description,
    icon,
    color,
    "questionCount": count(*[_type == "question" && references(^._id) && !isDeleted])
  }
`);

export async function GET() {
  try {
    const result = await adminClient.fetch(getCategoriesQuery);
    return NextResponse.json({
      success: true,
      categories: result || [],
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        categories: [],
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received category request body:", body);

    const {
      name,
      description,
      icon,
      color,
      userId,
      userEmail,
      userFullName,
      userImageUrl,
    } = body;

    if (!name || !userId) {
      console.log("Missing required fields:", { name, userId });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Ensure user exists in Sanity
    console.log("Creating user in Sanity...");
    const sanityUser = await addUser({
      id: userId,
      username: generateUsername(userFullName || "User", userId),
      email: userEmail || "user@example.com",
      imageUrl: userImageUrl || "",
    });
    console.log("User created:", sanityUser._id);

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create the category
    const categoryData: any = {
      _type: "category",
      name: name,
      slug: {
        _type: "slug",
        current: slug,
      },
      description: description || "",
      icon: icon || "Heart",
      color: color || "#ef4444",
      questionCount: 0,
    };

    console.log("Creating category with data:", categoryData);
    const category = await adminClient.create(categoryData);
    console.log("Category created successfully:", category._id);

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
      },
      { status: 500 },
    );
  }
}
