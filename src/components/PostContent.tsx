"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share,
  MoreHorizontal,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Video
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useVoting } from "@/hooks/useVoting";
import CommentCard from "@/components/CommentCard";
import { urlFor } from "@/sanity/lib/image";

interface PostWithDetails {
  _id: string;
  postTitle: string;
  body?: any[];
  image?: {
    _type: 'image';
    asset: {
      url?: string;
      _ref?: string;
    };
    alt?: string;
  };
  contentGallery?: Array<{
    _type: 'image' | 'file';
    asset: {
      url?: string;
      _ref?: string;
    };
    alt?: string;
    title?: string;
  }>;
  publishedAt: string;
  author: {
    username: string;
    imageUrl: string;
    clerkId?: string;
  };
  subreddit?: {
    title: string;
    slug: {
      current: string;
    };
  };
  category?: {
    name: string;
    slug: {
      current: string;
    };
  };
  commentCount?: number;
}

interface CommentWithDetails {
  _id: string;
  comment: string;
  createdAt: string;
  author: {
    username: string;
    imageUrl: string;
    clerkId?: string;
  };
  voteCount?: number;
  userVote?: "upvote" | "downvote" | null;
  replies?: CommentWithDetails[];
}

interface PostContentProps {
  post: PostWithDetails;
  comments: CommentWithDetails[];
  onCommentAdded?: () => void;
}

