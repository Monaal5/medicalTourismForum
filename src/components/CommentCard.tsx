"use client";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, Reply, Trash2, MessageCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useVoting } from "@/hooks/useVoting";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface CommentWithDetails {
  _id: string;
  comment: string;
  createdAt: string;
  author: {
    username: string;
    imageUrl: string;
    clerkId?: string;
  };
  replies?: CommentWithDetails[];
}

interface CommentCardProps {
  comment: CommentWithDetails;
  onReply: (commentId: string, replyText: string) => void;
  submittingReply: boolean;
  onDelete?: () => void; // Callback after successful deletion
}

export default function CommentCard({
  comment,
  onReply,
  submittingReply,
  onDelete,
}: CommentCardProps) {
  const { user } = useUser();
  const { voteCount, userVote, loading, vote, canVote } = useVoting(
    comment._id,
    "comment",
  );
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [deletingComment, setDeletingComment] = useState(false);

  // Check if current user is the comment author
  const isAuthor = user?.id === comment.author.clerkId;

  // Debug logging
  console.log('CommentCard render:', comment._id, 'has replies:', comment.replies?.length || 0);

  const handleVote = (voteType: "upvote" | "downvote") => {
    if (canVote && !loading) {
      vote(voteType);
    }
  };

  const handleReply = () => {
    setShowReplyForm(!showReplyForm);
    setReplyText("");
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReply(comment._id, replyText);
      setReplyText("");
      setShowReplyForm(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setDeletingComment(true);
    try {
      const response = await fetch(`/api/comments/${comment._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Call parent callback to refresh
        if (onDelete) {
          onDelete();
        } else {
          window.location.reload();
        }
      } else {
        alert(result.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    } finally {
      setDeletingComment(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex">
        {/* Comment Voting */}
        <div className="flex flex-col items-center p-1 mr-3">
          <button
            onClick={() => handleVote("upvote")}
            disabled={!canVote || loading}
            className={`p-1 rounded ${userVote === "upvote"
              ? "text-orange-500"
              : "text-gray-500 hover:bg-gray-200"
              } ${!canVote || loading ? "opacity-50 cursor-not-allowed" : ""}`}
            suppressHydrationWarning
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-gray-700">{voteCount}</span>
          <button
            onClick={() => handleVote("downvote")}
            disabled={!canVote || loading}
            className={`p-1 rounded ${userVote === "downvote"
              ? "text-blue-500"
              : "text-gray-500 hover:bg-gray-200"
              } ${!canVote || loading ? "opacity-50 cursor-not-allowed" : ""}`}
            suppressHydrationWarning
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* Comment Content */}
        <div className="flex-1">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span className="font-medium text-gray-900">
              u/{comment.author.username}
            </span>
            <span className="mx-1">•</span>
            <span>
              {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              }) : "Just now"}
            </span>
          </div>

          <p className="text-gray-700 mb-2">{comment.comment}</p>

          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
            <button
              onClick={handleReply}
              className="flex items-center space-x-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
              suppressHydrationWarning
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
            {isAuthor && (
              <button
                onClick={handleDeleteComment}
                disabled={deletingComment}
                className="flex items-center space-x-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                suppressHydrationWarning
              >
                <Trash2 className="w-3 h-3" />
                <span>{deletingComment ? "Deleting..." : "Delete"}</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 pl-4 border-l-2 border-gray-200">
              <form onSubmit={handleSubmitReply}>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="w-full mb-2"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReplyForm(false)}
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingReply || !replyText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    {submittingReply ? "Replying..." : "Reply"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Nested Replies Toggle & List */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1 mb-2"
              >
                <MessageCircle className="w-3 h-3" />
                <span>
                  {showReplies ? "Hide" : "View"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                </span>
              </button>

              {showReplies && (
                <div className="pl-4 border-l-2 border-gray-200 space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentCard
                      key={reply._id}
                      comment={reply}
                      onReply={onReply}
                      submittingReply={submittingReply}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
