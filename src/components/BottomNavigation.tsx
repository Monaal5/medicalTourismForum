"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Bell, MessageCircle, User, Grid3x3, Users } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function BottomNavigation() {
    const pathname = usePathname();
    const { user } = useUser();
    const [profilePath, setProfilePath] = useState("/profile");

    useEffect(() => {
        const fetchUsername = async () => {
            if (user?.id) {
                try {
                    const res = await fetch(`/api/user/${user.id}`);
                    const data = await res.json();
                    if (data.username) {
                        setProfilePath(`/profile/${data.username}`);
                    }
                } catch (error) {
                    console.error("Error fetching username:", error);
                }
            }
        };

        fetchUsername();
    }, [user?.id]);

    const navItems = [
        {
            name: "Home",
            href: "/",
            icon: Home,
        },
        {
            name: "Categories",
            href: "/categories",
            icon: Grid3x3,
        },
        {
            name: "Alerts",
            href: "/notifications",
            icon: Bell,
        },
        {
            name: "Communities",
            href: "/communities",
            icon: Users,
        },
        {
            name: "Profile",
            href: profilePath,
            icon: User,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
            <div className="flex items-center justify-around h-16 px-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-muted-foreground hover:text-card-foreground"
                                }`}
                        >
                            <Icon className={`w-5 h-5 mb-1 ${isActive ? "fill-current" : ""}`} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
