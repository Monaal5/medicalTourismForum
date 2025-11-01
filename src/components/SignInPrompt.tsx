"use client";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface SignInPromptProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action: string;
  showBackButton?: boolean;
}

export default function SignInPrompt({
  icon: Icon,
  title,
  description,
  action,
  showBackButton = true,
}: SignInPromptProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Icon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600 mb-4">{description}</p>
            <p className="text-sm text-gray-500">
              Sign in to {action} and join the medical community
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <SignInButton mode="modal">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 text-base">
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button
                variant="outline"
                className="w-full border-2 border-gray-300 hover:bg-gray-50 h-11 text-base"
              >
                Create Account
              </Button>
            </SignUpButton>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Browse without signing in */}
          {showBackButton && (
            <div className="text-center">
              <Link href="/">
                <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900">
                  Continue browsing without signing in
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Join our medical community:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Ask questions and get expert medical advice</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Share your knowledge and help others</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Connect with healthcare professionals</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Save and bookmark important content</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
