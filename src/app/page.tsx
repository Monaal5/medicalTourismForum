import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "groq";
import QuestionCard from "@/components/QuestionCard";
import PostCard from "@/components/PostCard";
import CategoriesSidebar from "@/components/CategoriesSidebar";
import TrendingTopics from "@/components/TrendingTopics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Question {
  _id: string;
  title: string;
  description?: string;
  author: {
    username: string;
    imageUrl: string;
    clerkId?: string;
  };
  category?: {
    name: string;
    color: string;
    icon: string;
  };
  tags?: string[];
  isAnswered: boolean;
  isDeleted: boolean;
  createdAt: string;
  answerCount?: number;
  topAnswer?: {
    _id: string;
    content: any[];
    author: {
      username: string;
      imageUrl: string;
      clerkId?: string;
    };
    voteCount?: number;
    userVote?: "upvote" | "downvote" | null;
    createdAt: string;
  };
}

interface Post {
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

const homeQuestionsQuery = defineQuery(`
  *[_type == "question" && !isDeleted] | order(createdAt desc) [0...10] {
    _id,
    title,
    description,
    author->{
      username,
      imageUrl,
      clerkId
    },
    category->{
      name,
      color,
      icon
    },
    tags,
    isAnswered,
    isDeleted,
    createdAt,
    "answerCount": count(*[_type == "answer" && references(^._id) && !isDeleted]),
    "topAnswer": *[_type == "answer" && references(^._id) && !isDeleted] | order(createdAt asc) [0] {
      _id,
      content,
      author->{
        username,
        imageUrl,
        clerkId
      },
      createdAt
    }
  }
`);

const homePostsQuery = defineQuery(`
  *[_type == "post" && !isDeleted] | order(publishedAt desc) [0...10] {
    _id,
    postTitle,
    body,
    image{
      asset->{
        url,
        metadata
      },
      alt
    },
    author->{
      username,
      imageUrl,
      clerkId
    },
    subreddit->{
      title,
      slug
    },
    publishedAt,
    "commentCount": count(*[_type == "comment" && references(^._id) && !isDeleted])
  }
`);

export default async function HomePage() {
  let questions: Question[] = [];
  let posts: Post[] = [];
  let loading = false;

  try {
    const questionsResult = await sanityFetch({
      query: homeQuestionsQuery,
      params: {},
    });

    if (questionsResult.data) {
      questions = questionsResult.data as any;
    }

    const postsResult = await sanityFetch({
      query: homePostsQuery,
      params: {},
    });

    if (postsResult.data) {
      posts = postsResult.data as any;
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    loading = true;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              <CategoriesSidebar />
              <TrendingTopics />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Recent Activity
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Discover questions, answers, and posts from our community
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4" suppressHydrationWarning>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}

              {questions.map((question) => (
                <QuestionCard key={question._id} question={question} />
              ))}
            </div>
          </div>
        </div>

        {questions.length === 0 && posts.length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">❓</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              No content yet
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">
              Be the first to ask a question or create a post!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="/ask"
                className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm sm:text-base rounded-md hover:bg-red-700 transition-colors"
              >
                Ask a Question
              </a>
              <a
                href="/create-post"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors"
              >
                Create a Post
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
