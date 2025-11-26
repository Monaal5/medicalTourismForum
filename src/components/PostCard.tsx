"use client";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share,
  MoreHorizontal,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useVoting } from "@/hooks/useVoting";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
// import { Post } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import toast from "react-hot-toast";

interface PostWithDetails {
  _id: string;
  postTitle: string;
  body?: any[];
  image?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  author: {
    username: string;
    imageUrl: string;
    clerkId?: string;
  };
  subreddit: {
    title: string;
    slug: {
      current: string;
    };
  };
  publishedAt: string;
  commentCount?: number;
}

interface PostCardProps {
  post: PostWithDetails;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useUser();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentSanityUsername, setCurrentSanityUsername] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { voteCount, userVote, loading, vote, canVote } = useVoting(
    post._id,
    "post",
  );

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

  // Debug: Log image data
  console.log("Post image data:", post.image);

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

  const handleVote = (voteType: "upvote" | "downvote") => {
    if (canVote && !loading) {
      vote(voteType);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(true);
    const toastId = "delete-post";
    toast.loading("Deleting post...", { id: toastId });

    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Post deleted successfully!", { id: toastId });
        // Refresh the page or redirect
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete post", { id: toastId });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post", { id: toastId });
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  // Check ownership using Sanity usernames
  const isOwner = currentSanityUsername && post.author.username &&
    currentSanityUsername.toLowerCase() === post.author.username.toLowerCase();

  // Debug logging - only log when values change
  useEffect(() => {
    console.log('PostCard Ownership Debug:', {
      currentSanityUsername,
      authorUsername: post.author.username,
      isOwner,
      comparison: `${currentSanityUsername?.toLowerCase()} === ${post.author.username?.toLowerCase()}`
    });
  }, [currentSanityUsername, post.author.username, isOwner]);

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full"
      suppressHydrationWarning
    >
      {/* Post Header */}
      <div className="px-4 sm:px-6 pt-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <Link href={`/profile/${post.author.username}`} className="flex-shrink-0">
              <Image
                src={
                  post.author.imageUrl ||
                  "https://via.placeholder.com/40x40/cccccc/666666?text=U"
                }
                alt={post.author.username}
                width={40}
                height={40}
                className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
                unoptimized
              />
            </Link>
            <div className="flex flex-col min-w-0 flex-1">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-semibold text-sm sm:text-base text-gray-900 hover:text-blue-600 transition-colors truncate"
              >
                {post.author.username}
              </Link>
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                <span className="truncate">
                  {formatDistanceToNow(new Date(post.publishedAt), {
                    addSuffix: true,
                  })}
                </span>
                <span className="hidden sm:inline">•</span>
                <Link
                  href={`/community/${post.subreddit.slug.current}`}
                  className="hover:underline hidden sm:inline truncate"
                >
                  c/{post.subreddit.title}
                </Link>
              </div>
            </div>
          </div>

          {/* Three-dot menu */}
          {user && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => {
                  console.log('=== DELETE MENU CLICKED ===');
                  console.log('Is Owner:', isOwner);
                  console.log('Current Sanity Username:', currentSanityUsername);
                  console.log('Author Username:', post.author.username);
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
                        <span>Delete Post</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Title */}
        <Link href={`/post/${post._id}`}>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors line-clamp-3">
            {post.postTitle}
          </h2>
        </Link>

        {/* Post Body */}
        {post.body && (
          <div className="text-gray-700 text-sm sm:text-base mb-3 line-clamp-2 sm:line-clamp-3">
            {post.body.map((block: any, index: number) => (
              <p key={index} className="mb-1">
                {block.children
                  ?.map((child: any, childIndex: number) => child.text)
                  .join("")}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="px-4 sm:px-6 pb-3">
          <Image
            src={urlFor(post.image).width(600).height(400).url()}
            alt={post.image.alt || "Post image"}
            width={600}
            height={400}
            className="rounded-lg w-full h-auto"
            unoptimized
          />
        </div>
      )}

      {/* Voting and Actions Bar */}
      <div className="border-t border-gray-100 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          {/* Vote Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => handleVote("upvote")}
              disabled={!canVote || loading}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${userVote === "upvote"
                  ? "text-orange-500 bg-orange-50"
                  : "text-gray-500 hover:bg-gray-100"
                } ${!canVote || loading ? "opacity-50 cursor-not-allowed" : ""}`}
              suppressHydrationWarning
            >
              <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 min-w-[24px] sm:min-w-[28px] text-center">
              {voteCount}
            </span>
            <button
              onClick={() => handleVote("downvote")}
              disabled={!canVote || loading}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${userVote === "downvote"
                  ? "text-blue-500 bg-blue-50"
                  : "text-gray-500 hover:bg-gray-100"
                } ${!canVote || loading ? "opacity-50 cursor-not-allowed" : ""}`}
              suppressHydrationWarning
            >
              <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-gray-500">
            <Link
              href={`/post/${post._id}`}
              className="flex items-center space-x-1 sm:space-x-1.5 hover:text-gray-700 transition-colors"
              suppressHydrationWarning
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-xs sm:text-sm">{post.commentCount || 0}</span>
            </Link>
            <button
              className="flex items-center space-x-1 sm:space-x-1.5 hover:text-gray-700 transition-colors"
              suppressHydrationWarning
            >
              <Share className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium text-xs sm:text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
