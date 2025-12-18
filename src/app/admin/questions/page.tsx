
import { supabase } from "@/lib/supabase";
import { deleteQuestion } from "@/actions/admin-dashboard.actions";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminQuestionsPage() {
    const { data: questions, error } = await supabase
        .from('questions')
        .select('*, author:users(username), category:categories(name)')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="p-4 text-red-500">Error fetching questions: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Questions Management</h1>
                <a href="/ask" target="_blank">
                    <Button>Ask Question</Button>
                </a>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {questions.map((q: any) => (
                            <tr key={q.id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{q.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {q.author?.username || "Unknown"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {q.category?.name || "Uncategorized"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${q.is_answered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {q.is_answered ? 'Answered' : 'Open'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <form action={async () => {
                                        "use server";
                                        await deleteQuestion(q.id);
                                    }}>
                                        <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-900">Delete</Button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {questions.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No questions found.</div>
                )}
            </div>
        </div>
    );
}
