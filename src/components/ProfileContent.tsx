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
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Globe,
  Link as LinkIcon,
  Award
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
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  reputation?: number;
  badges?: Array<{
    name: string;
    iconUrl: string | null;
    description: string | null;
    awardedAt: string;
  }>;
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
    socialLinks: user.socialLinks || {
      twitter: "",
      linkedin: "",
      instagram: "",
      facebook: "",
      website: ""
    }
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
        const errorMessage = responseData.error || "Failed to update follow status";
        toast.error(errorMessage);
        console.error("Follow failed:", errorMessage);
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
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Professional Info</h3>
              <div className="space-y-2">
                <Label htmlFor="employment">Employment</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="employment"
                    placeholder="Position at Company"
                    className="pl-9"
                    value={credentialForm.employment}
                    onChange={(e) =>
                      setCredentialForm({ ...credentialForm, employment: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="education"
                    placeholder="School or University"
                    className="pl-9"
                    value={credentialForm.education}
                    onChange={(e) =>
                      setCredentialForm({ ...credentialForm, education: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="location"
                    placeholder="City, Country"
                    className="pl-9"
                    value={credentialForm.location}
                    onChange={(e) =>
                      setCredentialForm({ ...credentialForm, location: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Social Profiles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="website"
                      placeholder="https://yourwebsite.com"
                      className="pl-9"
                      value={credentialForm.socialLinks?.website || ""}
                      onChange={(e) =>
                        setCredentialForm({
                          ...credentialForm,
                          socialLinks: { ...credentialForm.socialLinks, website: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="twitter"
                      placeholder="Twitter URL"
                      className="pl-9"
                      value={credentialForm.socialLinks?.twitter || ""}
                      onChange={(e) =>
                        setCredentialForm({
                          ...credentialForm,
                          socialLinks: { ...credentialForm.socialLinks, twitter: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="linkedin"
                      placeholder="LinkedIn URL"
                      className="pl-9"
                      value={credentialForm.socialLinks?.linkedin || ""}
                      onChange={(e) =>
                        setCredentialForm({
                          ...credentialForm,
                          socialLinks: { ...credentialForm.socialLinks, linkedin: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="instagram"
                      placeholder="Instagram URL"
                      className="pl-9"
                      value={credentialForm.socialLinks?.instagram || ""}
                      onChange={(e) =>
                        setCredentialForm({
                          ...credentialForm,
                          socialLinks: { ...credentialForm.socialLinks, instagram: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="facebook"
                      placeholder="Facebook URL"
                      className="pl-9"
                      value={credentialForm.socialLinks?.facebook || ""}
                      onChange={(e) =>
                        setCredentialForm({
                          ...credentialForm,
                          socialLinks: { ...credentialForm.socialLinks, facebook: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
              </div>
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
                <div className="relative inline-block max-w-md mx-auto mb-2 px-4">
                  <p className="text-gray-500 text-sm whitespace-pre-wrap">{displayBio || "Community Member"}</p>
                  {isProfileOwner && (
                    <button
                      onClick={() => setIsEditingBio(true)}
                      className="absolute -right-4 top-0 p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-1 text-green-600 bg-green-50 inline-flex px-3 py-1 rounded-full mb-4">
                  <CheckCircle className="w-3 h-3 fill-current" />
                  <span className="text-xs font-medium">Verified Professional</span>
                </div>
              </div>

              {/* Mobile Badges & Rep */}
              <div className="flex flex-col items-center justify-center mb-6 space-y-2">
                <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                  <Award className="w-4 h-4" />
                  <span className="font-semibold">{user.reputation || 0} Reputation</span>
                </div>
                {user.badges && user.badges.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {user.badges.map((badge, idx) => (
                      <div key={idx} className="flex items-center space-x-1 bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs border border-purple-100" title={badge.description || badge.name}>
                        <span>{badge.iconUrl || '🏅'}</span>
                        <span>{badge.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Credentials */}
              <div className="flex flex-wrap justify-center gap-2 mb-4 px-2">
                {displayCredentials.employment && (
                  <div className="flex items-center text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    <Briefcase className="w-3 h-3 mr-1 text-gray-500" />
                    <span>{displayCredentials.employment}</span>
                  </div>
                )}
                {displayCredentials.education && (
                  <div className="flex items-center text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    <GraduationCap className="w-3 h-3 mr-1 text-gray-500" />
                    <span>{displayCredentials.education}</span>
                  </div>
                )}
                {displayCredentials.location && (
                  <div className="flex items-center text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    <MapPin className="w-3 h-3 mr-1 text-gray-500" />
                    <span>{displayCredentials.location}</span>
                  </div>
                )}
              </div>

              {/* Mobile Socials */}
              {displayCredentials.socialLinks && Object.values(displayCredentials.socialLinks).some(v => v) && (
                <div className="flex justify-center gap-4 mb-6">
                  {displayCredentials.socialLinks.twitter && (
                    <a href={displayCredentials.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 p-2 bg-gray-50 rounded-full">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {displayCredentials.socialLinks.linkedin && (
                    <a href={displayCredentials.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 p-2 bg-gray-50 rounded-full">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {displayCredentials.socialLinks.facebook && (
                    <a href={displayCredentials.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 p-2 bg-gray-50 rounded-full">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {displayCredentials.socialLinks.instagram && (
                    <a href={displayCredentials.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 p-2 bg-gray-50 rounded-full">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {displayCredentials.socialLinks.website && (
                    <a href={displayCredentials.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-800 p-2 bg-gray-50 rounded-full">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              {isProfileOwner ? (
                <Button
                  onClick={() => setIsCredentialsOpen(true)}
                  className="flex-1 bg-blue-600 text-white rounded-xl py-6 text-base font-medium shadow-blue-200 shadow-lg hover:bg-blue-700">
                  Edit Details
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
            <div className="lg:col-span-3">
              {/* Profile Header */}
              <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.username || "User avatar"}
                        width={120}
                        height={120}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm"
                        unoptimized
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-50">
                        <User className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h1 className="text-3xl font-bold text-gray-900">
                          {user.username}
                        </h1>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-gray-600"
                          suppressHydrationWarning
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Action Buttons (Desktop) */}
                      <div className="hidden md:flex items-center space-x-2">
                        {isProfileOwner ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCredentialsOpen(true)}
                            className="flex items-center space-x-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit Profile</span>
                          </Button>
                        ) : (
                          <Button
                            onClick={toggleFollow}
                            disabled={followLoading || checkingFollow}
                            size="sm"
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

                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                      <span>
                        <strong className="text-gray-900">{user.followersCount || 0}</strong> followers
                      </span>
                      <span>
                        <strong className="text-gray-900">{user.followingCount || 0}</strong> following
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        Joined {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "recently"}
                      </span>
                    </div>

                    {/* Desktop Badges & Rep */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-1.5 text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                        <Award className="w-4 h-4" />
                        <span className="font-bold text-sm">{user.reputation || 0} Reputation</span>
                      </div>
                      {user.badges && user.badges.map((badge, idx) => (
                        <div key={idx} className="flex items-center space-x-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-medium border border-purple-100" title={badge.description || badge.name}>
                          <span>{badge.iconUrl || '🏅'}</span>
                          <span>{badge.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bio Section */}
                    {isEditingBio ? (
                      <div className="mb-4 space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-medium text-gray-700">About You</label>
                        </div>
                        <Textarea
                          value={bioText}
                          onChange={(e) => setBioText(e.target.value)}
                          placeholder="Tell us about yourself..."
                          className="min-h-[100px] bg-white"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setIsEditingBio(false);
                              setBioText(displayBio || "");
                            }}
                            disabled={isSavingBio}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveBio}
                            disabled={isSavingBio}
                            className="bg-blue-600 text-white"
                          >
                            {isSavingBio && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                            Save Bio
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 relative group">
                        {displayBio ? (
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{displayBio}</p>
                        ) : isProfileOwner ? (
                          <p className="text-gray-400 italic cursor-pointer hover:text-gray-600 transition-colors" onClick={() => setIsEditingBio(true)}>
                            Add a bio to tell people about yourself...
                          </p>
                        ) : null}

                        {isProfileOwner && !isEditingBio && (
                          <button
                            onClick={() => setIsEditingBio(true)}
                            className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                            title="Edit Bio"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Credentials & Socials Line */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {displayCredentials.employment && (
                        <div className="flex items-center text-gray-700 bg-gray-50 px-2 py-1 rounded">
                          <Briefcase className="w-3.5 h-3.5 mr-2 text-gray-500" />
                          <span>{displayCredentials.employment}</span>
                        </div>
                      )}

                      {displayCredentials.education && (
                        <div className="flex items-center text-gray-700 bg-gray-50 px-2 py-1 rounded">
                          <GraduationCap className="w-3.5 h-3.5 mr-2 text-gray-500" />
                          <span>{displayCredentials.education}</span>
                        </div>
                      )}

                      {displayCredentials.location && (
                        <div className="flex items-center text-gray-700 bg-gray-50 px-2 py-1 rounded">
                          <MapPin className="w-3.5 h-3.5 mr-2 text-gray-500" />
                          <span>{displayCredentials.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Social Links */}
                    {displayCredentials.socialLinks && Object.values(displayCredentials.socialLinks).some(v => v) && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        {displayCredentials.socialLinks.twitter && (
                          <a href={displayCredentials.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                        {displayCredentials.socialLinks.linkedin && (
                          <a href={displayCredentials.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {displayCredentials.socialLinks.facebook && (
                          <a href={displayCredentials.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                            <Facebook className="w-4 h-4" />
                          </a>
                        )}
                        {displayCredentials.socialLinks.instagram && (
                          <a href={displayCredentials.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                        {displayCredentials.socialLinks.website && (
                          <a href={displayCredentials.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-800 transition-colors">
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
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
                                {Array.isArray(post.body)
                                  ? post.body.map((block: any) =>
                                    block.children?.map((child: any) => child.text).join('')
                                  ).join(' ')
                                  : typeof post.body === 'object' && (post.body as any).content
                                    ? String((post.body as any).content).replace(/<[^>]*>?/gm, '')
                                    : ''}
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

            {/* Sidebar removed */}
          </div>
        </div>
      </div>
    </div>
  );
}
