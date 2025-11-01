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
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-xl"
      suppressHydrationWarning
    >
      {/* Post Header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Link href={`/profile/${post.author.username}`}>
              <Image
                src={
                  post.author.imageUrl ||
                  "https://via.placeholder.com/40x40/cccccc/666666?text=U"
                }
                alt={post.author.username}
                width={32}
                height={32}
                className="rounded-full"
                unoptimized
              />
            </Link>
            <div className="flex flex-col">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-semibold text-xs text-gray-900 hover:text-blue-600 transition-colors"
              >
                {post.author.username}
              </Link>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span>
                  {formatDistanceToNow(new Date(post.publishedAt), {
                    addSuffix: true,
                  })}
                </span>
                <span>•</span>
                <Link
                  href={`/community/${post.subreddit.slug.current}`}
                  className="hover:underline"
                >
                  c/{post.subreddit.title}
                </Link>
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
          <h2 className="text-sm font-semibold text-gray-900 mb-1.5 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2">
            {post.postTitle}
          </h2>
        </Link>

        {/* Post Body */}
        {post.body && (
          <div className="text-gray-700 text-xs mb-2 line-clamp-2">
            {post.body.map((block: any, index: number) => (
              <p key={index} className="mb-0.5">
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
        <div className="px-3 pb-2">
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
      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center justify-between text-sm">
          {/* Vote Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleVote("upvote")}
              disabled={!canVote || loading}
              className={`p-2 rounded-full transition-colors ${
                userVote === "upvote"
                  ? "text-orange-500 bg-orange-50"
                  : "text-gray-500 hover:bg-gray-100"
              } ${!canVote || loading ? "opacity-50 cursor-not-allowed" : ""}`}
              suppressHydrationWarning
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-gray-700 min-w-[28px] text-center">
              {voteCount}
            </span>
            <button
              onClick={() => handleVote("downvote")}
              disabled={!canVote || loading}
              className={`p-2 rounded-full transition-colors ${
                userVote === "downvote"
                  ? "text-blue-500 bg-blue-50"
                  : "text-gray-500 hover:bg-gray-100"
              } ${!canVote || loading ? "opacity-50 cursor-not-allowed" : ""}`}
              suppressHydrationWarning
            >
              <ThumbsDown className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 text-gray-500">
            <Link
              href={`/post/${post._id}`}
              className="flex items-center space-x-1.5 hover:text-gray-700 transition-colors"
              suppressHydrationWarning
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{post.commentCount || 0}</span>
            </Link>
            <button
              className="flex items-center space-x-1.5 hover:text-gray-700 transition-colors"
              suppressHydrationWarning
            >
              <Share className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
