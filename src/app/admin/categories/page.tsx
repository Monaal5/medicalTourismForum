import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { deleteCategory } from "@/actions/admin-dashboard.actions";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        return <div className="p-4 text-red-500">Error fetching categories: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Categories Management</h1>
                <Link href="/admin/categories/new">
                    <Button>Create Category</Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((cat: any) => (
                            <tr key={cat.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                        style={{ backgroundColor: cat.color || '#ccc' }}
                                    >
                                        {cat.icon || "?"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {cat.slug}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <form action={async () => {
                                        "use server";
                                        await deleteCategory(cat.id);
                                    }}>
                                        <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-900">Delete</Button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {categories.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No categories found.</div>
                )}
            </div>
        </div>
    );
}
