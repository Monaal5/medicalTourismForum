
import { supabase } from "@/lib/supabase";
import { deletePost } from "@/actions/admin-dashboard.actions";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminPostsPage() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*, author:users(username), community:communities(title), category:categories(name)')
        .order('published_at', { ascending: false });

    if (error) {
        return <div className="p-4 text-red-500">Error fetching posts: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Posts Management</h1>
                {/* Add Create Post Button (link to /create-post or admin form) */}
                <a href="/create-post" target="_blank">
                    <Button>Create Post</Button>
                </a>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Context</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {posts.map((post: any) => (
                            <tr key={post.id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                    <div className="text-sm text-gray-500 line-clamp-1">{post.body?.content || "No content"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {post.author?.username || "Unknown"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {post.community?.title ? `c/${post.community.title}` : post.category?.name ? post.category.name : "None"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(post.published_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <form action={async () => {
                                        "use server";
                                        await deletePost(post.id);
                                    }}>
                                        <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-900">Delete</Button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {posts.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No posts found.</div>
                )}
            </div>
        </div>
    );
}
