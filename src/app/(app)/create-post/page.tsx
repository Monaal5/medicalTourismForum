import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "groq";
import { formatDistanceToNow } from "date-fns";
import { Plus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface SubredditWithModerator {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  image?: {
    asset?: {
      url: string;
    };
    alt?: string;
  };
  description?: string;
  createdAt: string;
  moderator: {
    username: string;
  };
}

const subredditsQuery = defineQuery(`
  *[_type == "subreddit"] | order(createdAt desc) {
    _id,
    title,
    description,
    image,
    "moderator": moderator->{username},
    createdAt,
    slug,
  }
`);

export default async function CreatePostPage() {
  let subreddits: SubredditWithModerator[] = [];
  let loading = false;

  try {
    const result = await sanityFetch({
      query: subredditsQuery,
      params: {},
    });

    if (result.data) {
      subreddits = result.data as SubredditWithModerator[];
    }
  } catch (error) {
    console.error("Error fetching subreddits:", error);
    loading = true;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
          <p className="text-gray-600">
            Choose a community to create your post in
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subreddits.map((subreddit) => (
            <Link
              key={subreddit._id}
              href={`/community/${subreddit.slug?.current}/create-post`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-3">
                {subreddit.image && subreddit.image.asset?.url ? (
                  <Image
                    src={subreddit.image.asset.url}
                    alt={subreddit.image.alt || subreddit.title}
                    width={40}
                    height={40}
                    className="rounded-full object-cover mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    c/{subreddit.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Created by u/{subreddit.moderator?.username} •{" "}
                    {formatDistanceToNow(new Date(subreddit.createdAt))} ago
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {subreddit.description}
              </p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <Plus className="w-4 h-4 mr-1" />
                <span>Create Post</span>
              </div>
            </Link>
          ))}
        </div>

        {subreddits.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No communities found
            </h3>
            <p className="text-gray-500 mb-4">
              There are no communities available to create posts in.
            </p>
            <Link
              href="/create-community"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Create Community</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
