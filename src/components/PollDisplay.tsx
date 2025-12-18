"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface PollOption {
    id: string;
    option_text: string;
    vote_count: number;
}

interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    total_votes: number;
    user_voted_option_id?: string | null;
    expires_at: string;
}

interface PollDisplayProps {
    initialPoll: Poll;
}

export function PollDisplay({ initialPoll }: PollDisplayProps) {
    const [poll, setPoll] = useState(initialPoll);
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const hasVoted = !!poll.user_voted_option_id;
    const isExpired = new Date(poll.expires_at) < new Date();

    // Calculate total votes locally to be sure
    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.vote_count, 0);

    const handleVote = async () => {
        if (!selectedOption) return;
        setLoading(true);

        try {
            const res = await fetch("/api/polls/vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pollId: poll.id,
                    optionId: selectedOption
                })
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error || "Failed to vote");
                return;
            }

            toast.success("Vote cast!");

            // Optimistic update
            setPoll(prev => ({
                ...prev,
                user_voted_option_id: selectedOption,
                options: prev.options.map(opt =>
                    opt.id === selectedOption ? { ...opt, vote_count: opt.vote_count + 1 } : opt
                )
            }));

        } catch (e) {
            toast.error("Error casting vote");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 my-4 max-w-lg">
            <h4 className="font-semibold text-lg mb-4">{poll.question}</h4>

            <div className="space-y-3">
                {poll.options.map((option) => {
                    const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
                    const isSelected = selectedOption === option.id;
                    const isVoted = poll.user_voted_option_id === option.id;

                    return (
                        <div
                            key={option.id}
                            className={cn(
                                "relative border rounded-lg overflow-hidden transition-all",
                                hasVoted || isExpired
                                    ? "border-transparent bg-gray-50 h-10" // Results view
                                    : `cursor-pointer hover:border-blue-400 ${isSelected ? "border-blue-600 ring-1 ring-blue-600" : "border-gray-200"}`
                            )}
                            onClick={() => !hasVoted && !isExpired && setSelectedOption(option.id)}
                        >
                            {/* Progress Bar Background (Only show if voted or expired) */}
                            {(hasVoted || isExpired) && (
                                <div
                                    className={cn("absolute top-0 left-0 h-full transition-all duration-500", isVoted ? "bg-blue-100" : "bg-gray-200")}
                                    style={{ width: `${percentage}%` }}
                                />
                            )}

                            <div className="relative z-10 flex justify-between items-center px-4 h-full py-2">
                                <span className={cn("text-sm font-medium", (hasVoted && isVoted) ? "text-blue-900" : "text-gray-900")}>
                                    {option.option_text}
                                    {isVoted && <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">You</span>}
                                </span>
                                {(hasVoted || isExpired) && (
                                    <span className="text-sm text-gray-600 font-semibold">{percentage}%</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <span>{totalVotes} votes • {isExpired ? "Poll closed" : `${Math.ceil((new Date(poll.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left`}</span>
                {!hasVoted && !isExpired && (
                    <Button
                        size="sm"
                        onClick={handleVote}
                        disabled={!selectedOption || loading}
                    >
                        {loading ? "Voting..." : "Vote"}
                    </Button>
                )}
            </div>
        </div>
    );
}
