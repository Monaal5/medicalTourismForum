"use client";
import { useState } from "react";
import { Edit, X, HelpCircle, MessageSquare, FileText } from "lucide-react";
import Link from "next/link";

export default function FloatingActionButton() {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        {
            name: "Ask",
            href: "/ask",
            icon: HelpCircle,
            color: "bg-blue-600 hover:bg-blue-700",
        },
        {
            name: "Answer",
            href: "/answer",
            icon: MessageSquare,
            color: "bg-green-600 hover:bg-green-700",
        },
        {
            name: "Post",
            href: "/create-post",
            icon: FileText,
            color: "bg-purple-600 hover:bg-purple-700",
        },
    ];

    return (
        <div className="fixed bottom-20 right-4 z-[100]">
            {/* Action Buttons */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
                    {actions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.name}
                                href={action.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 ${action.color} text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 transform`}
                                style={{
                                    animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                                }}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{action.name}</span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Main FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 ${isOpen ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group`}
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? (
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                    <Edit className="w-6 h-6 group-hover:scale-110 transition-transform" />
                )}
            </button>

            <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
}
