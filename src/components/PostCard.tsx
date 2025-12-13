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
  ChevronLeft,
  ChevronRight,
  Video
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useVoting } from "@/hooks/useVoting";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { urlFor } from "@/sanity/lib/image";
import toast from "react-hot-toast";

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
  publishedAt: string;
  tags?: string[];
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const { voteCount, userVote, loading, vote, canVote } = useVoting(
    post._id,
    "post",
  );

  // Fetch current user's Sanity username
  useEffect(() => {
    if (user) {
      fetch('/api/user/current')
        .then(res => res.json())
        .then(data => {
          if (data && data.username) {
            setCurrentSanityUsername(data.username);
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
    // Fallback for image refs if url not present
    if (item._type === 'image' && item.asset?._ref) {
      try {
        return urlFor(item).url();
      } catch (e) {
        console.error("Error generating URL for image:", e);
        return "";
      }
    }
    // Simple fallback for file refs if we can construct it manually (risky without dataset info but works if standard)
    // Actually, create-post API uploads result in asset objects with URLs usually if we fetch them right.
    // If not, we might be missing the URL for videos if not projected.
    return "";
  };

  return (
    <div
      className="bg-card rounded-lg shadow-sm border border-border overflow-hidden w-full mb-4"
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
                className="font-semibold text-sm sm:text-base text-card-foreground hover:text-blue-600 transition-colors truncate block"
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
                {post.subreddit ? (
                  <Link
                    href={`/communities/${post.subreddit.slug.current}`}
                    className="hover:underline hidden sm:inline truncate"
                  >
                    {post.subreddit.title}
                  </Link>
                ) : post.category ? (
                  <Link
                    href={`/categories/${post.category.slug.current}`}
                    className="hover:underline hidden sm:inline truncate"
                  >
                    {post.category.name}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {/* Three-dot menu */}
          {user && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                suppressHydrationWarning
                disabled={deleting}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-card rounded-lg shadow-lg border border-border z-10 py-1">
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
          <h2 className="text-base sm:text-lg font-semibold text-card-foreground mb-2 hover:text-blue-600 cursor-pointer transition-colors line-clamp-3">
            {post.postTitle}
          </h2>
        </Link>

        {/* Post Body - Caption */}
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

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="px-4 sm:px-6 pb-3 -mt-2">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {post.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/search?q=${tag}`}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs sm:text-sm rounded-full hover:bg-blue-100 cursor-pointer transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Media Carousel */}
      {mediaItems.length > 0 && (
        <div className="relative w-full bg-black aspect-[4/5] sm:aspect-video flex items-center justify-center mb-1">
          {/* Current Slide */}
          <div className="relative w-full h-full">
            {mediaItems[currentSlide]?._type === 'file' || mediaItems[currentSlide]?.asset?.url?.toLowerCase().endsWith('.mp4') ? (
              <video
                src={getMediaUrl(mediaItems[currentSlide])}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="relative w-full h-full">
                {/* Use Image if URL is valid, else fallback */}
                {getMediaUrl(mediaItems[currentSlide]) && (
                  <Image
                    src={getMediaUrl(mediaItems[currentSlide])}
                    alt={mediaItems[currentSlide]?.alt || "Post content"}
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
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
              {currentSlide < mediaItems.length - 1 && (
                <button
                  onClick={handleNextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors z-10"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
              {/* Dots Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
                {mediaItems.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${idx === currentSlide ? 'bg-blue-500' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Item Count Badges */}
          {mediaItems.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded-full">
              {currentSlide + 1}/{mediaItems.length}
            </div>
          )}
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
