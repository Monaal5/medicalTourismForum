"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    FileText,
    MessageCircle,
    Hash,
    Activity,
    LogOut,
    Shield,
    AlertTriangle,
    Calendar,
    BarChart3
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useClerk } from "@clerk/nextjs";

export function AdminSidebar() {
    const pathname = usePathname();
    const { signOut } = useClerk();

    const navigation = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Manage Access", href: "/admin/manage-access", icon: Shield },
        { name: "Reports", href: "/admin/reports", icon: AlertTriangle },
    ];

    const content = [
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Posts", href: "/admin/posts", icon: FileText },
        { name: "Questions", href: "/admin/questions", icon: MessageCircle },
        { name: "Communities", href: "/admin/communities", icon: Activity },
        { name: "Categories", href: "/admin/categories", icon: Hash },
        { name: "Events & Ads", href: "/admin/events", icon: Calendar },
        { name: "Polls", href: "/admin/polls", icon: BarChart3 },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="p-4 border-b">
                <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Overview</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigation.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="w-4 h-4 mr-2" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Content Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {content.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="w-4 h-4 mr-2" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => signOut()}>
                            <LogOut className="w-4 h-4 mr-2" />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/">
                                <span>Back to Site</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
