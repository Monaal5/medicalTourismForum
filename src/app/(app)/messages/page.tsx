"use client";
import { useUser } from "@clerk/nextjs";
import { MessageCircle, Send, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function MessagesPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sign in to view messages
          </h1>
          <p className="text-gray-600 mb-4">
            You need to be logged in to access your messages.
          </p>
          <Link href="/sign-in">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            Connect with other members of the community
          </p>
        </div>

        {/* Messages Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search messages"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="divide-y divide-gray-200">
                {/* Empty State */}
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Start a conversation with other members
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 mx-auto">
                    <Plus className="w-4 h-4" />
                    <span>New Message</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Message View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
              {/* Empty State */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to view messages
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Coming Soon
              </h4>
              <p className="text-sm text-blue-700">
                Direct messaging feature is currently under development. Stay
                tuned for updates!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
