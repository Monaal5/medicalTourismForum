"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Bookmark, Loader2 } from "lucide-react";
import QuestionCard from "@/components/QuestionCard";
import SignInPrompt from "@/components/SignInPrompt";

interface Question {
  _id: string;
  title: string;
  description?: string;
  author: {
    username: string;
    imageUrl: string;
    clerkId?: string;
  };
  category?: {
    _id: string;
    name: string;
    color: string;
    icon: string;
  };
  tags?: string[];
  isAnswered: boolean;
  isDeleted: boolean;
  createdAt: string;
  answerCount?: number;
  topAnswer?: {
    _id: string;
    content: any[];
    author: {
      username: string;
      imageUrl: string;
    };
    voteCount?: number;
    userVote?: "upvote" | "downvote" | null;
    createdAt: string;
  };
}

export default function BookmarksPage() {
  const { user, isLoaded } = useUser();
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchBookmarkedQuestions();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, user]);

  const fetchBookmarkedQuestions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log("Fetching bookmarks for user:", user.id);

      // First, get the list of bookmarked question IDs
      const bookmarksResponse = await fetch(`/api/bookmarks?userId=${user.id}`);
      console.log("Bookmarks response status:", bookmarksResponse.status);

      if (!bookmarksResponse.ok) {
        throw new Error("Failed to fetch bookmarks");
      }

      const bookmarksData = await bookmarksResponse.json();
      console.log("Bookmarks data:", bookmarksData);
      const bookmarkIds = bookmarksData.bookmarks || [];
      console.log("Bookmark IDs:", bookmarkIds);

      if (bookmarkIds.length === 0) {
        console.log("No bookmarks found");
        setBookmarkedQuestions([]);
        setLoading(false);
        return;
      }

      // Then, fetch the full question data for each bookmarked question
      console.log("Fetching question details for", bookmarkIds.length, "bookmarks");
      const questionsPromises = bookmarkIds.map((id: string) =>
        fetch(`/api/questions/${id}`)
          .then((res) => {
            console.log(`Question ${id} response status:`, res.status);
            return res.json();
          })
          .catch((err) => {
            console.error(`Error fetching question ${id}:`, err);
            return { success: false };
          })
      );

      const questionsResults = await Promise.all(questionsPromises);
      console.log("Questions results:", questionsResults);

      const questions = questionsResults
        .filter((result) => result.success && result.question)
        .map((result) => result.question);

      console.log("Filtered questions:", questions.length);
      setBookmarkedQuestions(questions);
    } catch (error) {
      console.error("Error fetching bookmarked questions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <SignInPrompt
        icon={Bookmark}
        title="Sign in to view your bookmarks"
        description="Save and organize your favorite questions for easy access"
        action="view bookmarks"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Bookmark className="w-6 h-6 sm:w-8 sm:h-8 mr-2 text-blue-600" />
            Your Bookmarks
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {bookmarkedQuestions.length} saved question{bookmarkedQuestions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {bookmarkedQuestions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <Bookmark className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No bookmarks yet
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Start saving questions to easily find them later
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Browse Questions
            </a>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {bookmarkedQuestions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
