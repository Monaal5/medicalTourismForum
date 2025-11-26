"use client";
import { useState, useEffect, Suspense } from "react";
import {
  Search,
  User,
  MessageSquare,
  FileQuestion,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter } from "next/navigation";

interface Question {
  _id: string;
  title: string;
  description?: string;
  author: {
    username: string;
    imageUrl: string;
  };
  category?: {
    name: string;
    color: string;
  };
  tags?: string[];
  createdAt: string;
  answerCount?: number;
}

interface Post {
  _id: string;
  postTitle: string;
  body?: any[];
  image?: any;
  author: {
    username: string;
    imageUrl: string;
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

interface Answer {
  _id: string;
  content: any[];
  question: {
    _id: string;
    title: string;
  };
  author: {
    username: string;
    imageUrl: string;
  };
  createdAt: string;
  voteCount?: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
  imageUrl?: string;
  bio?: string;
  joinedAt: string;
}

type SearchTab = "all" | "questions" | "posts" | "users" | "answers";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setQuestions([]);
      setPosts([]);
      setUsers([]);
      setAnswers([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions || []);
        setPosts(data.posts || []);
        setUsers(data.users || []);
        setAnswers(data.answers || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery);
    }
  };

  const getTotalResults = () => {
    return questions.length + posts.length + users.length + answers.length;
  };

  const getFilteredResults = () => {
    switch (activeTab) {
      case "questions":
        return { questions, posts: [], users: [], answers: [] };
      case "posts":
        return { questions: [], posts, users: [], answers: [] };
      case "users":
        return { questions: [], posts: [], users, answers: [] };
      case "answers":
        return { questions: [], posts: [], users: [], answers };
      default:
        return { questions, posts, users, answers };
    }
  };

  const filtered = getFilteredResults();

  const renderQuestions = (questionsToRender: Question[]) => {
    if (questionsToRender.length === 0) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FileQuestion className="w-5 h-5" />
          <span>Questions ({questionsToRender.length})</span>
        </h2>
        {questionsToRender.map((question) => (
          <Link
            key={question._id}
            href={`/question/${question._id}`}
            className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
              {question.title}
            </h3>
            {question.description && (
              <div
                className="text-gray-600 text-sm mb-3 line-clamp-2 prose prose-sm max-w-none [&>p]:mb-0"
                dangerouslySetInnerHTML={{ __html: question.description }}
              />
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image
                  src={question.author.imageUrl || "/placeholder-avatar.png"}
                  alt={question.author.username}
                  width={24}
                  height={24}
                  className="rounded-full"
                  unoptimized
                />
                <span className="text-sm text-gray-600">
                  by {question.author.username}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {question.answerCount !== undefined && (
                  <span>{question.answerCount} answers</span>
                )}
                {question.category && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {question.category.name}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderPosts = (postsToRender: Post[]) => {
    if (postsToRender.length === 0) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Posts ({postsToRender.length})</span>
        </h2>
        {postsToRender.map((post) => (
          <Link
            key={post._id}
            href={`/post/${post._id}`}
            className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
              {post.postTitle}
            </h3>
            {post.body && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {post.body.map((block: any) =>
                  block.children?.map((child: any) => child.text).join('')
                ).join(' ')}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image
                  src={post.author.imageUrl || "/placeholder-avatar.png"}
                  alt={post.author.username}
                  width={24}
                  height={24}
                  className="rounded-full"
                  unoptimized
                />
                <span className="text-sm text-gray-600">
                  by {post.author.username}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {post.commentCount !== undefined && (
                  <span>{post.commentCount} comments</span>
                )}
                {post.subreddit && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    c/{post.subreddit.title}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderUsers = (usersToRender: User[]) => {
    if (usersToRender.length === 0) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Users ({usersToRender.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {usersToRender.map((user) => (
            <Link
              key={user._id}
              href={`/profile/${user.username}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Image
                  src={user.imageUrl || "/placeholder-avatar.png"}
                  alt={user.username}
                  width={48}
                  height={48}
                  className="rounded-full"
                  unoptimized
                />
                <div>
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                    {user.username}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              {user.bio && (
                <p className="text-sm text-gray-600 line-clamp-2">{user.bio}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const renderAnswers = (answersToRender: Answer[]) => {
    if (answersToRender.length === 0) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Answers ({answersToRender.length})</span>
        </h2>
        {answersToRender.map((answer) => (
          <div
            key={answer._id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <Link
              href={`/question/${answer.question._id}`}
              className="text-sm text-blue-600 hover:underline mb-2 block"
            >
              Question: {answer.question.title}
            </Link>
            <div className="text-gray-700 mb-3">
              <p className="line-clamp-3">
                {answer.content?.[0]?.children?.[0]?.text ||
                  "Answer content..."}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image
                  src={answer.author.imageUrl || "/placeholder-avatar.png"}
                  alt={answer.author.username}
                  width={24}
                  height={24}
                  className="rounded-full"
                  unoptimized
                />
                <span className="text-sm text-gray-600">
                  by {answer.author.username}
                </span>
              </div>
              {answer.voteCount !== undefined && (
                <span className="text-sm text-gray-500">
                  {answer.voteCount} votes
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4">
        {/* Search Header */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search questions, users, and answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                suppressHydrationWarning
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setQuestions([]);
                    setPosts([]);
                    setUsers([]);
                    setAnswers([]);
                    router.push("/search");
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  suppressHydrationWarning
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {initialQuery && (
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {loading ? (
                  "Searching..."
                ) : (
                  <>
                    Found {getTotalResults()} result
                    {getTotalResults() !== 1 ? "s" : ""} for "
                    <span className="font-semibold">{initialQuery}</span>"
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        {initialQuery && getTotalResults() > 0 && (
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "all"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                All ({getTotalResults()})
              </button>
              <button
                onClick={() => setActiveTab("questions")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "questions"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Questions ({questions.length})
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "posts"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Posts ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "users"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab("answers")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "answers"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Answers ({answers.length})
              </button>
            </nav>
          </div>
        )}

        {/* Search Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : initialQuery ? (
          getTotalResults() > 0 ? (
            <div className="space-y-8">
              {renderQuestions(filtered.questions)}
              {renderPosts(filtered.posts)}
              {renderUsers(filtered.users)}
              {renderAnswers(filtered.answers)}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-500 mb-4">
                We couldn't find anything matching "{initialQuery}". Try
                different keywords.
              </p>
              <Link href="/ask">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Ask a Question
                </Button>
              </Link>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Search the Medical Forum
            </h3>
            <p className="text-gray-500 mb-6">
              Find questions, answers, and connect with medical professionals
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="text-gray-400">Try searching for:</span>
              {["cardiology", "surgery", "medication", "symptoms"].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      router.push(`/search?q=${term}`);
                      performSearch(term);
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {term}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
