"use client";
import { useUser } from "@clerk/nextjs";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
  requireAuth?: boolean;
}

export default function ComingSoon({
  icon: Icon,
  title,
  description,
  features = [],
  requireAuth = true,
}: ComingSoonProps) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sign in required
          </h1>
          <p className="text-gray-600 mb-4">
            You need to be logged in to access this feature.
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
      <div className="max-w-4xl mx-auto p-4 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Icon and Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
              <Icon className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-lg text-gray-600">{description}</p>
          </div>

          {/* Coming Soon Badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <svg
                className="w-4 h-4 mr-2 animate-pulse"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Coming Soon
            </span>
          </div>

          {/* Features List */}
          {features.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What to expect:
              </h2>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Under Development
                </h3>
                <p className="text-sm text-blue-700">
                  This feature is currently being built by our development team.
                  We're working hard to bring you the best experience possible.
                  Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back to Home
              </Button>
            </Link>
            <Link href="/settings">
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                Go to Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Want to be notified when this feature launches?{" "}
            <Link href="/settings" className="text-blue-600 hover:underline">
              Update your notification preferences
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
