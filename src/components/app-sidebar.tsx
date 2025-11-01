import * as React from "react"
import { FlameIcon, GalleryVerticalEnd, HomeIcon, Minus, Plus, TrendingUpIcon, Users, Hash, MessageSquare, Star, Clock } from "lucide-react"

import { SearchForm } from "@/components/search-form"
// import { getSubreddits } from "@/sanity/lib/subreddit/getSubreddit"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"
import  logo from "@/images/logo.png"
import Link from "next/link"
import logoWithName from "@/images/logoWithName.png"
import CreateCommunityButton from "./header/CreateCommunityButton"
import CommunitiesList from "./CommunitiesList"


type SidebarData= {
  navMain: {
    title: string;
    url: string;
    items?: {
      title: string;
      url: string;
      isActive: boolean;
    }[];
  }[];
}
// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Simplified sidebar without data fetching to avoid live module issues
  const sidebarData: SidebarData = {
    navMain: [
      {
        title: "Communities",
        url: "#",
        items: [], // Will be populated by client-side components if needed
      },
      
    ],
  }
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
              <Image src={logoWithName} alt="logo" width={160} height={160} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <CreateCommunityButton />
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="p-5">
                <Link href="/">
                
                <HomeIcon className="w-4 h-4 mr-2" /> Home
                </Link>
                
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="p-5">
                <Link href="/hot">
                
                <FlameIcon className="w-4 h-4 mr-2" /> Hot/Controversial
                </Link>
                
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="p-5">
                <Link href="/popular">
                
                <TrendingUpIcon className="w-4 h-4 mr-2" /> Popular
                </Link>
                
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="p-5">
                <Link href="/categories">
                
                <Hash className="w-4 h-4 mr-2" /> Categories
                </Link>
                
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="p-5">
                <Link href="/communities">
                
                <Users className="w-4 h-4 mr-2" /> Communities
                </Link>
                
              </SidebarMenuButton>
            </SidebarMenuItem>

          </SidebarMenu>
            
          
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            <CommunitiesList />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Popular Communities
            </h3>
            <div className="space-y-1">
              <SidebarMenuButton asChild className="p-3 text-sm">
                <Link href="/community/medical-tourism" className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    M
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Medical Tourism</div>
                    <div className="text-xs text-gray-500">2.1k members</div>
                  </div>
                </Link>
              </SidebarMenuButton>
              
              <SidebarMenuButton asChild className="p-3 text-sm">
                <Link href="/community/healthcare-questions" className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    H
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Healthcare Questions</div>
                    <div className="text-xs text-gray-500">1.8k members</div>
                  </div>
                </Link>
              </SidebarMenuButton>
              
              <SidebarMenuButton asChild className="p-3 text-sm">
                <Link href="/community/medical-advice" className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Medical Advice</div>
                    <div className="text-xs text-gray-500">1.5k members</div>
                  </div>
                </Link>
              </SidebarMenuButton>
              
              <SidebarMenuButton asChild className="p-3 text-sm">
                <Link href="/community/wellness" className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    W
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Wellness & Lifestyle</div>
                    <div className="text-xs text-gray-500">1.2k members</div>
                  </div>
                </Link>
              </SidebarMenuButton>
            </div>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <SidebarMenuButton asChild className="p-3 text-sm">
                <Link href="/ask" className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4" />
                  <span>Ask Question</span>
                </Link>
              </SidebarMenuButton>
              
              <SidebarMenuButton asChild className="p-3 text-sm">
                <Link href="/create-post" className="flex items-center space-x-3">
                  <Plus className="w-4 h-4" />
                  <span>Create Post</span>
                </Link>
              </SidebarMenuButton>
              
              <SidebarMenuButton asChild className="p-3 text-sm">
                <Link href="/communities/create" className="flex items-center space-x-3">
                  <Users className="w-4 h-4" />
                  <span>Create Community</span>
                </Link>
              </SidebarMenuButton>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
