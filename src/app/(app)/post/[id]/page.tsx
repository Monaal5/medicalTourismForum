import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "groq";
import Link from "next/link";
import PostContent from "@/components/PostContent";

export const revalidate = 0; // Disable caching
export const dynamic = 'force-dynamic'; // Always fetch fresh data

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

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  let post: PostWithDetails | null = null;
  let comments: CommentWithDetails[] = [];
  let loading = false;

  try {
    // Fetch post details
    const postQuery = defineQuery(`
      *[_type == "post" && _id == $id && !isDeleted][0] {
        _id,
        postTitle,
        body,
        image,
        publishedAt,
        author->{
          username,
          imageUrl,
          clerkId
        },
        subreddit->{
          title,
          slug
        }
      }
    `);

    const postResult = await sanityFetch({
      query: postQuery,
      params: { id },
    });

    if (postResult.data) {
      post = postResult.data as any;
    }

    // Fetch comments with nested replies
    const commentsQuery = defineQuery(`
      *[_type == "comment" && post._ref == $id && !isDeleted && !defined(parentComment)] | order(createdAt asc) {
        _id,
        comment,
        createdAt,
        author->{
          username,
          imageUrl,
          clerkId
        },
        "replies": *[_type == "comment" && parentComment._ref == ^._id && !isDeleted] | order(createdAt asc) {
          _id,
          comment,
          createdAt,
          author->{
            username,
            imageUrl,
            clerkId
          }
        }
      }
    `);

    const commentsResult = await sanityFetch({
      query: commentsQuery,
      params: { id },
    });

    if (commentsResult.data) {
      comments = commentsResult.data as any as CommentWithDetails[];
      console.log('=== COMMENTS DEBUG ===');
      console.log('Fetched comments for post:', id, 'Count:', comments.length);
      console.log('Full comments data:', JSON.stringify(comments, null, 2));
      console.log('Comments with replies:', comments.filter(c => c.replies && c.replies.length > 0).length);
      comments.forEach((comment, idx) => {
        console.log(`Comment ${idx + 1}:`, comment._id, 'Replies:', comment.replies?.length || 0);
      });
    } else {
      console.log('No comments found for post:', id);
    }
  } catch (error) {
    console.error("Error fetching post data:", error);
    console.error('Post ID:', id);
    loading = true;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Post not found
          </h1>
          <p className="text-gray-600">
            The post you're looking for doesn't exist.
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

  return <PostContent post={post} comments={comments} />;
}
