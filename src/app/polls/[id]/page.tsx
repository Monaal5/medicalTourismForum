"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface PollOption {
    id: string;
    option_text: string;
    vote_count: number;
    option_order: number;
}

interface Poll {
    id: string;
    question: string;
    description?: string;
    total_votes: number;
    created_at: string;
    expires_at?: string;
    author_id?: string;
    category_id?: string;
}

export default function PollDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const pollId = params.id as string;

    const [poll, setPoll] = useState<Poll | null>(null);
    const [options, setOptions] = useState<PollOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [authorName, setAuthorName] = useState<string>("Anonymous");
    const [categoryName, setCategoryName] = useState<string>("");

    useEffect(() => {
        fetchPoll();
    }, [pollId]);

    const fetchPoll = async () => {
        try {
            const response = await fetch(`/api/polls/${pollId}`);
            if (response.ok) {
                const data = await response.json();
                setPoll(data.poll);
                setOptions(data.options || []);
                setHasVoted(data.hasVoted || false);
                setAuthorName(data.authorName || "Anonymous");
                setCategoryName(data.categoryName || "");
            } else {
                toast.error("Poll not found");
                router.push("/");
            }
        } catch (error) {
            console.error("Error fetching poll:", error);
            toast.error("Failed to load poll");
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async () => {
        if (!selectedOption) {
            toast.error("Please select an option");
            return;
        }

        if (!user) {
            toast.error("Please sign in to vote");
            return;
        }

        setVoting(true);
        try {
            const response = await fetch(`/api/polls/${pollId}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ optionId: selectedOption }),
            });

            if (response.ok) {
                toast.success("Vote recorded!");
                fetchPoll(); // Refresh to show results
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to vote");
            }
        } catch (error) {
            console.error("Error voting:", error);
            toast.error("Failed to vote");
        } finally {
            setVoting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!poll) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Poll not found</h1>
                    <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                        Go back home
                    </Link>
                </div>
            </div>
        );
    }

    const totalVotes = poll.total_votes || 0;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start gap-3 mb-4">
                    <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {poll.question}
                        </h1>
                        {poll.description && (
                            <p className="text-gray-600 text-sm mb-3">{poll.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>By {authorName}</span>
                            {categoryName && <span>• {categoryName}</span>}
                            <span>• {totalVotes} votes</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-6">
                    {hasVoted ? (
                        // Show results
                        <>
                            <p className="text-sm font-medium text-gray-700 mb-3">Poll Results:</p>
                            {options.map((option) => {
                                const percentage = totalVotes > 0
                                    ? Math.round((option.vote_count / totalVotes) * 100)
                                    : 0;

                                return (
                                    <div key={option.id} className="relative">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">
                                                {option.option_text}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {option.vote_count} votes ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        // Show voting options
                        <>
                            <p className="text-sm font-medium text-gray-700 mb-3">Select an option:</p>
                            {options.map((option) => (
                                <label
                                    key={option.id}
                                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedOption === option.id
                                            ? "border-blue-600 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="poll-option"
                                        value={option.id}
                                        checked={selectedOption === option.id}
                                        onChange={() => setSelectedOption(option.id)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="ml-3 text-gray-900">{option.option_text}</span>
                                </label>
                            ))}

                            <Button
                                onClick={handleVote}
                                disabled={!selectedOption || voting}
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                            >
                                {voting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Voting...
                                    </>
                                ) : (
                                    "Submit Vote"
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
