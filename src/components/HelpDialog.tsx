"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  PenTool,
  Hash,
  MessageCircle,
  Users,
  Search,
  ThumbsUp,
  Bookmark,
  Award,
  Eye,
  ArrowRight
} from "lucide-react";

interface HelpDialogProps {
  children: React.ReactNode;
}

export default function HelpDialog({ children }: HelpDialogProps) {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    {
      id: "overview",
      title: "Overview",
      icon: Eye,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Welcome to Medical Tourism Forum</h3>
          <p className="text-gray-700">
            Our platform connects patients seeking medical treatments abroad with experienced healthcare
            professionals and fellow patients. Here's how to get started:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Hash className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium">Browse Categories</h4>
              </div>
              <p className="text-sm text-gray-600">
                Explore medical specialties and find questions in your area of interest
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <PenTool className="w-5 h-5 text-green-600" />
                <h4 className="font-medium">Ask & Answer</h4>
              </div>
              <p className="text-sm text-gray-600">
                Share your questions and help others with your medical knowledge
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "asking",
      title: "Asking Questions",
      icon: MessageCircle,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">How to Ask Great Questions</h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Choose the Right Category</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Select the medical specialty that best fits your question. This helps the right experts find and answer your question.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Be Specific</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Include relevant details like symptoms, duration, previous treatments, and your location preferences.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Add Relevant Tags</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Use tags like #surgery, #recovery, #costs, or country names to help others find your question.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <HelpCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Medical Disclaimer</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Remember that advice here is not a substitute for professional medical consultation.
                  Always consult with qualified healthcare providers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "answering",
      title: "Answering Questions",
      icon: PenTool,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">How to Provide Helpful Answers</h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Use the Answer Button</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Click "Answer" in the header to browse questions by category and find ones you can help with.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Share Your Experience</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Whether you're a healthcare professional or a patient who's been through similar experiences, your insights are valuable.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Include Sources</h4>
                <p className="text-sm text-gray-600 mt-1">
                  When possible, mention reputable sources, studies, or your professional credentials to add credibility.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">Best Answer System</h4>
            </div>
            <p className="text-sm text-blue-700">
              High-quality answers get upvoted by the community and may be marked as "Best Answer" by question authors.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "features",
      title: "Platform Features",
      icon: Hash,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <ThumbsUp className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Voting System</h4>
                  <p className="text-xs text-gray-600">Upvote helpful answers and questions</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Bookmark className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Bookmarks</h4>
                  <p className="text-xs text-gray-600">Save questions for later reference</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Follow Questions</h4>
                  <p className="text-xs text-gray-600">Get notified of new answers</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Search className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Advanced Search</h4>
                  <p className="text-xs text-gray-600">Find questions by keywords and categories</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Hash className="w-5 h-5 text-pink-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Categories</h4>
                  <p className="text-xs text-gray-600">Browse by medical specialties</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Eye className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-900">User Profiles</h4>
                  <p className="text-xs text-gray-600">See credentials and past contributions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "safety",
      title: "Safety & Guidelines",
      icon: HelpCircle,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Community Guidelines & Safety</h3>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <HelpCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Important Medical Disclaimer</h4>
                  <ul className="text-sm text-red-700 mt-2 space-y-1">
                    <li>• Information shared here is for educational purposes only</li>
                    <li>• Always consult qualified healthcare professionals for medical advice</li>
                    <li>• Emergency situations require immediate medical attention</li>
                    <li>• Treatment outcomes may vary between individuals and locations</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Community Standards</h4>

              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">Be respectful and empathetic to all community members</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">Share accurate information and cite sources when possible</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">Protect patient privacy - never share personal medical information</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">Report inappropriate content or spam to moderators</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Quality Contributions</h4>
                  <p className="text-sm text-green-700 mt-1">
                    High-quality posts that follow guidelines get better visibility and help build your reputation in the community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span>Help & Guidelines</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full">
          {/* Sidebar Navigation */}
          <div className="w-1/3 border-r border-gray-200 pr-4">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{section.title}</span>
                    {activeSection === section.id && (
                      <ArrowRight className="w-3 h-3 ml-auto" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 pl-6 overflow-y-auto">
            {currentSection && currentSection.content}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Need more help? Contact our support team
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
            <Button size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
