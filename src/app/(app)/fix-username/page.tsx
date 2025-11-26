"use client";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FixUsernamePage() {
    const { user } = useUser();
    const [newUsername, setNewUsername] = useState("Monaal6157");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFixUsername = async () => {
        if (!user) {
            alert("Please sign in first");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            // Try by username first since we know that's what we see
            const currentUsername = user.username || "monaalmamen"; // Fallback to what we see in screenshots
            console.log("Attempting to fix by username:", currentUsername);

            const response = await fetch(
                `/api/fix-username-by-name?username=${currentUsername}&newUsername=${newUsername}`
            );
            const data = await response.json();
            setResult(data);

            if (data.success) {
                alert(`Success! Username updated to: ${newUsername}`);
                // Refresh the page to see changes
                setTimeout(() => window.location.reload(), 1000);
            } else {
                // If that fails, show the error
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to update username");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please sign in first</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h1 className="text-2xl font-bold mb-6">Fix Your Username</h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Clerk ID
                            </label>
                            <Input value={user.id} disabled className="bg-gray-50" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Clerk Username
                            </label>
                            <Input value={user.username || "N/A"} disabled className="bg-gray-50" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Sanity Username
                            </label>
                            <Input
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Enter your desired username"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                This will be your username displayed everywhere in the forum
                            </p>
                        </div>

                        <Button
                            onClick={handleFixUsername}
                            disabled={loading || !newUsername.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? "Updating..." : "Update Username"}
                        </Button>
                    </div>

                    {result && (
                        <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className="font-semibold mb-2">
                                {result.success ? "✓ Success!" : "✗ Error"}
                            </h3>
                            <pre className="text-sm overflow-auto">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold mb-2">ℹ️ What this does:</h3>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                            <li>Updates your username in the Sanity database</li>
                            <li>All your existing posts, answers, and comments will show the new username</li>
                            <li>Future content will automatically use this username</li>
                            <li>This change is permanent</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
