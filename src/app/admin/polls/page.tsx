import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import DeletePollButton from "@/components/admin/DeletePollButton";

export const revalidate = 0;

export default async function AdminPollsPage() {
    // Fetch polls without relationships to avoid schema errors
    const { data: polls, error } = await supabase
        .from("polls")
        .select("*")
        .order("created_at", { ascending: false });

    // Fetch categories separately
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name, slug");

    // Fetch users separately
    const { data: users } = await supabase
        .from("users")
        .select("id, username");

    // Map category and user data to polls
    const enrichedPolls = polls?.map(poll => ({
        ...poll,
        category: categories?.find(c => c.id === poll.category_id),
        author: users?.find(u => u.id === poll.author_id)
    }));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Polls</h1>
                <Link href="/admin/polls/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Poll
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                {error ? (
                    <div className="p-6 text-center text-red-500">
                        Error loading polls: {error.message}
                    </div>
                ) : !enrichedPolls || enrichedPolls.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No polls found. Create your first poll!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Votes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {enrichedPolls.map((poll: any) => (
                                    <tr key={poll.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">{poll.question}</td>
                                        <td className="px-6 py-4 text-sm">{poll.category?.name || "N/A"}</td>
                                        <td className="px-6 py-4 text-sm">{poll.author?.username || "Anonymous"}</td>
                                        <td className="px-6 py-4 text-sm">{poll.total_votes || 0}</td>
                                        <td className="px-6 py-4 text-sm">{new Date(poll.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm flex items-center gap-2">
                                            <Link href={`/polls/${poll.id}`} className="text-blue-600 hover:underline">
                                                View
                                            </Link>
                                            <span className="text-gray-300">|</span>
                                            <DeletePollButton pollId={poll.id} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
