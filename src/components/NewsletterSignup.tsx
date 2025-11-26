"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function NewsletterSignup() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                toast.success("Subscribed successfully!");
                setEmail("");
            } else {
                toast.error("Failed to subscribe. Please try again.");
            }
        } catch (error) {
            console.error("Error subscribing:", error);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Subscribe to our newsletter</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
                Get the latest updates, medical tourism guides, and community highlights delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white"
                    required
                />
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
                </Button>
            </form>
        </div>
    );
}
