
"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Note: This will need client-side env vars

export default function OnboardingPage() {
    const { user, isLoaded } = useUser();
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!user) {
            setError("User not authenticated");
            setLoading(false);
            return;
        }

        // Check username validity
        if (username.length < 3) {
            setError("Username must be at least 3 characters.");
            setLoading(false);
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setError("Username can only contain letters, numbers, and underscores.");
            setLoading(false);
            return;
        }

        try {
            // We can invoke an API or use client supabase directly if we had RLS policies.
            // But standard approach for now since we just set up sync-user:
            // Let's create a server action for this or just update here if RLS allows.
            // Since we haven't set up detailed RLS and are using the same key (anon), we can try calling an API route.
            // Or better, let's create a specialized API route for formatting this username safely.

            // However, for simplicity and since I haven't created a separate API for updating username:
            // I will use a direct fetch to a new endpoint `/api/user/update-username`

            const res = await fetch('/api/user/update-username', {
                method: 'POST',
                body: JSON.stringify({ username, userId: user.id }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update username');
            }

            router.push('/');
            router.refresh();

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return <div className="p-10 flex justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
                    <p className="text-gray-500">Please choose a username to continue.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. med_expert_2025"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            Only letters, numbers, and underscores.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Setting up...' : 'Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}
