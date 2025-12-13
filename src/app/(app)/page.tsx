import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "groq";
import QuestionCard from "@/components/QuestionCard";
import PostCard from "@/components/PostCard";
import ModernQuestionCard from "@/components/ModernQuestionCard";
import CategoryPills from "@/components/CategoryPills";
import ModernHeader from "@/components/ModernHeader";
import CategoriesSidebar from "@/components/CategoriesSidebar";
import TrendingTopics from "@/components/TrendingTopics";
import FloatingActionButton from "@/components/FloatingActionButton";
import MobileHomeFeed from "@/components/MobileHomeFeed";

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
    _id: string;
    name: string;
    color: string;
    icon: string;
  };
  image?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  tags?: string[];
  isAnswered: boolean;
  isDeleted: boolean;
  createdAt: string;
  answerCount?: number;
  voteCount?: number;
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
    _type: 'image';
    asset: {
      url: string;
      _ref?: string;
    };
    alt?: string;
  };
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

interface Category {
  _id: string;
  name: string;
  slug: string;
  color?: string;
}

const homeQuestionsQuery = defineQuery(`
  *[_type == "question" && !isDeleted] | order(createdAt desc) [0...20] {
    _id,
    title,
    description,
    author->{
      username,
      imageUrl,
      clerkId
    },
    category->{
      _id,
      name,
      color,
      icon
    },
    image{
      asset->{
        url
      },
      alt
    },
    tags,
    isAnswered,
    isDeleted,
    createdAt,
    "answerCount": count(*[_type == "answer" && references(^._id) && !isDeleted]),
    "voteCount": 0,
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
      "_type": "image",
      asset->{
        url,
        metadata
      },
      alt
    },
    contentGallery[]{
      _type,
      asset->{
        url
      },
      alt,
      title
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
    category->{
      name,
      slug
    },
    publishedAt,
    tags,
    "commentCount": count(*[_type == "comment" && references(^._id) && !isDeleted])
  }
`);

const categoriesQueryHome = defineQuery(`
  *[_type == "category"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    color
  }
`);


interface Subreddit {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  image?: {
    asset: {
      url: string;
    };
  };
  memberCount?: number;
}

const homeCommunitiesQuery = defineQuery(`
  *[_type == "subreddit"] | order(createdAt desc) [0...5] {
    _id,
    title,
    slug,
    description,
    image{
      asset->{
        url
      }
    }
  }
`);

export default async function HomePage() {
  let questions: Question[] = [];
  let posts: Post[] = [];
  let categories: Category[] = [];
  let communities: Subreddit[] = [];
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

    const categoriesResult = await sanityFetch({
      query: categoriesQueryHome,
      params: {},
    });

    if (categoriesResult.data) {
      categories = categoriesResult.data as any;
    }

    const communitiesResult = await sanityFetch({
      query: homeCommunitiesQuery,
      params: {},
    });

    if (communitiesResult.data) {
      communities = communitiesResult.data as any;
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    loading = true;
  }

  if (loading) {
    // ... (keep loading state as is)
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Loading */}
        <div className="md:hidden">
          <ModernHeader />
          <div className="p-4 space-y-4 pb-20">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Loading */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <div className="h-64 bg-card rounded-lg animate-pulse" />
              </div>
              <div className="col-span-9 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* MOBILE VIEW (< md breakpoint) - Modern Design */}
      <div className="md:hidden min-h-screen bg-background pb-20">
        <ModernHeader />
        <MobileHomeFeed
          initialQuestions={questions}
          initialPosts={posts}
          categories={categories}
        />
      </div>

      {/* DESKTOP VIEW (≥ md breakpoint) - Traditional Layout */}
      <div className="hidden md:block min-h-screen bg-background" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-3">
              <div className="sticky top-20 space-y-4">
                <CategoriesSidebar />

                {/* Communities Section in Sidebar */}
                <div className="bg-card rounded-lg shadow-sm border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-card-foreground">Communities</h3>
                    <a href="/create-community" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Create</a>
                  </div>
                  <div className="space-y-2">
                    {communities.length > 0 ? (
                      communities.map((community) => (
                        <a
                          key={community._id}
                          href={`/community/${community.slug.current}`}
                          className="flex items-center space-x-2 py-1.5 px-2 hover:bg-accent rounded-md transition-colors"
                        >
                          {community.image?.asset?.url ? (
                            <img src={community.image.asset.url} alt={community.title} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold">
                              {community.title.charAt(0)}
                            </div>
                          )}
                          <span className="text-sm font-medium text-foreground truncate">c/{community.title}</span>
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No communities yet.</p>
                    )}
                  </div>
                  <a href="/communities" className="block mt-3 text-xs text-blue-600 hover:underline">View All</a>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-6">
              <div className="mb-4 sm:mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-card-foreground">
                    Recent Activity
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Discover questions, answers, and posts from our community
                  </p>
                </div>
                {/* Create Community Button (Main Content Area - Optional, user asked for homepage option, sidebar is good, but maybe main area too?) */}
                <a
                  href="/create-community"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Create Community
                </a>
              </div>

              <div className="space-y-6" suppressHydrationWarning>
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}

                {questions.map((question) => (
                  <QuestionCard key={question._id} question={question} />
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-3">
              <div className="sticky top-20 space-y-4">
                <TrendingTopics />
              </div>
            </div>
          </div>

          {questions.length === 0 && posts.length === 0 && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">❓</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-2">
                No content yet
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                Be the first to ask a question or create a post!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a
                  href="/ask"
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors"
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
        <FloatingActionButton />
      </div>
    </>
  );
}
