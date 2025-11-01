import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { addUser } from "@/sanity/lib/user/addUser";
import { generateUsername } from "@/lib/username";
import { defineQuery } from "groq";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const unanswered = searchParams.get("unanswered");

    let query = `*[_type == "question" && !isDeleted]`;

    // Filter by category if provided
    if (category) {
      query += ` && category._ref == "${category}"`;
    }

    // Filter for unanswered questions if requested
    if (unanswered === "true") {
      query += ` && count(*[_type == "answer" && references(^._id) && !isDeleted]) == 0`;
    }

    query += ` | order(createdAt desc) [0...50] {
      _id,
      title,
      description,
      author->{
        username,
        imageUrl
      },
      category->{
        name,
        color
      },
      createdAt,
      "answerCount": count(*[_type == "answer" && references(^._id) && !isDeleted]),
      isAnswered
    }`;

    const questions = await adminClient.fetch(query);

    return NextResponse.json({
      success: true,
      questions: questions || [],
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch questions",
        questions: [],
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received question request body:", body);

    const {
      title,
      description,
      categoryId,
      tags,
      userId,
      userEmail,
      userFullName,
      userImageUrl,
    } = body;

    if (!title || !userId) {
      console.log("Missing required fields:", { title, userId });
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

    // Create the question
    const questionData: any = {
      _type: "question",
      title: title,
      author: {
        _type: "reference",
        _ref: sanityUser._id,
      },
      isAnswered: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };

    if (description) {
      questionData.description = description;
    }

    if (tags && tags.length > 0) {
      questionData.tags = tags;
    }

    if (categoryId) {
      questionData.category = {
        _type: "reference",
        _ref: categoryId,
      };
    }

    console.log("Creating question with data:", questionData);
    const question = await adminClient.create(questionData);
    console.log("Question created successfully:", question._id);

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 },
    );
  }
}
