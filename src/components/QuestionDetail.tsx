"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  CheckCircle,
  Hash
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useVoting } from "@/hooks/useVoting";

interface Question {
  _id: string;
  title: string;
  description?: string;
  author: {
    username: string;
    imageUrl: string;
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
}

interface Answer {
  _id: string;
  content: any[];
  author: {
    username: string;
    imageUrl: string;
  };
  createdAt: string;
  voteCount?: number;
  userVote?: 'upvote' | 'downvote' | null;
}

interface QuestionDetailProps {
  question: Question;
  answers: Answer[];
}

export default function QuestionDetail({ question, answers }: QuestionDetailProps) {
  const { user } = useUser();
  const [newAnswer, setNewAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const getCategoryIcon = (iconName: string) => {
    return "📚"; // Default icon
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAnswer.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newAnswer.trim(),
          questionId: question._id,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
          userFullName: user.fullName,
          userImageUrl: user.imageUrl,
        }),
      });

      const result = await response.json();
      if (result.error) {
        console.error("Error creating answer:", result.error);
      } else {
        setNewAnswer("");
        // Refresh the page to show the new answer
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-4">
                {question.category && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(question.category.color)}`}>
                    {getCategoryIcon(question.category.icon)} {question.category.name}
                  </span>
                )}
                {question.isAnswered && (
                  <span className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Answered
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {question.title}
              </h1>

              {question.description && (
                <div
                  className="text-gray-700 mb-4 leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />
              )}

              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" suppressHydrationWarning>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Question Meta */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Image
                  src={question.author.imageUrl || "/default-avatar.png"}
                  alt={question.author.username}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {question.author.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(question.createdAt))} ago
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500" suppressHydrationWarning>
              <span>{question.answerCount || 0} answers</span>
              <button className="flex items-center space-x-1 hover:text-gray-700" suppressHydrationWarning>
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-gray-700" suppressHydrationWarning>
                <Bookmark className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Answer Form */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <Textarea
                placeholder="Write your answer here..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={6}
                className="mb-4"
                required
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting || !newAnswer.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? "Posting..." : "Post Answer"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Answers */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </h3>

          {answers.map((answer) => (
            <AnswerCard key={answer._id} answer={answer} />
          ))}

          {answers.length === 0 && (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No answers yet. Be the first to answer!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnswerCard({ answer }: { answer: Answer }) {
  const { user } = useUser();
  const {
    voteCount,
    userVote,
    loading,
    vote,
    canVote
  } = useVoting(answer._id, 'answer');

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (canVote && !loading) {
      vote(voteType);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-4">
        {/* Voting */}
        <div className="flex flex-col items-center space-y-1" suppressHydrationWarning>
          <button
            onClick={() => handleVote('upvote')}
            disabled={!canVote || loading}
            className={`p-2 rounded-full ${userVote === 'upvote'
                ? 'text-orange-500 bg-orange-50'
                : 'text-gray-500 hover:bg-gray-100'
              } ${!canVote || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            suppressHydrationWarning
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {voteCount}
          </span>
          <button
            onClick={() => handleVote('downvote')}
            disabled={!canVote || loading}
            className={`p-2 rounded-full ${userVote === 'downvote'
                ? 'text-blue-500 bg-blue-50'
                : 'text-gray-500 hover:bg-gray-100'
              } ${!canVote || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            suppressHydrationWarning
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        {/* Answer Content */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <Image
              src={answer.author.imageUrl || "/default-avatar.png"}
              alt={answer.author.username}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm font-medium text-gray-900">
              {answer.author.username}
            </span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(answer.createdAt))} ago
            </span>
          </div>

          <div className="text-gray-800 mb-4">
            <p className="whitespace-pre-wrap">
              {answer.content?.[0]?.children?.[0]?.text || "Answer content..."}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500" suppressHydrationWarning>
            <button className="flex items-center space-x-1 hover:text-gray-700" suppressHydrationWarning>
              <MessageCircle className="w-4 h-4" />
              <span>Comment</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-gray-700" suppressHydrationWarning>
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-gray-700" suppressHydrationWarning>
              <Bookmark className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
