import Link from "next/link";
import PostContent from "@/components/PostContent";
import { getPostById } from "@/lib/db/queries";

export const revalidate = 0; // Disable caching
export const dynamic = 'force-dynamic'; // Always fetch fresh data

// ... Interfaces ...

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  let post: any | null = null;
  let comments: any[] = [];
  let loading = false;

  try {
    const postData = await getPostById(id);

    if (postData) {
      // Separate comments from post
      const { comments: rawComments, ...restPost } = postData;
      post = restPost;

      // Build comment tree (assuming rawComments is flat)
      const commentMap = new Map();
      const rootComments: any[] = [];

      // First pass: create map of all comments
      rawComments.forEach((comment: any) => {
        comment.replies = [];
        commentMap.set(comment._id, comment);
      });

      // Second pass: link children to parents
      rawComments.forEach((comment: any) => {
        if (comment.parentComment?._ref || comment.parent_comment_id) { // Handle both just in case
          const parentId = comment.parentComment?._ref || comment.parent_comment_id;
          const parent = commentMap.get(parentId);
          if (parent) {
            parent.replies.push(comment);
          } else {
            rootComments.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      comments = rootComments;
    }

  } catch (error) {
    console.error("Error fetching post data:", error);
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
