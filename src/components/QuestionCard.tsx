"use client";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  CheckCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useVoting } from "@/hooks/useVoting";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const { user } = useUser();
  const router = useRouter();
  const [showFullAnswer, setShowFullAnswer] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentSanityUsername, setCurrentSanityUsername] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Use voting hook for the top answer if it exists
  const {
    voteCount: answerVoteCount,
    userVote: answerUserVote,
    loading: answerVoteLoading,
    vote: answerVote,
    canVote: answerCanVote,
  } = useVoting(question.topAnswer?._id || "", "post");

  // Fetch current user's Sanity username
  useEffect(() => {
    if (user) {
      console.log('Fetching Sanity username for user...');
      fetch('/api/user/current')
        .then(res => {
          console.log('Response status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('Fetched Sanity user data:', data);
          if (data && data.username) {
            console.log('Setting currentSanityUsername to:', data.username);
            setCurrentSanityUsername(data.username);
          } else if (data && data.error) {
            console.error('Error from API:', data.error);
          } else {
            console.warn('No username in response:', data);
          }
        })
        .catch(err => console.error('Error fetching Sanity user:', err));
    }
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleAnswerVote = (voteType: "upvote" | "downvote") => {
    if (answerCanVote && !answerVoteLoading && question.topAnswer) {
      answerVote(voteType);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this question? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(true);
    const toastId = "delete-question";
    toast.loading("Deleting question...", { id: toastId });

    try {
      const response = await fetch(`/api/questions/${question._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Question deleted successfully!", { id: toastId });
        // Refresh the page or redirect
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete question", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question", { id: toastId });
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  // Check ownership using Sanity usernames
  const isOwner = currentSanityUsername && question.author.username && 
    currentSanityUsername.toLowerCase() === question.author.username.toLowerCase();
  
  // Debug logging - only log when values change
  useEffect(() => {
    console.log('QuestionCard Ownership Debug:', {
      currentSanityUsername,
      authorUsername: question.author.username,
      isOwner,
      comparison: `${currentSanityUsername?.toLowerCase()} === ${question.author.username?.toLowerCase()}`
    });
  }, [currentSanityUsername, question.author.username, isOwner]);

  const getCategoryIcon = (iconName: string) => {
    // This would need to be implemented with dynamic icon loading
    return "📚"; // Default icon
  };

  const getCategoryColor = (color: string) => {
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

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-3 mb-3 hover:shadow-md transition-shadow max-w-xl"
      suppressHydrationWarning
    >
      {/* Question Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Link href={`/profile/${question.author.username}`}>
            <Image
              src={question.author.imageUrl || "/default-avatar.png"}
              alt={question.author.username}
              width={32}
              height={32}
              className="rounded-full"
              unoptimized
            />
          </Link>
          <div className="flex flex-col">
            <Link
              href={`/profile/${question.author.username}`}
              className="font-semibold text-xs text-gray-900 hover:text-blue-600 transition-colors"
            >
              {question.author.username}
            </Link>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>{formatDistanceToNow(new Date(question.createdAt))} ago</span>
              {question.category && (
                <>
                  <span>•</span>
                  <span>{question.category.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Three-dot menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                console.log('=== DELETE MENU CLICKED ===');
                console.log('Is Owner:', isOwner);
                console.log('Current Sanity Username:', currentSanityUsername);
                console.log('Author Username:', question.author.username);
                setShowMenu(!showMenu);
              }}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              suppressHydrationWarning
              disabled={deleting}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                <button
                  onClick={handleDelete}
                  disabled={deleting || !isOwner}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
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

      {/* Answered Badge */}
      {question.isAnswered && (
        <div className="flex items-center space-x-1 text-green-600 text-xs mb-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          <span className="font-medium">Answered</span>
        </div>
      )}

      {/* Question Title */}
      <Link href={`/question/${question._id}`}>
        <h2 className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer mb-1.5 line-clamp-2">
          {question.title}
        </h2>
      </Link>

      {/* Question Description */}
      {question.description && (
        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
          {question.description}
        </p>
      )}

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {question.tags.map((tag, index) => (
            <span
              key={index}
              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Question Stats */}
      <div className="flex items-center space-x-3 text-sm text-gray-500 pt-2.5 border-t border-gray-100">
        <span className="flex items-center space-x-1.5">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">{question.answerCount || 0} answers</span>
        </span>
      </div>

      {/* Top Answer */}
      {question.topAnswer && (
        <div className="border-t border-gray-100 pt-2 mt-2">
          <p className="text-xs text-gray-500 mb-1.5">Top Answer:</p>
          <div className="text-gray-700 text-xs line-clamp-2">
            {question.topAnswer.content?.[0]?.children?.[0]?.text ||
              "Answer content..."}
          </div>
        </div>
      )}

      {/* View All Answers Link */}
      {question.answerCount && question.answerCount > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <Link
            href={`/question/${question._id}`}
            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
          >
            View {question.answerCount > 1 ? `all ${question.answerCount} answers` : 'answer'} →
          </Link>
        </div>
      )}
    </div>
  );
}
