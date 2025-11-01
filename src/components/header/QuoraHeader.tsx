"use client";
import { useState, useEffect, useRef } from "react";
import {
  useUser,
  SignInButton,
  SignUpButton,
  UserButton,
  useClerk,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Home,
  List,
  PenTool,
  Users,
  Bell,
  Search,
  Globe,
  Plus,
  ChevronDown,
  MessageCircle,
  Megaphone,
  DollarSign,
  BarChart3,
  Bookmark,
  FileText,
  Sparkles,
  Moon,
  Settings,
  Languages,
  HelpCircle,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logoWithName from "@/images/logoWithName.png";
import { generateUsername } from "@/lib/username";
import AnswerButton from "@/components/AnswerButton";
import HelpDialog from "@/components/HelpDialog";

export default function QuoraHeader() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [sanityUsername, setSanityUsername] = useState<string | null>(null);
  const [usernameLoading, setUsernameLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const categoriesDialogRef = useRef<HTMLDivElement>(null);

  // Fetch username from Sanity to match what's used in posts/questions
  useEffect(() => {
    if (user?.id) {
      setUsernameLoading(true);

      fetch(`/api/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            setSanityUsername(data.username);
          } else if (data.error) {
            // User doesn't exist in Sanity yet, will use generated username
            setSanityUsername(null);
          }
          setUsernameLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user from Sanity:", error);
          setUsernameLoading(false);
        });
    }
  }, [user?.id]);

  // Get username - use Sanity username if available, otherwise generate
  const getUsername = () => {
    if (!user) return "user";

    // Use Sanity username if we have it (this matches posts/questions)
    if (sanityUsername) {
      return sanityUsername;
    }

    // Fallback to generated username while loading or if user not in Sanity
    return (
      user.username ||
      generateUsername(user.fullName || user.firstName || "User", user.id)
    );
  };

  // Get user's profile URL using same logic as PostCard
  const getUserProfileUrl = () => {
    if (!user) return "/profile";
    return `/profile/${getUsername()}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
      
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.mobile-menu-button')
      ) {
        setIsMobileSidebarOpen(false);
      }
      
      if (
        categoriesDialogRef.current &&
        !categoriesDialogRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.categories-button')
      ) {
        setIsCategoriesDialogOpen(false);
      }
    }

    if (isProfileDropdownOpen || isMobileSidebarOpen || isCategoriesDialogOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen, isMobileSidebarOpen, isCategoriesDialogOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionInput.trim()) {
      router.push(`/ask?q=${encodeURIComponent(questionInput)}`);
    }
  };

  return (
    <>
    <header
      className="bg-white border-b border-gray-200 sticky top-0 z-50"
      suppressHydrationWarning
    >
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile: Hamburger Menu */}
          <button
            className="md:hidden mobile-menu-button text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src={logoWithName}
                alt="Medical Tourism Forum"
                width={320}
                height={100}
                className="h-12 md:h-20 w-auto"
              />
            </Link>

            {/* Desktop Navigation Icons */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Home className="w-5 h-5" />
              </Link>
              <Link
                href="/categories"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <List className="w-5 h-5" />
              </Link>
              <Link
                href="/ask"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <PenTool className="w-5 h-5" />
              </Link>
              <Link
                href="/settings"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Users className="w-5 h-5" />
              </Link>
              <Link
                href="/notifications"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
              </Link>
            </nav>
          </div>

          {/* Center - Search Bar (Desktop) / Search Button (Mobile) */}
          <div className="flex-1 max-w-lg mx-4">
            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              className="relative hidden md:block"
              suppressHydrationWarning
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search questions and answers"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                suppressHydrationWarning
              />
            </form>
            
            {/* Mobile Search Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              <Search className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Right Side - User Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center space-x-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <span>Premium</span>
                </Button>

                <div className="flex items-center space-x-2">
                  <div className="relative" ref={dropdownRef}>
                    <Image
                      src={
                        user.imageUrl ||
                        "https://via.placeholder.com/32x32/cccccc/666666?text=U"
                      }
                      alt={user.username || "User"}
                      width={32}
                      height={32}
                      className="rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
                      }
                      unoptimized
                    />

                    {/* Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        {/* Profile Header */}
                        <div className="flex items-center px-4 py-3 border-b border-gray-100">
                          <Image
                            src={
                              user.imageUrl ||
                              "https://via.placeholder.com/40x40/cccccc/666666?text=U"
                            }
                            alt={user.username || "User"}
                            width={40}
                            height={40}
                            className="rounded-full mr-3"
                            unoptimized
                          />
                          <div className="flex-1">
                            <Link
                              href={getUserProfileUrl()}
                              className="block"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <div className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                                {user.fullName || user.firstName || "User"}
                              </div>
                              <div className="text-xs text-gray-400">
                                @{getUsername()}
                              </div>
                            </Link>
                            <div className="text-sm text-gray-500">
                              {user.emailAddresses[0]?.emailAddress}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            href="/messages"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <MessageCircle className="w-4 h-4 mr-3" />
                            Messages
                          </Link>
                          <Link
                            href="/create-ad"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Megaphone className="w-4 h-4 mr-3" />
                            Create Ad
                          </Link>
                          <Link
                            href="/monetization"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <DollarSign className="w-4 h-4 mr-3" />
                            Monetization
                          </Link>
                          <Link
                            href="/stats"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <BarChart3 className="w-4 h-4 mr-3" />
                            Your content & stats
                          </Link>
                          <Link
                            href="/bookmarks"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Bookmark className="w-4 h-4 mr-3" />
                            Bookmarks
                          </Link>
                          <Link
                            href="/drafts"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <FileText className="w-4 h-4 mr-3" />
                            Drafts
                          </Link>
                          <Link
                            href="/premium"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Sparkles className="w-4 h-4 mr-3" />
                            Try Premium+
                          </Link>
                        </div>

                        {/* Settings Section */}
                        <div className="border-t border-gray-100 py-1">
                          <div className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-50">
                            <div className="flex items-center">
                              <Moon className="w-4 h-4 mr-3" />
                              Dark mode
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              AUTO
                            </span>
                          </div>
                          <Link
                            href="/settings"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                          </Link>
                          <Link
                            href="/languages"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Languages className="w-4 h-4 mr-3" />
                            Languages
                          </Link>
                          <HelpDialog>
                            <div className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer w-full text-left">
                              <HelpCircle className="w-4 h-4 mr-3" />
                              Help
                            </div>
                          </HelpDialog>
                        </div>

                        {/* Footer Links */}
                        <div className="border-t border-gray-100 pt-2">
                          <div className="px-4 py-1">
                            <div className="flex flex-wrap text-xs text-gray-500 space-x-2">
                              <Link
                                href="/about"
                                className="hover:text-gray-700"
                              >
                                About
                              </Link>
                              <Link
                                href="/careers"
                                className="hover:text-gray-700"
                              >
                                Careers
                              </Link>
                              <Link
                                href="/terms"
                                className="hover:text-gray-700"
                              >
                                Terms
                              </Link>
                              <Link
                                href="/privacy"
                                className="hover:text-gray-700"
                              >
                                Privacy
                              </Link>
                              <Link
                                href="/acceptable-use"
                                className="hover:text-gray-700"
                              >
                                Acceptable Use
                              </Link>
                              <Link
                                href="/advertise"
                                className="hover:text-gray-700"
                              >
                                Advertise
                              </Link>
                              <Link
                                href="/press"
                                className="hover:text-gray-700"
                              >
                                Press
                              </Link>
                              <Link
                                href="/ad-choices"
                                className="hover:text-gray-700"
                              >
                                Your Ad Choices
                              </Link>
                              <Link
                                href="/grievance"
                                className="hover:text-gray-700"
                              >
                                Grievance Officer
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Globe className="w-5 h-5 text-gray-600" />
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1"
                    onClick={() => router.push("/ask")}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add question</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  {/* Backup UserButton for additional logout option */}
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                      },
                    }}
                  />
                </div>
              </>
            ) : (
              <div
                className="flex items-center space-x-2"
                suppressHydrationWarning
              >
                <SignInButton mode="modal">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                    suppressHydrationWarning
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Input Bar */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-4">
            {user && (
              <Image
                src={
                  user.imageUrl ||
                  "https://via.placeholder.com/40x40/cccccc/666666?text=U"
                }
                alt={user.fullName || "User"}
                width={40}
                height={40}
                className="rounded-full"
                unoptimized
              />
            )}
            <form
              onSubmit={handleAskQuestion}
              className="flex-1"
              suppressHydrationWarning
            >
              <Input
                type="text"
                placeholder="What do you want to ask or share?"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                className="w-full border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                suppressHydrationWarning
              />
            </form>
            <div
              className="flex items-center space-x-2"
              suppressHydrationWarning
            >
              <Button
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => router.push("/ask")}
                suppressHydrationWarning
              >
                Ask
              </Button>
              <AnswerButton
                variant="outline"
                size="sm"
                suppressHydrationWarning
              />
              <Button
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => router.push("/create-post")}
                suppressHydrationWarning
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Search Overlay */}
    {isMobileSearchOpen && (
      <div className="md:hidden fixed inset-0 bg-white z-50 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <button onClick={() => setIsMobileSearchOpen(false)}>
            <X className="w-6 h-6" />
          </button>
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              type="text"
              placeholder="Search questions and answers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              autoFocus
            />
          </form>
        </div>
      </div>
    )}

    {/* Mobile Sidebar */}
    {isMobileSidebarOpen && (
      <div className="md:hidden fixed inset-0 z-40">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileSidebarOpen(false)} />
        <div ref={sidebarRef} className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setIsMobileSidebarOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <Link href="/" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileSidebarOpen(false)}>
                <Home className="w-5 h-5 mr-3" />
                <span>Home</span>
              </Link>
              
              <button 
                className="categories-button w-full flex items-center px-4 py-3 rounded-lg hover:bg-gray-100"
                onClick={() => {
                  setIsCategoriesDialogOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
              >
                <List className="w-5 h-5 mr-3" />
                <span>Categories</span>
              </button>

              <Link href="/ask" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileSidebarOpen(false)}>
                <PenTool className="w-5 h-5 mr-3" />
                <span>Ask Question</span>
              </Link>

              <Link href="/create-post" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileSidebarOpen(false)}>
                <Plus className="w-5 h-5 mr-3" />
                <span>Create Post</span>
              </Link>

              <Link href="/settings" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileSidebarOpen(false)}>
                <Users className="w-5 h-5 mr-3" />
                <span>Communities</span>
              </Link>

              <Link href="/notifications" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileSidebarOpen(false)}>
                <Bell className="w-5 h-5 mr-3" />
                <span>Notifications</span>
              </Link>

              {user && (
                <>
                  <div className="border-t border-gray-200 my-4"></div>
                  <Link href={getUserProfileUrl()} className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileSidebarOpen(false)}>
                    <Image src={user.imageUrl || "/default-avatar.png"} alt="Profile" width={24} height={24} className="rounded-full mr-3" unoptimized />
                    <span>Profile</span>
                  </Link>
                  <Link href="/bookmarks" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileSidebarOpen(false)}>
                    <Bookmark className="w-5 h-5 mr-3" />
                    <span>Bookmarks</span>
                  </Link>
                  <Link href="/settings" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileSidebarOpen(false)}>
                    <Settings className="w-5 h-5 mr-3" />
                    <span>Settings</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Categories Dialog */}
    {isCategoriesDialogOpen && (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsCategoriesDialogOpen(false)} />
        <div ref={categoriesDialogRef} className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Categories</h2>
            <button onClick={() => setIsCategoriesDialogOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Add your categories here */}
            <Link href="/categories/cardiology" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={() => setIsCategoriesDialogOpen(false)}>
              <h3 className="font-semibold text-red-600">Cardiology</h3>
              <p className="text-sm text-gray-500">Heart and cardiovascular health</p>
            </Link>
            <Link href="/categories/ophthalmology" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={() => setIsCategoriesDialogOpen(false)}>
              <h3 className="font-semibold text-blue-600">Ophthalmology</h3>
              <p className="text-sm text-gray-500">Eye care and vision correction</p>
            </Link>
            <Link href="/categories/plastic-surgery" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={() => setIsCategoriesDialogOpen(false)}>
              <h3 className="font-semibold text-purple-600">Plastic Surgery</h3>
              <p className="text-sm text-gray-500">Cosmetic and reconstructive surgery</p>
            </Link>
            <Link href="/categories/dental" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={() => setIsCategoriesDialogOpen(false)}>
              <h3 className="font-semibold text-green-600">Dental Care</h3>
              <p className="text-sm text-gray-500">Dental treatments and oral health</p>
            </Link>
            <Link href="/categories/orthopedics" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={() => setIsCategoriesDialogOpen(false)}>
              <h3 className="font-semibold text-orange-600">Orthopedics</h3>
              <p className="text-sm text-gray-500">Bone, joint, and muscle treatments</p>
            </Link>
            <Link href="/categories/dermatology" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={() => setIsCategoriesDialogOpen(false)}>
              <h3 className="font-semibold text-pink-600">Dermatology</h3>
              <p className="text-sm text-gray-500">Skin conditions and cosmetic procedures</p>
            </Link>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
