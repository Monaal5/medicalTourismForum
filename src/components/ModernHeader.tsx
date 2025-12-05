"use client";
import { Search, Bookmark } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModernHeader() {
    const { user } = useUser();
    const router = useRouter();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-card border-b border-border">
            <div className="relative flex items-center justify-between h-14 px-4">
                {/* Left: Profile Picture */}
                <div className="flex items-center gap-3 z-10">
                    {user?.imageUrl ? (
                        <Image
                            src={user.imageUrl}
                            alt={user.fullName || "User"}
                            width={32}
                            height={32}
                            className="rounded-full"
                            unoptimized
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium text-muted-foreground">U</span>
                        </div>
                    )}
                </div>

                {/* Center: Title */}
                <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-card-foreground">Recent Activity</h1>

                {/* Right: Icons */}
                <div className="flex items-center gap-1 z-10">
                    <button
                        onClick={() => router.push("/bookmarks")}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                        aria-label="Bookmarks"
                    >
                        <Bookmark className="w-5 h-5 text-card-foreground" />
                    </button>
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                        aria-label="Search"
                    >
                        <Search className="w-5 h-5 text-card-foreground" />
                    </button>
                </div>
            </div>

            {/* Search Bar (expandable) */}
            {isSearchOpen && (
                <div className="px-4 pb-3">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search questions and answers"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-card-foreground"
                            autoFocus
                        />
                    </form>
                </div>
            )}
        </header>
    );
}
