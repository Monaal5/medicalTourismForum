"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  CheckCircle,
  Edit3,
  Flag,
  Eye,
  Users,
  Calendar,
  Award,
  PenTool,
  Heart,
  MessageSquare,
  Send,
  X,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Inline Badge component
const Badge = ({
  className = "",
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    {...props}
  >
    {children}
  </span>
);

interface Author {
  _id: string;
  username: string | null;
  imageUrl: string | null;
  bio: string | null;
  credentials?: string[];
  clerkId?: string | null;
}

interface Answer {
  _id: string;
  content: any[];
  author: Author;
  createdAt: string;
  updatedAt?: string;
  voteCount: number;
  userVote?: "upvote" | "downvote" | null;
  isAccepted?: boolean;
  comments?: Comment[];
  commentCount?: number;
}

interface Comment {
  _id: string;
  comment: string;
  author: Author;
  createdAt: string;
  voteCount?: number;
  userVote?: "upvote" | "downvote" | null;
}

interface Question {
  _id: string;
  title: string | null;
  description: string | null;
  author: Author | null;
  category: {
    name: string | null;
    color: string | null;
    slug: { current?: string | undefined } | null;
  } | null;
  tags: string[] | null;
  createdAt: string | null;
  updatedAt?: string | null;
  viewCount?: number;
  followerCount?: number;
  isFollowing?: boolean;
  isBookmarked?: boolean;
  answers: Answer[];
  answerCount: number;
}

interface QuestionDetailPageProps {
  questionId: string;
  initialQuestion?: Question;
  autoFocusAnswer?: boolean;
}

export default function QuestionDetailPage({
  questionId,
  initialQuestion,
  autoFocusAnswer = false,
}: QuestionDetailPageProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(
    initialQuestion || null,
  );
  const [loading, setLoading] = useState(!initialQuestion);
  const [error, setError] = useState<string | null>(null);
  const [showAnswerForm, setShowAnswerForm] = useState(autoFocusAnswer);
  const [newAnswer, setNewAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [deletingAnswer, setDeletingAnswer] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set(),
  );
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [sortBy, setSortBy] = useState<"relevance" | "newest" | "oldest">(
    "relevance",
  );
  const [showQuestionMenu, setShowQuestionMenu] = useState(false);
  const [showAnswerMenu, setShowAnswerMenu] = useState<string | null>(null);
  const questionMenuRef = useRef<HTMLDivElement>(null);
  const answerMenuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (!initialQuestion) {
      fetchQuestion();
    }
  }, [questionId, initialQuestion]);

  useEffect(() => {
    if (autoFocusAnswer && question) {
      setShowAnswerForm(true);
      // Scroll to answer form after a short delay
      setTimeout(() => {
        const answerForm = document.getElementById("answer-form");
        if (answerForm) {
          answerForm.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [autoFocusAnswer, question]);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (questionMenuRef.current && !questionMenuRef.current.contains(event.target as Node)) {
        setShowQuestionMenu(false);
      }

      // Check answer menus
      Object.entries(answerMenuRefs.current).forEach(([answerId, ref]) => {
        if (ref && !ref.contains(event.target as Node)) {
          if (showAnswerMenu === answerId) {
            setShowAnswerMenu(null);
          }
        }
      });
    }

    if (showQuestionMenu || showAnswerMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showQuestionMenu, showAnswerMenu]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      console.log('Fetching question:', questionId);

      const response = await fetch(`/api/questions/${questionId}`, {
        cache: 'no-store', // Prevent caching issues
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          const text = await response.text();
          console.log('Error response text:', text);
          errorData = text ? JSON.parse(text) : { error: 'Empty error response' };
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorData = { error: `HTTP ${response.status}: Failed to fetch question` };
        }
        console.error('API error:', errorData);
        // Safely access error properties
        const errorMessage = errorData?.error || errorData?.details || `HTTP ${response.status}: Failed to fetch question`;
        throw new Error(errorMessage);
      }

      const text = await response.text();
      console.log('Response text length:', text.length);

      if (!text) {
        throw new Error('Empty response from server');
      }

      const data = JSON.parse(text);
      console.log('Question data received, success:', data.success);

      if (data.success && data.question) {
        setQuestion(data.question);
        setError(null);
      } else {
        throw new Error(data.error || "Unknown error: No question data returned");
      }
    } catch (err) {
      console.error("Error fetching question:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load question";
      console.error("Error message:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (
    targetId: string,
    targetType: "question" | "answer" | "comment",
    voteType: "upvote" | "downvote",
  ) => {
    if (!user) return;

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId,
          targetType,
          voteType,
          userId: user.id,
          userFullName: user.fullName,
          userEmail: user.primaryEmailAddress?.emailAddress,
          userImageUrl: user.imageUrl,
        }),
      });

      if (response.ok) {
        // Refresh question data to get updated vote counts
        fetchQuestion();
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleFollow = async () => {
    if (!user || !question) return;

    try {
      const response = await fetch(`/api/questions/${questionId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        setQuestion({
          ...question,
          isFollowing: !question.isFollowing,
          followerCount:
            (question.followerCount || 0) + (question.isFollowing ? -1 : 1),
        });
      }
    } catch (error) {
      console.error("Error following question:", error);
    }
  };

  const handleBookmark = async () => {
    if (!user || !question) return;

    const action = question.isBookmarked ? "remove" : "add";

    // Optimistic update
    setQuestion({
      ...question,
      isBookmarked: !question.isBookmarked,
    });

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question._id,
          userId: user.id,
          action,
        }),
      });

      if (!response.ok) {
        // Revert on error
        setQuestion({
          ...question,
          isBookmarked: question.isBookmarked,
        });
      }
    } catch (error) {
      console.error("Error bookmarking question:", error);
      // Revert on error
      setQuestion({
        ...question,
        isBookmarked: question.isBookmarked,
      });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/question/${questionId}`;
    const title = question?.title || "Check out this question";

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: question?.description || "",
          url,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!user || !newAnswer.trim()) return;

    try {
      setSubmittingAnswer(true);
      console.log('Submitting answer...');

      const response = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newAnswer,
          questionId: question?._id,
          userId: user.id,
          userFullName: user.fullName,
          userEmail: user.primaryEmailAddress?.emailAddress,
          userImageUrl: user.imageUrl,
        }),
      });

      console.log('Answer submission response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Answer created successfully:', result);

        setNewAnswer("");
        setShowAnswerForm(false);

        // Wait a bit longer for Sanity to process
        console.log('Waiting for Sanity to process...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Refreshing question data...');
        await fetchQuestion(); // Refresh to show new answer
        router.refresh(); // Force page refresh
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit answer' }));
        console.error('Failed to submit answer:', errorData);
        alert(errorData.error || 'Failed to submit answer');
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleSubmitComment = async (answerId: string) => {
    if (!user || !newComment[answerId]?.trim()) return;

    try {
      console.log('Submitting comment...');

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment[answerId],
          answerId,
          userId: user.id,
          userFullName: user.fullName,
          userEmail: user.primaryEmailAddress?.emailAddress,
          userImageUrl: user.imageUrl,
        }),
      });

      console.log('Comment submission response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Comment created successfully:', result);

        setNewComment({ ...newComment, [answerId]: "" });

        // Wait for Sanity to process
        console.log('Waiting for Sanity to process...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Refreshing question data...');
        await fetchQuestion(); // Refresh to show new comment
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit comment' }));
        console.error('Failed to submit comment:', errorData);
        alert(errorData.error || 'Failed to submit comment');
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert('Failed to submit comment. Please try again.');
    }
  };

  const toggleComments = (answerId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(answerId)) {
      newExpanded.delete(answerId);
    } else {
      newExpanded.add(answerId);
    }
    setExpandedComments(newExpanded);
  };

  const handleDeleteQuestion = async () => {
    if (!confirm("Are you sure you want to delete this question? This action cannot be undone.")) return;

    setDeletingQuestion(true);
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        router.push("/");
      } else {
        alert(result.error || "Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question");
    } finally {
      setDeletingQuestion(false);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm("Are you sure you want to delete this answer?")) return;

    setDeletingAnswer(answerId);
    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        fetchQuestion(); // Refresh question to remove deleted answer
      } else {
        alert(result.error || "Failed to delete answer");
      }
    } catch (error) {
      console.error("Error deleting answer:", error);
      alert("Failed to delete answer");
    } finally {
      setDeletingAnswer(null);
    }
  };

  const getCategoryColor = (color: string | null) => {
    if (!color) return "bg-blue-100 text-blue-800";

    const colors = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      purple: "bg-purple-100 text-purple-800",
      orange: "bg-orange-100 text-orange-800",
      pink: "bg-pink-100 text-pink-800",
      gray: "bg-gray-100 text-gray-800",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const renderAnswerContent = (content: any[]) => {
    return content.map((block, index) => (
      <p key={index} className="mb-4 text-gray-800 leading-relaxed">
        {block.children
          ?.map((child: any, childIndex: number) => child.text)
          .join("") || ""}
      </p>
    ));
  };

  const sortedAnswers =
    question?.answers?.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "relevance":
        default:
          // Sort by accepted first, then by vote count
          if (a.isAccepted && !b.isAccepted) return -1;
          if (!a.isAccepted && b.isAccepted) return 1;
          return (b.voteCount || 0) - (a.voteCount || 0);
      }
    }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Question not found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "This question doesn't exist or has been removed."}
            </p>
            <Link href="/">
              <Button>Go back to home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Question Header */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 mb-6">
          {/* Category */}
          {question.category && (
            <div className="flex items-center space-x-2 mb-4">
              <Badge className={getCategoryColor(question.category.color)}>
                {question.category.name}
              </Badge>
            </div>
          )}

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Question Title */}
          <h1 className="text-2xl font-bold text-card-foreground mb-4 leading-tight">
            {question.title}
          </h1>

          {/* Question Description */}
          {question.description && (
            <div
              className="text-gray-700 mb-6 text-lg leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: question.description }}
            />
          )}

          {/* Author and Meta Info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link
                href={`/profile/${question.author?.username || 'unknown'}`}
                className="flex items-center space-x-3"
              >
                <Image
                  src={question.author?.imageUrl || "/default-avatar.png"}
                  alt={question.author?.username || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                  unoptimized
                />
                <div>
                  <div className="font-semibold text-card-foreground">
                    {question.author?.username || "Anonymous"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {question.createdAt && formatDistanceToNow(new Date(question.createdAt))} ago
                  </div>
                </div>
              </Link>
            </div>

            {/* Three-dot menu for question owner */}
            {user && question.author && (user.id === question.author.clerkId) && (
              <div className="relative flex-shrink-0" ref={questionMenuRef}>
                <button
                  onClick={() => {
                    console.log('User ID:', user.id);
                    console.log('Author Clerk ID:', question.author?.clerkId);
                    console.log('Match:', user.id === question.author?.clerkId);
                    setShowQuestionMenu(!showQuestionMenu);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  disabled={deletingQuestion}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {showQuestionMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-card rounded-lg shadow-lg border border-border z-10 py-1">
                    <button
                      onClick={handleDeleteQuestion}
                      disabled={deletingQuestion || user.id !== question.author?.clerkId}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingQuestion ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Question</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>


          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleBookmark}>
              <Bookmark
                className={`w-4 h-4 ${question.isBookmarked ? "fill-current text-blue-600" : ""}`}
              />
            </Button>

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="w-4 h-4" />
            </Button>
          </div>

          {/* Stats */}
          <Separator className="my-4" />
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{question.viewCount || 0} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{question.answerCount} answers</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{question.followerCount || 0} followers</span>
            </div>
          </div>
        </div>

        {/* Answer Form */}
        {isLoaded && user && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 mb-6">
            {!showAnswerForm ? (
              <div className="text-center">
                <Button
                  onClick={() => setShowAnswerForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  Answer this question
                </Button>
              </div>
            ) : (
              <div id="answer-form" className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Image
                    src={user.imageUrl || "/default-avatar.png"}
                    alt={user.fullName || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                    unoptimized
                  />
                  <span className="font-medium text-card-foreground">
                    {user.fullName || "Anonymous"}
                  </span>
                </div>

                <Textarea
                  placeholder="Write your answer here..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="min-h-32 resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Share your knowledge and help others
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowAnswerForm(false);
                        setNewAnswer("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!newAnswer.trim() || submittingAnswer}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {submittingAnswer ? "Submitting..." : "Submit Answer"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Answers Section */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          {/* Answers Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-card-foreground">
                {question.answerCount} Answer
                {question.answerCount !== 1 ? "s" : ""}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "relevance" | "newest" | "oldest",
                    )
                  }
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  suppressHydrationWarning
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Answers List */}
          {sortedAnswers.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {sortedAnswers.map((answer) => (
                <div key={answer._id} className="p-4 sm:p-6">
                  <div className="flex items-start space-x-4">
                    {/* Vote Controls */}
                    <div className="flex flex-col items-center space-y-2">
                      <button
                        onClick={() =>
                          handleVote(answer._id, "answer", "upvote")
                        }
                        disabled={!user}
                        className={`p-1 rounded ${answer.userVote === "upvote"
                          ? "text-orange-500 bg-orange-50"
                          : "text-gray-500 hover:bg-gray-100"
                          } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                      <span className="font-semibold text-gray-700">
                        {answer.voteCount || 0}
                      </span>
                      <button
                        onClick={() =>
                          handleVote(answer._id, "answer", "downvote")
                        }
                        disabled={!user}
                        className={`p-1 rounded ${answer.userVote === "downvote"
                          ? "text-blue-500 bg-blue-50"
                          : "text-gray-500 hover:bg-gray-100"
                          } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <ArrowDown className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1">
                      {/* Accepted Answer Badge */}
                      {answer.isAccepted && (
                        <div className="flex items-center space-x-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <Badge className="bg-green-100 text-green-800">
                            Best Answer
                          </Badge>
                        </div>
                      )}

                      {/* Answer Text */}
                      <div className="prose max-w-none mb-4">
                        {renderAnswerContent(answer.content)}
                      </div>

                      {/* Answer Meta */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <Link
                          href={`/profile/${answer.author?.username || 'unknown'}`}
                          className="flex items-center space-x-2"
                        >
                          <Image
                            src={
                              answer.author?.imageUrl || "/default-avatar.png"
                            }
                            alt={answer.author?.username || "User"}
                            width={24}
                            height={24}
                            className="rounded-full"
                            unoptimized
                          />
                          <span className="text-sm font-medium text-card-foreground">
                            {answer.author?.username || "Anonymous"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(answer.createdAt))}{" "}
                            ago
                          </span>
                        </Link>

                        <div className="flex items-center flex-wrap gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleComments(answer._id)}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">{answer.commentCount || 0} Comments</span>
                            <span className="sm:hidden">{answer.commentCount || 0}</span>
                          </Button>

                          {/* Three-dot menu for answer owner */}
                          {user && answer.author && isLoaded && (
                            <div
                              className="relative"
                              ref={(el) => {
                                if (el) answerMenuRefs.current[answer._id] = el;
                              }}
                            >
                              <button
                                onClick={() => {
                                  console.log('Answer - User ID:', user.id);
                                  console.log('Answer - Author Clerk ID:', answer.author?.clerkId);
                                  console.log('Answer - Match:', user.id === answer.author?.clerkId);
                                  setShowAnswerMenu(showAnswerMenu === answer._id ? null : answer._id);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                disabled={deletingAnswer === answer._id}
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                              {showAnswerMenu === answer._id && (
                                <div className="absolute right-0 mt-1 w-48 bg-card rounded-lg shadow-lg border border-border z-10 py-1">
                                  <button
                                    onClick={() => {
                                      handleDeleteAnswer(answer._id);
                                      setShowAnswerMenu(null);
                                    }}
                                    disabled={deletingAnswer === answer._id || user.id !== answer.author?.clerkId}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {deletingAnswer === answer._id ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Deleting...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete Answer</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <Button variant="ghost" size="sm">
                            <Share className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {expandedComments.has(answer._id) && (
                        <div className="border-t border-gray-100 pt-4">
                          {/* Existing Comments */}
                          {answer.comments?.map((comment) => (
                            <div
                              key={comment._id}
                              className="flex items-start space-x-3 py-3"
                            >
                              <Image
                                src={
                                  comment.author?.imageUrl ||
                                  "/default-avatar.png"
                                }
                                alt={comment.author?.username || "User"}
                                width={20}
                                height={20}
                                className="rounded-full"
                                unoptimized
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium">
                                    {comment.author?.username || "Anonymous"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(
                                      new Date(comment.createdAt),
                                    )}{" "}
                                    ago
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">
                                  {comment.comment}
                                </p>
                              </div>
                            </div>
                          ))}

                          {/* Add Comment Form */}
                          {user && (
                            <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                              <Image
                                src={user.imageUrl || "/default-avatar.png"}
                                alt={user.fullName || "User"}
                                width={24}
                                height={24}
                                className="rounded-full"
                                unoptimized
                              />
                              <div className="flex-1 flex items-center space-x-2">
                                <Input
                                  placeholder="Add a comment..."
                                  value={newComment[answer._id] || ""}
                                  onChange={(e) =>
                                    setNewComment({
                                      ...newComment,
                                      [answer._id]: e.target.value,
                                    })
                                  }
                                  className="text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleSubmitComment(answer._id)
                                  }
                                  disabled={!newComment[answer._id]?.trim()}
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No answers yet
              </h3>
              <p className="text-gray-500 mb-6">
                Be the first to answer this question
              </p>
              {user && (
                <Button
                  onClick={() => setShowAnswerForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  Write an Answer
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Related Questions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Related Questions
          </h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
              >
                <h4 className="font-medium text-gray-900 mb-1">
                  Sample related question that might interest you?
                </h4>
                <p className="text-sm text-gray-500">2 answers • 15 views</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}