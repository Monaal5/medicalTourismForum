"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  User,
  Calendar,
  MessageCircle,
  Share2,
  Edit3,
  Search,
  ChevronDown,
  MapPin,
  GraduationCap,
  Briefcase,
  Users,
  PenTool,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserProfile {
  _id: string;
  username: string | null;
  imageUrl: string | null;
  bio: string | null;
  joinedAt: string | null;
  questionsCount?: number;
  answersCount?: number;
  postsCount?: number;
}

interface UserQuestion {
  _id: string;
  title: string | null;
  createdAt: string | null;
  answerCount?: number;
  category: {
    name: string | null;
    color?:
      | "blue"
      | "red"
      | "pink"
      | "orange"
      | "green"
      | "purple"
      | "gray"
      | null;
  } | null;
}

interface UserAnswer {
  _id: string;
  content: any[];
  question: {
    _id: string;
    title: string;
  };
  createdAt: string;
  voteCount?: number;
}

interface UserPost {
  _id: string;
  postTitle: string;
  body?: any[];
  image?: any;
  publishedAt: string;
  subreddit: {
    title: string;
    slug: {
      current: string;
    };
  };
  commentCount?: number;
}

interface ProfileContentProps {
  user: UserProfile;
  questions: UserQuestion[];
  answers: UserAnswer[];
  posts: UserPost[];
}

export default function ProfileContent({
  user,
  questions,
  answers,
  posts,
}: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<"questions" | "answers" | "posts">(
    "questions"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuestions = questions.filter((q) =>
    q.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAnswers = answers.filter(
    (a) =>
      a.question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.content?.[0]?.children?.[0]?.text || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredPosts = posts.filter((p) =>
    p.postTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.body?.map((block: any) => 
      block.children?.map((child: any) => child.text).join('')
    ).join(' ') || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      purple: "bg-purple-100 text-purple-800",
      orange: "bg-orange-100 text-orange-800",
      pink: "bg-pink-100 text-pink-800",
      gray: "bg-gray-100 text-gray-800",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Profile Header */}
            <div className="mb-6">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.username || "User avatar"}
                      width={120}
                      height={120}
                      className="w-32 h-32 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user.username}
                    </h1>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                      suppressHydrationWarning
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm text-gray-600">
                      0 followers • 0 following
                    </span>
                  </div>

                  {user.bio ? (
                    <p className="text-gray-700 mb-4">{user.bio}</p>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                      <p className="text-gray-500 text-sm">
                        Write a description about yourself
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    suppressHydrationWarning
                  >
                    Add profile credential
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "questions"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Profile
                </button>

                <button
                  onClick={() => setActiveTab("answers")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "answers"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {answers.length} Answers
                </button>

                <button
                  onClick={() => setActiveTab("questions")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "questions"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {questions.length} Questions
                </button>

                <button
                  onClick={() => setActiveTab("posts")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "posts"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {posts.length} Posts
                </button>
                <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                  0 Followers
                </button>
                <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Following
                </button>
                <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Edits
                </button>
                <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Activity
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Search */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search content"
                    className="pl-10 border-gray-300 rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <span>Most recent</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {activeTab === "questions" && (
                  <>
                    {filteredQuestions.length > 0 ? (
                      filteredQuestions.map((question) => (
                        <div
                          key={question._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <Link href={`/question/${question._id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                              {question.title}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                {question.answerCount || 0}{" "}
                                {question.answerCount === 1 ? "answer" : "answers"} • Last followed{" "}
                                {formatDistanceToNow(
                                  new Date(question.createdAt || new Date())
                                )}{" "}
                                ago
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                                <PenTool className="w-3 h-3" />
                                <span>Answer</span>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No questions found
                        </h3>
                        <p className="text-gray-500">
                          {searchQuery
                            ? "No questions match your search."
                            : "This user hasn't asked any questions."}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "answers" && (
                  <>
                    {filteredAnswers.length > 0 ? (
                      filteredAnswers.map((answer) => (
                        <div
                          key={answer._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <Link href={`/question/${answer.question._id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                              {answer.question.title}
                            </h3>
                          </Link>
                          <p className="text-gray-600 mb-3 line-clamp-3">
                            {answer.content?.[0]?.children?.[0]?.text || "Answer content..."}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                {answer.voteCount || 0} votes •{" "}
                                {formatDistanceToNow(new Date(answer.createdAt))} ago
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                                <PenTool className="w-3 h-3" />
                                <span>View</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No answers found
                        </h3>
                        <p className="text-gray-500">
                          {searchQuery
                            ? "No answers match your search."
                            : "This user hasn't answered any questions."}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "posts" && (
                  <>
                    {filteredPosts.length > 0 ? (
                      filteredPosts.map((post) => (
                        <div
                          key={post._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <Link href={`/post/${post._id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                              {post.postTitle}
                            </h3>
                          </Link>
                          {post.body && (
                            <p className="text-gray-600 mb-3 line-clamp-3">
                              {post.body.map((block: any) => 
                                block.children?.map((child: any) => child.text).join('')
                              ).join(' ')}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                c/{post.subreddit.title} •{" "}
                                {post.commentCount || 0} comments •{" "}
                                {formatDistanceToNow(new Date(post.publishedAt))} ago
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>View</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No posts found
                        </h3>
                        <p className="text-gray-500">
                          {searchQuery
                            ? "No posts match your search."
                            : "This user hasn't created any posts."}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Credentials & Highlights */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Credentials & Highlights
                  </h3>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-800"
                  >
                    <Briefcase className="w-4 h-4 mr-3" />
                    Add employment credential
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-800"
                  >
                    <GraduationCap className="w-4 h-4 mr-3" />
                    Add education credential
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-800"
                  >
                    <MapPin className="w-4 h-4 mr-3" />
                    Add location credential
                  </Button>
                  <div className="flex items-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                    <Calendar className="w-4 h-4 mr-3" />
                    <span>
                      Joined{" "}
                      {user.joinedAt
                        ? new Date(user.joinedAt).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : "Recently"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Knows About */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Knows about
                  </h3>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">
                    You haven't added any topics yet.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Add topics
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
