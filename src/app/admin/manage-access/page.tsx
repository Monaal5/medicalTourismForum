
import { addAdminByEmail } from "@/actions/admin.actions";
import { supabase } from "@/lib/supabase";

export default async function ManageAccessPage() {
    // List existing admins
    // Note: this query might return empty if no users are in DB or no one has 'admin' role yet.
    const { data: admins } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin');

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manage Access</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 max-w-2xl">
                <h2 className="text-lg font-semibold mb-4">Add New Admin</h2>
                <form action={addAdminByEmail} className="flex gap-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter user email..."
                        required
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        suppressHydrationWarning
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                        suppressHydrationWarning
                    >
                        Grant Access
                    </button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                    The user must already be signed up and synchronized to the database.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold">Current Admins</h2>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Username</th>
                            <th className="px-6 py-3">Joined</th>
                            <th className="px-6 py-3">Role</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {admins && admins.length > 0 ? (
                            admins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{admin.email}</td>
                                    <td className="px-6 py-4">{admin.username || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {admin.joined_at ? new Date(admin.joined_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {admin.role}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No other admins found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
