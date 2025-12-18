import { supabase } from "@/lib/supabase";
import { DashboardControls } from "./_components/DashboardControls";

export const revalidate = 0;

export default async function AdminDashboard() {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
    const { count: questionsCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    const { count: reportsCount } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <DashboardControls />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">{usersCount || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Posts</h3>
                    <p className="text-3xl font-bold mt-2">{postsCount || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Questions</h3>
                    <p className="text-3xl font-bold mt-2">{questionsCount || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Reports</h3>
                    <p className="text-3xl font-bold mt-2 text-red-500">{reportsCount || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-semibold mb-4">Visitor Analytics</h3>
                    <div className="h-48 flex items-center justify-center bg-gray-50 rounded text-gray-400">
                        Chart Placeholder (Connect Analytics Service)
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500">Manage your platform content and users directly from the sidebar.</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
