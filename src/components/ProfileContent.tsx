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
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { UserPlus, UserMinus, Loader2, ChevronLeft, CheckCircle, X, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface UserProfile {
  _id: string;
  clerkId?: string | null;
  username: string | null;
  imageUrl: string | null;
  bio: string | null;
  joinedAt: string | null;
  questionsCount?: number;
  answersCount?: number;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  followers?: Array<{ _id: string; username: string | null; imageUrl: string | null }>;
  following?: Array<{ _id: string; username: string | null; imageUrl: string | null }>;
  employment?: string | null;
  education?: string | null;
  location?: string | null;
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
  postTitle: string | null;
  body?: any[] | null;
  image?: any;
  publishedAt: string | null;
  subreddit: {
    title: string | null;
    slug: {
      current?: string | null;
    } | null;
  } | null;
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
  const { user: currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<"questions" | "answers" | "posts" | "followers" | "following">(
    "questions"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [displayBio, setDisplayBio] = useState(user.bio || "");
  const [displayCredentials, setDisplayCredentials] = useState({
    employment: user.employment || "",
    education: user.education || "",
    location: user.location || "",
  });
  const [credentialForm, setCredentialForm] = useState(displayCredentials);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);

  const [bioText, setBioText] = useState(user.bio || "");
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Check if current user is the profile owner
  const isProfileOwner = React.useMemo(() => {
    if (!currentUser) return false;

    // Check by Clerk ID (most reliable)
    if (user.clerkId && currentUser.id === user.clerkId) {
      return true;
    }

    // Fallback to username matching (case insensitive)
    if (user.username && currentUser.username) {
      return currentUser.username.toLowerCase() === user.username.toLowerCase();
    }

    return false;
  }, [currentUser, user.clerkId, user.username]);

  React.useEffect(() => {
    if (currentUser && !isProfileOwner) {
      checkFollowStatus();
    } else {
      setCheckingFollow(false);
    }
  }, [currentUser, user._id]);

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(
        `/api/users/follow?userId=${currentUser?.id}&targetId=${user._id}`
      );
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    } finally {
      setCheckingFollow(false);
    }
  };



  const handleSaveBio = async () => {
    if (!bioText.trim()) return;

    setIsSavingBio(true);
    try {
      const response = await fetch("/api/users/update-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: bioText }),
      });

      if (response.ok) {
        toast.success("Profile bio updated");
        setIsEditingBio(false);
        setDisplayBio(bioText);
      } else {
        toast.error("Failed to update bio");
      }
    } catch (error) {
      console.error("Error updating bio:", error);
      toast.error("An error occurred");
    } finally {
      setIsSavingBio(false);
    }
  };


  const handleSaveCredentials = async () => {
    setIsSavingCredentials(true);
    try {
      const response = await fetch("/api/users/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentialForm),
      });

      if (response.ok) {
        toast.success("Credentials updated");
        setDisplayCredentials(credentialForm);
        setIsCredentialsOpen(false);
      } else {
        toast.error("Failed to update credentials");
      }
    } catch (error) {
      console.error("Error updating credentials:", error);
      toast.error("Failed to update credentials");
    } finally {
      setIsSavingCredentials(false);
    }
  };

  const toggleFollow = async () => {
    if (!currentUser) {
      toast.error("Please sign in to follow users");
      return;
    }

    console.log("=== TOGGLE FOLLOW ===");
    console.log("Current user ID (Clerk):", currentUser.id);
    console.log("Target user ID (Sanity):", user._id);
    console.log("Target username:", user.username);
    console.log("Action:", isFollowing ? "unfollow" : "follow");

    setFollowLoading(true);
    const action = isFollowing ? "unfollow" : "follow";

    // Optimistic update
    setIsFollowing(!isFollowing);

    try {
      const requestBody = {
        targetUserId: user._id,
        action,
      };

      console.log("Sending request:", requestBody);

      const response = await fetch("/api/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        // Revert on error
        setIsFollowing(isFollowing);
        toast.error(responseData.error || "Failed to update follow status");
        console.error("Follow failed:", responseData);
      } else {
        toast.success(action === "follow" ? `Following ${user.username}` : `Unfollowed ${user.username}`);
        console.log("✓ Follow successful");
      }
    } catch (error) {
      setIsFollowing(isFollowing);
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

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
      <Dialog open={isCredentialsOpen} onOpenChange={setIsCredentialsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Credentials & Highlights</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employment">Employment</Label>
              <Input
                id="employment"
                placeholder="Position at Company"
                value={credentialForm.employment}
                onChange={(e) =>
                  setCredentialForm({ ...credentialForm, employment: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                placeholder="School or University"
                value={credentialForm.education}
                onChange={(e) =>
                  setCredentialForm({ ...credentialForm, education: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={credentialForm.location}
                onChange={(e) =>
                  setCredentialForm({ ...credentialForm, location: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCredentialsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCredentials} disabled={isSavingCredentials}>
              {isSavingCredentials && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="min-h-screen bg-gray-50 md:bg-white" suppressHydrationWarning>
        {/* Mobile View */}
        <div className="md:hidden pb-20">
          {/* Header */}
          <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </Button>
            <h1 className="text-lg font-bold text-gray-900">Profile</h1>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-6 h-6 text-gray-700" />
            </Button>
          </div>

          <div className="px-4 pt-6 pb-8 bg-white rounded-b-[2rem] shadow-sm mb-4">
            {/* Profile Image */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Image
                  src={user.imageUrl || "/default-avatar.png"}
                  alt={user.username || "User"}
                  width={120}
                  height={120}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                  unoptimized
                />
              </div>
            </div>

            {/* Name & Role */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{user.username}</h2>
              {isEditingBio ? (
                <div className="mb-4 space-y-3 text-left">
                  <Textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                  <div className="flex space-x-2 justify-center">
                    <Button
                      size="sm"
                      onClick={handleSaveBio}
                      disabled={isSavingBio}
                      className="bg-blue-600 text-white"
                    >
                      {isSavingBio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingBio(false)}
                      disabled={isSavingBio}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-2">{displayBio || "Community Member"}</p>
              )}
              <div className="flex items-center justify-center space-x-1 text-green-600 bg-green-50 inline-flex px-3 py-1 rounded-full mx-auto">
                <CheckCircle className="w-3 h-3 fill-current" />
                <span className="text-xs font-medium">Verified Professional</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              {isProfileOwner ? (
                <Button
                  onClick={() => {
                    setBioText(displayBio || "");
                    setIsEditingBio(true);
                  }}
                  className="flex-1 bg-blue-600 text-white rounded-xl py-6 text-base font-medium shadow-blue-200 shadow-lg hover:bg-blue-700">
                  Edit Profile
                </Button>
              ) : (
                <Button
                  onClick={toggleFollow}
                  disabled={followLoading || checkingFollow}
                  className={`flex-1 rounded-xl py-6 text-base font-medium ${isFollowing
                    ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                >
                  {followLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </Button>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab("questions")}
                className={`bg-white border rounded-2xl p-4 text-center shadow-sm transition-all ${activeTab === "questions" ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-100"}`}
              >
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {user.questionsCount || 0}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Questions</div>
              </button>
              <button
                onClick={() => setActiveTab("answers")}
                className={`bg-white border rounded-2xl p-4 text-center shadow-sm transition-all ${activeTab === "answers" ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-100"}`}
              >
                <div className="text-xl font-bold text-gray-900 mb-1">{user.answersCount || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Answers</div>
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`bg-white border rounded-2xl p-4 text-center shadow-sm transition-all ${activeTab === "posts" ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-100"}`}
              >
                <div className="text-xl font-bold text-gray-900 mb-1">{user.postsCount || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Posts</div>
              </button>
            </div>
          </div>

          {/* Mobile Content Display */}
          <div className="px-4 pb-20 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3 capitalize">{activeTab}</h3>

            {activeTab === "questions" && (
              <div className="space-y-3">
                {questions.length > 0 ? (
                  questions.map((question) => (
                    <div key={question._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Image
                          src={user.imageUrl || "/default-avatar.png"}
                          alt={user.username || "User"}
                          width={24}
                          height={24}
                          className="rounded-full w-6 h-6 object-cover"
                          unoptimized
                        />
                        <span className="text-xs font-medium text-gray-900">{user.username}</span>
                      </div>
                      <Link href={`/question/${question._id}`} className="block">
                        <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">{question.title}</h4>
                      </Link>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{question.answerCount || 0}</span>
                          </div>
                          <span>{formatDistanceToNow(new Date(question.createdAt || new Date()))} ago</span>
                        </div>
                        <Link href={`/question/${question._id}`} className="flex items-center space-x-1 text-blue-600 text-xs font-medium">
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Answer</span>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No questions found</div>
                )}
              </div>
            )}

            {activeTab === "answers" && (
              <div className="space-y-3">
                {answers.length > 0 ? (
                  answers.map((answer) => (
                    <div key={answer._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Image
                          src={user.imageUrl || "/default-avatar.png"}
                          alt={user.username || "User"}
                          width={24}
                          height={24}
                          className="rounded-full w-6 h-6 object-cover"
                          unoptimized
                        />
                        <span className="text-xs font-medium text-gray-900">{user.username}</span>
                      </div>
                      <Link href={`/question/${answer.question._id}`} className="block">
                        <h4 className="font-medium text-gray-900 mb-2">Re: {answer.question.title}</h4>
                      </Link>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {answer.content?.[0]?.children?.[0]?.text || "Answer content..."}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{answer.voteCount || 0}</span>
                          </div>
                          <span>{formatDistanceToNow(new Date(answer.createdAt))} ago</span>
                        </div>
                        <Link href={`/question/${answer.question._id}`} className="flex items-center space-x-1 text-blue-600 text-xs font-medium">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No answers found</div>
                )}
              </div>
            )}

            {activeTab === "posts" && (
              <div className="space-y-3">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div key={post._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Image
                          src={user.imageUrl || "/default-avatar.png"}
                          alt={user.username || "User"}
                          width={24}
                          height={24}
                          className="rounded-full w-6 h-6 object-cover"
                          unoptimized
                        />
                        <span className="text-xs font-medium text-gray-900">{user.username}</span>
                      </div>
                      <Link href={`/post/${post._id}`} className="block">
                        <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">{post.postTitle}</h4>
                      </Link>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{post.commentCount || 0}</span>
                          </div>
                          <span>{post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt)) : ""} ago</span>
                        </div>
                        <Link href={`/post/${post._id}`} className="flex items-center space-x-1 text-blue-600 text-xs font-medium">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Comment</span>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No posts found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 py-6">
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
                        {user.followersCount || 0} followers • {user.followingCount || 0} following
                      </span>
                    </div>

                    {isEditingBio ? (
                      <div className="mb-4 space-y-3">
                        <Textarea
                          value={bioText}
                          onChange={(e) => setBioText(e.target.value)}
                          placeholder="Tell us about yourself..."
                          className="min-h-[100px]"
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={handleSaveBio}
                            disabled={isSavingBio}
                            className="bg-blue-600 text-white"
                          >
                            {isSavingBio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditingBio(false)}
                            disabled={isSavingBio}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 group relative">
                        {displayBio ? (
                          <p className="text-gray-700">{displayBio}</p>
                        ) : (
                          isProfileOwner ? (
                            <div
                              onClick={() => setIsEditingBio(true)}
                              className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <p className="text-gray-500 text-sm flex items-center justify-center">
                                <Edit3 className="w-4 h-4 mr-2" />
                                Write a description about yourself
                              </p>
                            </div>
                          ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <p className="text-gray-500 text-sm">
                                No description provided.
                              </p>
                            </div>
                          )
                        )}
                        {isProfileOwner && displayBio && (
                          <button
                            onClick={() => {
                              setBioText(displayBio || "");
                              setIsEditingBio(true);
                            }}
                            className="absolute -right-2 -top-2 p-1.5 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                          >
                            <Edit3 className="w-3 h-3 text-gray-600" />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-3">
                      {isProfileOwner ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          suppressHydrationWarning
                        >
                          Add profile credential
                        </Button>
                      ) : (
                        <Button
                          onClick={toggleFollow}
                          disabled={followLoading || checkingFollow}
                          className={`${isFollowing
                            ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                          {followLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : isFollowing ? (
                            <UserMinus className="w-4 h-4 mr-2" />
                          ) : (
                            <UserPlus className="w-4 h-4 mr-2" />
                          )}
                          {isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("questions")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "questions"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    suppressHydrationWarning
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => setActiveTab("answers")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "answers"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    suppressHydrationWarning
                  >
                    {answers.length} Answers
                  </button>

                  <button
                    onClick={() => setActiveTab("questions")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "questions"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    suppressHydrationWarning
                  >
                    {questions.length} Questions
                  </button>

                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "posts"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    suppressHydrationWarning
                  >
                    {posts.length} Posts
                  </button>
                  <button
                    onClick={() => setActiveTab("followers")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "followers"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    suppressHydrationWarning
                  >
                    {user.followersCount || 0} Followers
                  </button>
                  <button
                    onClick={() => setActiveTab("following")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "following"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    suppressHydrationWarning
                  >
                    {user.followingCount || 0} Following
                  </button>
                  <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm" suppressHydrationWarning>
                    Edits
                  </button>
                  <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm" suppressHydrationWarning>
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
                                  c/{post.subreddit?.title || "unknown"} •{" "}
                                  {post.commentCount || 0} comments •{" "}
                                  {post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt)) : ""} ago
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

                  {activeTab === "followers" && (
                    <>
                      {user.followers && user.followers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {user.followers.map((follower) => (
                            <Link
                              key={follower._id}
                              href={`/profile/${follower.username}`}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow flex items-center space-x-3"
                            >
                              <Image
                                src={follower.imageUrl || "/default-avatar.png"}
                                alt={follower.username || "User"}
                                width={48}
                                height={48}
                                className="rounded-full"
                                unoptimized
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {follower.username}
                                </h3>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No followers yet
                          </h3>
                          <p className="text-gray-500">
                            This user doesn't have any followers.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === "following" && (
                    <>
                      {user.following && user.following.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {user.following.map((followedUser) => (
                            <Link
                              key={followedUser._id}
                              href={`/profile/${followedUser.username}`}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow flex items-center space-x-3"
                            >
                              <Image
                                src={followedUser.imageUrl || "/default-avatar.png"}
                                alt={followedUser.username || "User"}
                                width={48}
                                height={48}
                                className="rounded-full"
                                unoptimized
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {followedUser.username}
                                </h3>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Not following anyone
                          </h3>
                          <p className="text-gray-500">
                            This user isn't following anyone yet.
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
                    {isProfileOwner && (
                      <Button variant="ghost" size="sm" onClick={() => setIsCredentialsOpen(true)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {displayCredentials.employment ? (
                      <div className="flex items-center text-gray-700">
                        <Briefcase className="w-4 h-4 mr-3 text-gray-500" />
                        <span>{displayCredentials.employment}</span>
                      </div>
                    ) : isProfileOwner ? (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-600 hover:text-gray-800"
                        onClick={() => setIsCredentialsOpen(true)}
                      >
                        <Briefcase className="w-4 h-4 mr-3" />
                        Add employment credential
                      </Button>
                    ) : null}

                    {displayCredentials.education ? (
                      <div className="flex items-center text-gray-700">
                        <GraduationCap className="w-4 h-4 mr-3 text-gray-500" />
                        <span>{displayCredentials.education}</span>
                      </div>
                    ) : isProfileOwner ? (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-600 hover:text-gray-800"
                        onClick={() => setIsCredentialsOpen(true)}
                      >
                        <GraduationCap className="w-4 h-4 mr-3" />
                        Add education credential
                      </Button>
                    ) : null}

                    {displayCredentials.location ? (
                      <div className="flex items-center text-gray-700">
                        <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                        <span>{displayCredentials.location}</span>
                      </div>
                    ) : isProfileOwner ? (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-600 hover:text-gray-800"
                        onClick={() => setIsCredentialsOpen(true)}
                      >
                        <MapPin className="w-4 h-4 mr-3" />
                        Add location credential
                      </Button>
                    ) : null}

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
    </div>
  );
}
