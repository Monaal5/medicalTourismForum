import React from "react";
import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "groq";
import Link from "next/link";
import ProfileContent from "@/components/ProfileContent";

interface UserProfile {
  _id: string;
  username: string | null;
  imageUrl: string | null;
  bio: string | null;
  joinedAt: string | null;
  questionsCount?: number;
  answersCount?: number;
  followersCount?: number;
  followingCount?: number;
  followers?: Array<{ _id: string; username: string; imageUrl: string }>;
  following?: Array<{ _id: string; username: string; imageUrl: string }>;
}

interface UserQuestion {
  _id: string;
  title: string | null;
  createdAt: string | null;
  answerCount?: number;
  category: {
    name: string | null;
    color:
    | "blue"
    | "red"
    | "pink"
    | "orange"
    | "green"
    | "purple"
    | "gray"
    | null;
  } | null;
}

interface UserAnswer {
  _id: string;
  content: any[];
  question: {
    _id: string;
    title: string;
  };
  createdAt: string;
  voteCount?: number;
}

interface UserPost {
  _id: string;
  postTitle: string;
  body?: any[];
  image?: any;
  publishedAt: string;
  subreddit: {
    title: string;
    slug: {
      current: string;
    };
  };
  commentCount?: number;
}

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

const userQuery = defineQuery(`
  *[_type == "user" && username == $username][0] {
    _id,
    username,
    imageUrl,
    bio,
    joinedAt,
    "questionsCount": count(*[_type == "question" && author._ref == ^._id && !isDeleted]),
    "answersCount": count(*[_type == "answer" && author._ref == ^._id && !isDeleted]),
    "postsCount": count(*[_type == "post" && author._ref == ^._id && !isDeleted]),
    "followersCount": count(coalesce(followers, [])),
    "followingCount": count(coalesce(following, [])),
    "followers": coalesce(followers, [])[]->{ _id, username, imageUrl },
    "following": coalesce(following, [])[]->{ _id, username, imageUrl }
  }
`);

const userQuestionsQuery = defineQuery(`
  *[_type == "question" && author._ref == $userId && !isDeleted] | order(createdAt desc) [0...10] {
    _id,
    title,
    createdAt,
    "answerCount": count(*[_type == "answer" && references(^._id) && !isDeleted]),
    category->{
      name,
      color
    }
  }
`);

const userAnswersQuery = defineQuery(`
  *[_type == "answer" && author._ref == $userId && !isDeleted] | order(createdAt desc) [0...10] {
    _id,
    content,
    question->{
      _id,
      title
    },
    createdAt,
    "voteCount": coalesce(count(votes[].voteType == "upvote") - count(votes[].voteType == "downvote"), 0)
  }
`);

const userPostsQuery = defineQuery(`
  *[_type == "post" && author._ref == $userId && !isDeleted] | order(publishedAt desc) [0...10] {
    _id,
    postTitle,
    body,
    image,
    publishedAt,
    subreddit->{
      title,
      slug
    },
    "commentCount": count(*[_type == "comment" && references(^._id) && !isDeleted])
  }
`);

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  let user: UserProfile | null = null;
  let questions: UserQuestion[] = [];
  let answers: UserAnswer[] = [];
  let posts: UserPost[] = [];

  console.log("Looking for user with username:", username);

  try {
    // First try exact username match
    let userResult = await sanityFetch({
      query: userQuery,
      params: { username: username.trim() },
    });

    // If no exact match, try case-insensitive search
    if (!userResult.data) {
      const caseInsensitiveQuery = defineQuery(`
        *[_type == "user" && lower(username) == lower($username)][0] {
          _id,
          username,
          imageUrl,
          bio,
          joinedAt,
          "questionsCount": count(*[_type == "question" && author._ref == ^._id && !isDeleted]),
          "answersCount": count(*[_type == "answer" && author._ref == ^._id && !isDeleted]),
          "postsCount": count(*[_type == "post" && author._ref == ^._id && !isDeleted]),
          "followersCount": count(coalesce(followers, [])),
          "followingCount": count(coalesce(following, [])),
          "followers": coalesce(followers, [])[]->{ _id, username, imageUrl },
          "following": coalesce(following, [])[]->{ _id, username, imageUrl }
        }
      `);

      userResult = await sanityFetch({
        query: caseInsensitiveQuery,
        params: { username: username.trim() },
      });
    }

    console.log("User query result:", userResult.data);

    if (userResult.data) {
      user = userResult.data;

      console.log("=== FOLLOWERS/FOLLOWING DATA ===");
      console.log("Followers count:", user?.followersCount);
      console.log("Following count:", user?.followingCount);
      console.log("Followers array:", user?.followers);
      console.log("Following array:", user?.following);

      // Fetch user questions
      const questionsResult = await sanityFetch({
        query: userQuestionsQuery,
        params: { userId: userResult.data._id },
      });
      questions = questionsResult.data || [];

      // Fetch user answers
      const answersResult = await sanityFetch({
        query: userAnswersQuery,
        params: { userId: userResult.data._id },
      });
      answers = answersResult.data || [];

      // Fetch user posts
      const postsResult = await sanityFetch({
        query: userPostsQuery,
        params: { userId: userResult.data._id },
      });
      posts = postsResult.data || [];
    } else {
      console.log("No user found for username:", username);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  if (!user) {
    // Return 404-style message for non-existent users
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              User not found
            </h1>
            <p className="text-gray-600 mb-8">
              The user @{username} doesn't exist or hasn't created a profile
              yet.
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Looking for someone?
                </h3>
                <p className="text-sm text-gray-600">
                  Make sure you have the correct username. Usernames are
                  case-sensitive.
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <a
                  href="/"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Go Home
                </a>
                <a
                  href="/search"
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg transition-colors"
                >
                  Search Users
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ProfileContent user={user} questions={questions} answers={answers} posts={posts} />;
}
