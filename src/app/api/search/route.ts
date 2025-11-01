import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search Questions
    const searchQuestionsQuery = defineQuery(`
      *[_type == "question" && !isDeleted && (
        title match $searchTerm ||
        description match $searchTerm ||
        tags[] match $searchTerm
      )] | order(createdAt desc) [0...10] {
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
        tags,
        createdAt,
        "answerCount": count(*[_type == "answer" && references(^._id) && !isDeleted])
      }
    `);

    // Search Posts
    const searchPostsQuery = defineQuery(`
      *[_type == "post" && !isDeleted && (
        postTitle match $searchTerm ||
        body[].children[].text match $searchTerm
      )] | order(publishedAt desc) [0...10] {
        _id,
        postTitle,
        body,
        image,
        author->{
          username,
          imageUrl
        },
        subreddit->{
          title,
          slug
        },
        publishedAt,
        "commentCount": count(*[_type == "comment" && references(^._id) && !isDeleted])
      }
    `);

    // Search Users
    const usersQuery = defineQuery(`
      *[_type == "user" && (
        username match $searchTerm ||
        email match $searchTerm
      )] | order(joinedAt desc) [0...10] {
        _id,
        username,
        email,
        imageUrl,
        bio,
        joinedAt
      }
    `);

    // Search Answers
    const answersQuery = defineQuery(`
      *[_type == "answer" && !isDeleted && (
        content[].children[].text match $searchTerm
      )] | order(createdAt desc) [0...10] {
        _id,
        content,
        author->{
          username,
          imageUrl
        },
        question->{
          _id,
          title
        },
        createdAt,
        "voteCount": coalesce(
          count(*[_type == "vote" && references(^._id) && voteType == "upvote"]) -
          count(*[_type == "vote" && references(^._id) && voteType == "downvote"]),
          0
        )
      }
    `);

    // Create search term with wildcards for fuzzy matching
    const searchTerm = `*${query}*`;

    // Execute all searches in parallel
    const [questions, posts, users, answers] = await Promise.all([
      adminClient.fetch(searchQuestionsQuery, { searchTerm }),
      adminClient.fetch(searchPostsQuery, { searchTerm }),
      adminClient.fetch(usersQuery, { searchTerm }),
      adminClient.fetch(answersQuery, { searchTerm }),
    ]);

    return NextResponse.json({
      success: true,
      query,
      questions: questions || [],
      posts: posts || [],
      users: users || [],
      answers: answers || [],
      totalResults:
        (questions?.length || 0) +
        (posts?.length || 0) +
        (users?.length || 0) +
        (answers?.length || 0),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform search",
        questions: [],
        posts: [],
        users: [],
        answers: [],
      },
      { status: 500 }
    );
  }
}
