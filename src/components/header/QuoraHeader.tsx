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
import { useCategories } from "@/hooks/useCategories";
import { useTheme } from "next-themes";
import { NotificationToast } from "@/components/NotificationToast";

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [sanityUserId, setSanityUserId] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<any | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const categoriesDialogRef = useRef<HTMLDivElement>(null);
  const { categories, loading: categoriesLoading } = useCategories();
  const { theme, setTheme } = useTheme();

  // Fetch unread notification count
  const fetchUnreadCount = async (userId: string) => {
    try {
      const response = await fetch(`/api/notifications/unread-count?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Fetch username from Sanity to match what's used in posts/questions
  useEffect(() => {
    if (user?.id) {
      setUsernameLoading(true);

      fetch(`/api/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            setSanityUsername(data.username);
            setSanityUserId(data._id);
            // Fetch unread count after we have the Sanity user ID
            fetchUnreadCount(data._id);
          } else if (data.error) {
            // User doesn't exist in Sanity yet, will use generated username
            setSanityUsername(null);
            setSanityUserId(null);
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



  // Poll for new notifications
  useEffect(() => {
    if (!sanityUserId) return;

    // Set up polling interval (every 30 seconds)
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/notifications/unread-count?userId=${sanityUserId}`);
        const data = await response.json();

        if (data.success) {
          const newCount = data.count;

          // If count increased, show toast for new notification
          if (newCount > unreadCount) {
            // Fetch the latest notification to show in toast
            const notifResponse = await fetch(`/api/notifications?userId=${sanityUserId}`);
            const notifData = await notifResponse.json();

            if (notifData.success && notifData.notifications.length > 0) {
              const latestUnread = notifData.notifications.find((n: any) => !n.read);
              if (latestUnread) {
                setToastNotification(latestUnread);

                // Auto-dismiss after 5 seconds
                setTimeout(() => {
                  setToastNotification(null);
                }, 5000);
              }
            }
          }

          setUnreadCount(newCount);
        }
      } catch (error) {
        console.error("Error polling notifications:", error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [sanityUserId, unreadCount]);

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
        className="bg-card border-b border-border sticky top-0 z-50"
        suppressHydrationWarning
      >
        {/* Top Navigation */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8" suppressHydrationWarning>
          <div className="flex items-center justify-between h-14 sm:h-16" suppressHydrationWarning>
            {/* Left Side - Logo and Navigation */}
            <div className="flex items-center space-x-3 sm:space-x-6" suppressHydrationWarning>
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <Image
                  src={logoWithName}
                  alt="Medical Tourism Forum"
                  width={320}
                  height={100}
                  className="h-12 sm:h-16 md:h-25 w-auto"
                  suppressHydrationWarning
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
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              </nav>
            </div>

            {/* Center - Search Bar (Desktop Only) */}
            <div className="flex-1 max-w-lg mx-2 sm:mx-4 hidden md:block" suppressHydrationWarning>
              <form
                onSubmit={handleSearch}
                className="relative"
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
            </div>

            {/* Right Side - User Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3" suppressHydrationWarning>
              {user ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex items-center space-x-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <span>Premium</span>
                  </Button>

                  {/* Mobile Search Button */}
                  <button
                    className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                    aria-label="Search"
                  >
                    <Search className="w-6 h-6 text-card-foreground" />
                  </button>

                  {/* Theme Toggle Button */}
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-card-foreground"
                      >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                      </svg>
                    ) : (
                      <Moon className="w-5 h-5 text-card-foreground" />
                    )}
                  </button>

                  <div className="hidden md:flex items-center space-x-2">
                    <div className="relative" ref={dropdownRef}>
                      <Image
                        src={
                          user.imageUrl ||
                          "https://via.placeholder.com/32x32/cccccc/666666?text=U"
                        }
                        alt={user.username || "User"}
                        width={40}
                        height={40}
                        className="rounded-full cursor-pointer hover:opacity-80 transition-opacity w-9 h-9 sm:w-10 sm:h-10"
                        onClick={() =>
                          setIsProfileDropdownOpen(!isProfileDropdownOpen)
                        }
                        unoptimized
                      />

                      {/* Profile Dropdown Menu */}
                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-lg shadow-lg border border-border py-2 z-50">
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
                                <div className="font-semibold text-card-foreground hover:text-blue-600 transition-colors cursor-pointer">
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
                            <div
                              className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                              <div className="flex items-center">
                                <Moon className="w-4 h-4 mr-3" />
                                Dark mode
                              </div>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded uppercase">
                                {theme}
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

                  <div className="hidden md:flex items-center space-x-2">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 text-sm sm:text-base px-3 sm:px-4"
                      onClick={() => router.push("/ask")}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden xs:inline">Add question</span>
                      <span className="xs:hidden">Ask</span>
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
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
      </header>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-card z-50 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <button onClick={() => setIsMobileSearchOpen(false)} suppressHydrationWarning>
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
                suppressHydrationWarning
              />
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileSidebarOpen(false)} />
          <div ref={sidebarRef} className="fixed left-0 top-0 bottom-0 w-80 bg-card shadow-xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button onClick={() => setIsMobileSidebarOpen(false)} suppressHydrationWarning>
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
                  suppressHydrationWarning
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

                <Link href="/notifications" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 relative" onClick={() => setIsMobileSidebarOpen(false)}>
                  <Bell className="w-5 h-5 mr-3" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
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
          <div ref={categoriesDialogRef} className="relative bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Categories</h2>
              <button onClick={() => setIsCategoriesDialogOpen(false)} suppressHydrationWarning>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoriesLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading categories...</p>
                </div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/categories/${category.slug}`}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsCategoriesDialogOpen(false)}
                  >
                    <h3 className={`font-semibold ${category.color ? `text-${category.color}-600` : 'text-gray-900'}`}>
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                    )}
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No categories found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toastNotification && (
        <NotificationToast
          notification={toastNotification}
          onClose={() => setToastNotification(null)}
        />
      )}
    </>
  );
}