export default function PostContent({ post, comments, onCommentAdded }: PostContentProps) {
  const { user } = useUser();
  const router = useRouter();
  const [submittingComment, setSubmittingComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [deletingPost, setDeletingPost] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Check if current user is the post author
  const isAuthor = user?.id === post.author.clerkId;

  // Use voting hook for the post
  const {
    voteCount: postVoteCount,
    userVote: postUserVote,
    loading: postVoteLoading,
    vote: postVote,
    canVote: postCanVote,
  } = useVoting(post._id, "post");

  const handlePostVote = (voteType: "upvote" | "downvote") => {
    if (postCanVote && !postVoteLoading) {
      postVote(voteType);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: newComment,
          postId: post._id,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
          userFullName: user.fullName,
          userImageUrl: user.imageUrl,
        }),
      });

      const result = await response.json();

      if (result.error) {
        console.error("Error creating comment:", result.error);
      } else {
        setNewComment("");
        await new Promise(resolve => setTimeout(resolve, 500));
        if (onCommentAdded) {
          onCommentAdded();
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (commentId: string, replyText: string) => {
    if (!user || !post || !replyText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: replyText,
          postId: post._id,
          parentCommentId: commentId,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
          userFullName: user.fullName,
          userImageUrl: user.imageUrl,
        }),
      });

      const result = await response.json();

      if (result.error) {
        console.error("Error creating reply:", result.error);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (onCommentAdded) {
          onCommentAdded();
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error creating reply:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setDeletingPost(true);
    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        router.push("/");
      } else {
        alert(result.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    } finally {
      setDeletingPost(false);
    }
  };

  // Media Logic
  const mediaItems = post.contentGallery?.length
    ? post.contentGallery
    : (post.image ? [{ ...post.image, _type: 'image' as const }] : []);

  const handleNextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentSlide < mediaItems.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const getMediaUrl = (item: any) => {
    if (item.asset?.url) return item.asset.url;
    if (item._type === 'image' && item.asset?._ref) {
      try {
        return urlFor(item).url();
      } catch (e) { console.error(e); return ""; }
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto p-4">
        {/* Post */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="flex">
            {/* Voting Section */}
            <div className="flex flex-col items-center p-2 bg-gray-50">
              <button
                onClick={() => handlePostVote("upvote")}
                disabled={!postCanVote || postVoteLoading}
                className={`p-1 rounded ${postUserVote === "upvote"
                  ? "text-orange-500"
                  : "text-gray-500 hover:bg-gray-200"
                  } ${!postCanVote || postVoteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                suppressHydrationWarning
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {postVoteCount}
              </span>
              <button
                onClick={() => handlePostVote("downvote")}
                disabled={!postCanVote || postVoteLoading}
                className={`p-1 rounded ${postUserVote === "downvote"
                  ? "text-blue-500"
                  : "text-gray-500 hover:bg-gray-200"
                  } ${!postCanVote || postVoteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                suppressHydrationWarning
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="flex-1 p-4">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                {post.subreddit ? (
                  <Link href={`/communities/${post.subreddit.slug.current}`}>
                    <span className="font-medium text-blue-600 hover:underline">
                      {post.subreddit.title}
                    </span>
                  </Link>
                ) : post.category ? (
                  <Link href={`/categories/${post.category.slug.current}`}>
                    <span className="font-medium text-blue-600 hover:underline">
                      {post.category.name}
                    </span>
                  </Link>
                ) : null}
                <span className="mx-1">•</span>
                <span>Posted by u/{post.author.username}</span>
                <span className="mx-1">•</span>
                <span>
                  {formatDistanceToNow(new Date(post.publishedAt), {
                    addSuffix: true,
                  })}
                </span>
                {isAuthor && (
                  <button
                    onClick={handleDeletePost}
                    disabled={deletingPost}
                    className="ml-auto flex items-center space-x-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                    suppressHydrationWarning
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deletingPost ? "Deleting..." : "Delete"}</span>
                  </button>
                )}
                {!isAuthor && (
                  <button className="ml-auto text-gray-400 hover:text-gray-600" suppressHydrationWarning>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {post.postTitle}
              </h1>

              {post.body && post.body.length > 0 && (
                <div className="text-gray-700 mb-4">
                  {post.body.map((block: any, index: number) => (
                    <p key={index} className="mb-2">
                      {block.children
                        ?.map((child: any, childIndex: number) => child.text)
                        .join("")}
                    </p>
                  ))}
                </div>
              )}

              {/* Media Carousel */}
              {mediaItems.length > 0 && (
                <div className="relative w-full bg-black aspect-[4/5] sm:aspect-video flex items-center justify-center mb-4 rounded-lg overflow-hidden">
                  <div className="relative w-full h-full">
                    {mediaItems[currentSlide]?._type === 'file' || mediaItems[currentSlide]?.asset?.url?.toLowerCase().endsWith('.mp4') ? (
                      <video
                        src={getMediaUrl(mediaItems[currentSlide])}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        {getMediaUrl(mediaItems[currentSlide]) && (
                          <Image
                            src={getMediaUrl(mediaItems[currentSlide])}
                            alt={mediaItems[currentSlide]?.alt || "Post image"}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  {mediaItems.length > 1 && (
                    <>
                      {currentSlide > 0 && (
                        <button
                          onClick={handlePrevSlide}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors z-10"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                      )}
                      {currentSlide < mediaItems.length - 1 && (
                        <button
                          onClick={handleNextSlide}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors z-10"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      )}

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                        {mediaItems.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlide ? 'bg-blue-500' : 'bg-white/50'
                              }`}
                          />
                        ))}
                      </div>

                      <div className="absolute top-4 right-4 bg-black/60 text-white px-2 py-1 text-sm rounded-full">
                        {currentSlide + 1}/{mediaItems.length}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <button className="flex items-center space-x-1 hover:bg-gray-100 px-2 py-1 rounded" suppressHydrationWarning>
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentCount || 0} Comments</span>
                </button>
                <button className="flex items-center space-x-1 hover:bg-gray-100 px-2 py-1 rounded" suppressHydrationWarning>
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Form */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <form onSubmit={handleSubmitComment}>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full mb-3"
                required
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submittingComment ? "Commenting..." : "Comment"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Comments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Comments ({comments.length})
          </h2>

          {comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              onReply={handleReply}
              submittingReply={submittingComment}
              onDelete={() => window.location.reload()}
            />
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
