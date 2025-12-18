"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface Community {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
}

export default function CommunitiesList() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch("/api/communities");
      if (response.ok) {
        const data = await response.json();
        setCommunities(data.communities || []);
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton>
          <span>Loading communities...</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <span>Communities</span>
            {isOpen ? (
              <ChevronDown className="ml-auto" />
            ) : (
              <ChevronRight className="ml-auto" />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {communities.map((community) => (
              <SidebarMenuSubItem key={community._id}>
                <SidebarMenuSubButton asChild>
                  <Link href={`/communities/${community.slug.current}`}>
                    c/{community.title}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
            {communities.length === 0 && (
              <SidebarMenuSubItem>
                <div className="text-gray-500 px-3 py-2 text-sm">
                  No communities found
                </div>
              </SidebarMenuSubItem>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
