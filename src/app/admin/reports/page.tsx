"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, CheckCircle, XCircle, AlertTriangle, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface Report {
    id: string;
    target_type: 'post' | 'question' | 'comment' | 'user';
    target_id: string;
    reason: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    created_at: string;
    reporter?: { username: string }; // Assuming join
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const res = await fetch("/api/admin/reports");
            const data = await res.json();
            if (data.reports) {
                setReports(data.reports);
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleAction = async (reportId: string, action: 'resolve' | 'dismiss' | 'ban_user' | 'delete_content') => {
        try {
            const res = await fetch("/api/admin/reports/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportId, action }),
            });

            if (res.ok) {
                toast.success(`Action ${action} successful`);
                fetchReports(); // Refresh
            } else {
                toast.error("Action failed");
            }
        } catch (error) {
            toast.error("Error processing action");
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Reported Content</h1>

            <div className="space-y-4">
                {reports.length === 0 ? (
                    <p className="text-gray-500">No pending reports.</p>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${report.target_type === 'post' ? 'bg-blue-100 text-blue-800' :
                                                report.target_type === 'user' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {report.target_type}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="font-medium text-red-700 flex items-center mb-2">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Reason: {report.reason}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Target ID: <span className="font-mono bg-gray-50 px-1">{report.target_id}</span>
                                    </p>
                                </div>

                                <div className="flex flex-col space-y-2">
                                    <Button size="sm" variant="outline" onClick={() => window.open(`/${report.target_type === 'post' ? 'post' : report.target_type}/${report.target_id}`, '_blank')}>
                                        <ExternalLink className="w-4 h-4 mr-2" /> View Content
                                    </Button>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-2 flex space-x-3 justify-end">
                                <Button size="sm" variant="ghost" className="text-gray-500" onClick={() => handleAction(report.id, 'dismiss')}>
                                    Dismiss
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleAction(report.id, 'delete_content')}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Content
                                </Button>
                                <Button size="sm" className="bg-red-900 hover:bg-red-950 text-white" onClick={() => handleAction(report.id, 'ban_user')}>
                                    <XCircle className="w-4 h-4 mr-2" /> Ban User
                                </Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(report.id, 'resolve')}>
                                    <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
