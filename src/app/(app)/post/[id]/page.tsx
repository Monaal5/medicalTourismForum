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
    // Fetch all comments for the post (flat list)
    const commentsQuery = defineQuery(`
      *[_type == "comment" && post._ref == $id && !isDeleted] | order(createdAt asc) {
        _id,
        comment,
        createdAt,
        author->{
          username,
          imageUrl,
          clerkId
        },
        parentComment
      }
    `);

    const commentsResult = await sanityFetch({
      query: commentsQuery,
      params: { id },
    });

    if (commentsResult.data) {
      const allComments = commentsResult.data as any[];

      // Build comment tree
      const commentMap = new Map();
      const rootComments: CommentWithDetails[] = [];

      // First pass: create map of all comments
      allComments.forEach(comment => {
        comment.replies = [];
        commentMap.set(comment._id, comment);
      });

      // Second pass: link children to parents
      allComments.forEach(comment => {
        if (comment.parentComment?._ref) {
          const parent = commentMap.get(comment.parentComment._ref);
          if (parent) {
            parent.replies.push(comment);
          } else {
            // Parent might be deleted or not found, treat as root or orphan
            // For now, let's treat as root if parent is missing to avoid data loss
            rootComments.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      comments = rootComments;

      console.log('=== COMMENTS DEBUG ===');
      console.log('Total comments fetched:', allComments.length);
      console.log('Root comments:', comments.length);
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
