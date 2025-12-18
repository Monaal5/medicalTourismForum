"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function AdminAIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello Admin. I can help you with user data, stats, or general queries. Ask me anything!" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg }),
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Sorry, I encountered an error." }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: "Failed to connect to AI service." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {/* Chat Window */}
            <div
                className={cn(
                    "bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden transition-all duration-300 ease-in-out mb-2",
                    isOpen ? "w-80 h-96 opacity-100 scale-100" : "w-0 h-0 opacity-0 scale-95 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="bg-slate-900 text-white p-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Bot className="w-5 h-5" />
                        <span className="font-semibold text-sm">Admin Assistant</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
                        <Minimize2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Messages */}
                <div className="p-3 h-64 overflow-y-auto bg-gray-50 space-y-3">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] rounded-lg p-2 text-sm ${m.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-800'
                                    }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 rounded-lg p-2 text-sm text-gray-500 italic">
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-2 border-t border-gray-100 bg-white flex space-x-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about users, reports..."
                        className="flex-1 text-sm h-9"
                    />
                    <Button size="sm" onClick={handleSend} disabled={loading} className="h-9 w-9 p-0">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Toggle Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full w-12 h-12 shadow-lg bg-slate-900 hover:bg-slate-800"
                >
                    <Bot className="w-6 h-6" />
                </Button>
            )}
        </div>
    );
}
