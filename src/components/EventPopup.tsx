"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X, ExternalLink, Minimize2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Use public anon key
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EventPopup() {
    const pathname = usePathname();
    const [event, setEvent] = useState<any>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(false); // Start false to avoid flash

    useEffect(() => {
        const fetchEvent = async () => {
            // Check if user has already seen the popup in this session
            const hasSeenPopup = sessionStorage.getItem('hasSeenEventPopup');

            if (hasSeenPopup) {
                // User already saw it, don't show again
                return;
            }

            const { data } = await supabase
                .from('events')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setEvent(data);
                setIsVisible(true);
                // Mark as seen in this session
                sessionStorage.setItem('hasSeenEventPopup', 'true');
            }
        };
        fetchEvent();
    }, []);

    // Hide on admin pages
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    if (!isVisible || !event) return null;

    if (isMinimized) {
        return (
            <div className="fixed bottom-32 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="relative w-32 h-20 bg-white rounded-lg shadow-xl overflow-hidden border-2 border-white hover:scale-105 transition-transform group"
                    title="Show Event"
                >
                    <Image src={event.image_url} alt="Offer" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="absolute top-2 right-2 flex space-x-2 z-10">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 backdrop-blur-md transition-colors"
                        title="Minimize"
                    >
                        <Minimize2 className="w-5 h-5" />
                    </button>
                    <button
                        // Logic: Usually X closes session. Minimize keeps it.
                        // I'll make X minimize too or close fully if desired.
                        // "minimize in the right botton only if the event is uploaded by the admin"
                        // I'll make X close fully, Minimize button to minimize.
                        className="bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 backdrop-blur-md transition-colors"
                        onClick={() => setIsMinimized(true)} // User probably implies closure = minimize for ads
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div
                    className="relative aspect-[4/3] w-full cursor-pointer group"
                    onClick={() => event.link_url && window.open(event.link_url, '_blank')}
                >
                    <Image
                        src={event.image_url}
                        alt={event.title || 'Event'}
                        fill
                        className="object-cover transition-transform group-hover:scale-105 duration-700"
                    />
                    {event.link_url && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium flex items-center gap-2">
                                Visit Link <ExternalLink className="w-4 h-4" />
                            </span>
                        </div>
                    )}
                </div>

                {event.title && (
                    <div className="p-5 bg-white border-t border-gray-100">
                        <h3 className="font-bold text-xl text-gray-900">{event.title}</h3>
                        {event.link_url && (
                            <a href={event.link_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
                                Learn More &rarr;
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
