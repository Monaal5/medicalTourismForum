"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageSquare, FileText, BarChart3, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType = "questions" | "posts" | "polls";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [activeTab, setActiveTab] = useState<TabType>("questions");
  const [category, setCategory] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      // Fetch category info
      const catRes = await fetch(`/api/categories/${slug}`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategory(catData.category);

        // Fetch questions
        const qRes = await fetch(`/api/categories/${slug}/questions`);
        if (qRes.ok) {
          const qData = await qRes.json();
          setQuestions(qData.questions || []);
        }

        // Fetch posts
        const pRes = await fetch(`/api/categories/${slug}/posts`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setPosts(pData.posts || []);
        }

        // Fetch polls
        const pollRes = await fetch(`/api/categories/${slug}/polls`);
        if (pollRes.ok) {
          const pollData = await pollRes.json();
          setPolls(pollData.polls || []);
        }
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <Link href="/categories">
          <Button variant="outline">Back to All Categories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <Link
        href="/categories"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Categories
      </Link>

      {/* Category Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl shadow-inner"
              style={{ backgroundColor: category.color || "#3b82f6" }}
            >
              {category.icon === "Heart" ? "❤️" : category.icon === "Brain" ? "🧠" : category.icon === "Stethoscope" ? "🩺" : category.icon === "Pill" ? "💊" : "📚"}
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600 mt-2 text-lg max-w-2xl">{category.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/ask?category=${category._id}`}>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2 px-6">
                <Plus className="w-5 h-5" />
                Ask Question
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 mb-8 bg-white p-1 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-200 whitespace-nowrap ${activeTab === "questions"
              ? "bg-blue-50 text-blue-600 font-bold shadow-sm"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Questions</span>
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "questions" ? "bg-blue-100" : "bg-gray-100"}`}>
            {questions.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-200 whitespace-nowrap ${activeTab === "posts"
              ? "bg-blue-50 text-blue-600 font-bold shadow-sm"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <FileText className="w-4 h-4" />
          <span>Posts</span>
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "posts" ? "bg-blue-100" : "bg-gray-100"}`}>
            {posts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("polls")}
          className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-200 whitespace-nowrap ${activeTab === "polls"
              ? "bg-blue-50 text-blue-600 font-bold shadow-sm"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Polls</span>
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "polls" ? "bg-blue-100" : "bg-gray-100"}`}>
            {polls.length}
          </span>
        </button>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {activeTab === "questions" && (
          <div className="grid gap-4">
            {questions.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No questions yet in this category</p>
                <Link href={`/ask?category=${category._id}`} className="mt-4 inline-block">
                  <Button variant="link" className="text-blue-600">Be the first to ask!</Button>
                </Link>
              </div>
            ) : (
              questions.map((q) => (
                <Link
                  key={q._id}
                  href={`/question/${q.slug?.current || q._id}`}
                  className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 group"
                >
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 mb-3">{q.title}</h3>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      {q.answerCount || 0} answers
                    </div>
                    <div>{new Date(q._createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === "posts" && (
          <div className="grid gap-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No posts yet in this category</p>
              </div>
            ) : (
              posts.map((p) => (
                <Link
                  key={p._id}
                  href={`/post/${p.slug?.current || p._id}`}
                  className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 group"
                >
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 mb-3">{p.title}</h3>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5 font-medium text-gray-700">
                      By {p.author?.name || "Anonymous"}
                    </div>
                    <div>{new Date(p._createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === "polls" && (
          <div className="grid gap-4">
            {polls.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No polls yet in this category</p>
              </div>
            ) : (
              polls.map((poll) => (
                <Link
                  key={poll.id}
                  href={`/polls/${poll.id}`}
                  className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">{poll.question}</h3>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5 font-bold text-blue-600">
                      {poll.total_votes || 0} votes cast
                    </div>
                    <div>Created on {new Date(poll.created_at).toLocaleDateString()}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
