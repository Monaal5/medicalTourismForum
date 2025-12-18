
import { supabase } from "@/lib/supabase";
import { deleteCommunity } from "@/actions/admin-dashboard.actions";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminCommunitiesPage() {
    const { data: communities, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="p-4 text-red-500">Error fetching communities: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Communities Management</h1>
                <a href="/create-community" target="_blank">
                    <Button>Create Community</Button>
                </a>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {communities.map((comm: any) => (
                            <tr key={comm.id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{comm.title}</div>
                                    <div className="text-sm text-gray-500">{comm.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {comm.slug}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <form action={async () => {
                                        "use server";
                                        await deleteCommunity(comm.id);
                                    }}>
                                        <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-900">Delete</Button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {communities.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No communities found.</div>
                )}
            </div>
        </div>
    );
}
