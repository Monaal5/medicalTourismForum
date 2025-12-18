import React from "react";
import Link from "next/link";
import ProfileContent from "@/components/ProfileContent";
import {
  getUserProfile,
  getUserQuestions,
  getUserPosts,
  getUserAnswers
} from "@/lib/db/queries";

// ... interfaces ... (can keep or move to types)

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Clean username
  const cleanUsername = username.trim(); // Handle URL variants?

  console.log("Looking for user with username:", cleanUsername);

  const user = await getUserProfile(cleanUsername);
  let questions: any[] = [];
  let answers: any[] = [];
  let posts: any[] = [];

  if (user) {
    // Parallel fetch for content
    const [q, a, p] = await Promise.all([
      getUserQuestions(cleanUsername),
      getUserAnswers(cleanUsername),
      getUserPosts(cleanUsername)
    ]);
    questions = q;
    answers = a;
    posts = p;
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
