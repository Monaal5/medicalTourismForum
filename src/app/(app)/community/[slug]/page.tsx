import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "groq";
import { formatDistanceToNow } from "date-fns";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PostCard from "@/components/PostCard";

interface PostWithDetails {
  _id: string;
  postTitle: string;
  body?: any[];
  image?: any;
  publishedAt: string;
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
  voteCount?: number;
  userVote?: "upvote" | "downvote" | null;
  commentCount?: number;
}

interface CommunityDetails {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  createdAt: string;
  moderator?: {
    username: string;
  };
  image?: {
    asset?: {
      url: string;
    };
  };
}

interface CommunityPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = await params;
  let posts: PostWithDetails[] = [];
  let community: CommunityDetails | null = null;
  let loading = false;

  try {
    // Fetch community details
    const communityQuery = defineQuery(`
      *[_type == "subreddit" && slug.current == $slug][0] {
        _id,
        title,
        description,
        image,
        moderator->{
          username
        },
        createdAt
      }
    `);

    const communityResult = await sanityFetch({
      query: communityQuery,
      params: { slug },
    });

    if (communityResult.data) {
      community = communityResult.data as unknown as CommunityDetails;
    }

    // Fetch posts for this community
    const postsQuery = defineQuery(`
      *[_type == "post" && !isDeleted && subreddit->slug.current == $slug] | order(publishedAt desc) [0...20] {
        _id,
        postTitle,
        body,
        image,
        publishedAt,
        author->{
          username,
          imageUrl
        },
        subreddit->{
          title,
          slug
        }
      }
    `);

    const postsResult = await sanityFetch({
      query: postsQuery,
      params: { slug },
    });

    if (postsResult.data) {
      posts = postsResult.data as unknown as PostWithDetails[];
    }
  } catch (error) {
    console.error("Error fetching community data:", error);
    loading = true;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Community not found
          </h1>
          <p className="text-gray-600">
            The community you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Community Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            {community.image && community.image.asset?.url && (
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={community.image.asset.url}
                  alt={community.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {community.title}
              </h1>
              <p className="text-gray-600">{community.description}</p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <span>Created by u/{community.moderator?.username}</span>
                <span className="mx-1">•</span>
                <span>
                  {formatDistanceToNow(new Date(community.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
            <Link
              href={`/community/${slug}/create-post`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
            </Link>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts in this community yet.</p>
            <Link
              href={`/community/${slug}/create-post`}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Create the first post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
