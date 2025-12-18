"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, BarChart2 } from "lucide-react";
import toast from "react-hot-toast";

interface PollCreationProps {
    onPollCreated?: (pollId: string) => void;
}

export function PollCreator({ onPollCreated }: PollCreationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [loading, setLoading] = useState(false);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 5) {
            setOptions([...options, ""]);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const handleSubmit = async () => {
        if (!question.trim()) {
            toast.error("Please enter a question");
            return;
        }
        if (options.some(opt => !opt.trim())) {
            toast.error("Please fill all options");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/polls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    options,
                    expires_in_days: 7
                })
            });

            const data = await res.json();
            if (data.pollId) {
                toast.success("Poll created!");
                if (onPollCreated) onPollCreated(data.pollId);
                setIsOpen(false);
                setQuestion("");
                setOptions(["", ""]);
            } else {
                toast.error(data.error || "Failed to create poll");
            }
        } catch (e) {
            toast.error("Error creating poll");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-gray-600"
            >
                <BarChart2 className="w-4 h-4" />
                Add Poll
            </Button>
        );
    }

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 relative">
            <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
                <X className="w-4 h-4" />
            </button>

            <h3 className="font-semibold text-sm mb-3">Create a Poll</h3>

            <div className="space-y-3">
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Question</label>
                    <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question..."
                        className="bg-white"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-500 block">Options</label>
                    {options.map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                            <Input
                                value={opt}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                placeholder={`Option ${idx + 1}`}
                                className="bg-white"
                            />
                            {options.length > 2 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(idx)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    {options.length < 5 && (
                        <Button type="button" variant="ghost" size="sm" onClick={addOption} className="text-blue-600">
                            <Plus className="w-4 h-4 mr-1" /> Add Option
                        </Button>
                    )}
                </div>

                <div className="pt-2">
                    <Button type="button" onClick={handleSubmit} disabled={loading} className="w-full">
                        {loading ? "Creating..." : "Create Poll"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
