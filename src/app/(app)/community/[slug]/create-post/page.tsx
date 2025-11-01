import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "groq";
import CreatePostForm from "@/components/CreatePostForm";

interface CommunityDetails {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  createdAt?: string;
  moderator?: {
    username: string;
  };
}

interface CreatePostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const subredditQuery = defineQuery(`
  *[_type == "subreddit" && slug.current == $slug][0]{
    _id,
    title,
    slug,
  }
`);

export default async function CreatePostPage({ params }: CreatePostPageProps) {
  const { slug } = await params;
  let community: CommunityDetails | null = null;
  let loading = false;

  try {
    const result = await sanityFetch({
      query: subredditQuery,
      params: { slug },
    });

    if (result.data) {
      community = result.data as CommunityDetails;
    }
  } catch (error) {
    console.error("Error fetching subreddit:", error);
    loading = true;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        </div>
      </div>
    );
  }

  return <CreatePostForm community={community} />;
}
