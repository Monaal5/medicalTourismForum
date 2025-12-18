import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { deleteEvent, toggleEventStatus } from "@/actions/admin-events.actions";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const revalidate = 0;

export default async function AdminEventsPage() {
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="p-4 text-red-500">Error fetching events: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Events & Ads Management</h1>
                <Link href="/admin/events/new">
                    <Button>Create Event</Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {events?.map((event: any) => (
                            <tr key={event.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="relative w-24 h-16 bg-gray-100 rounded overflow-hidden">
                                        <Image src={event.image_url} alt={event.title || 'Event'} fill className="object-cover" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{event.title || '-'}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{event.link_url}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <form action={async () => {
                                        "use server";
                                        await toggleEventStatus(event.id, event.is_active);
                                    }}>
                                        <button type="submit" className={`px-2 py-1 rounded-full text-xs font-semibold ${event.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} hover:opacity-80`}>
                                            {event.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </form>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <form action={async () => {
                                        "use server";
                                        await deleteEvent(event.id);
                                    }}>
                                        <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-900">Delete</Button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!events || events.length === 0) && (
                    <div className="p-6 text-center text-gray-500">No events found.</div>
                )}
            </div>
        </div>
    );
}
