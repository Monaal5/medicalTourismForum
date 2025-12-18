
import { supabase } from "@/lib/supabase";
import { banUser, deleteUser } from "@/actions/admin-dashboard.actions";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

export default async function UsersPage() {
    // Fetch users (Admin role only for now or filtered? List says "all registered users")
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('joined_at', { ascending: false });

    if (error) {
        return <div className="p-4 text-red-500">Error fetching users: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-gray-500 text-sm">Manage registered users, roles, and access.</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user: any) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            {user.image_url ? (
                                                <img className="h-10 w-10 rounded-full" src={user.image_url} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500 font-bold">{user.username?.charAt(0).toUpperCase() || "U"}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.username || "No Username"}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {user.role || 'user'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.joined_at || Date.now()).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <form action={async () => {
                                        "use server";
                                        await deleteUser(user.id);
                                    }} style={{ display: 'inline-block' }}>
                                        <Button type="submit" variant="ghost" className="text-red-600 hover:text-red-900">Delete</Button>
                                    </form>
                                    <form action={async () => {
                                        "use server";
                                        await banUser(user.id);
                                    }} style={{ display: 'inline-block', marginLeft: '8px' }}>
                                        <Button type="submit" variant="ghost" className="text-amber-600 hover:text-amber-900">Ban</Button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No users found.</div>
                )}
            </div>
        </div>
    );
}
