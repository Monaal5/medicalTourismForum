"use client";
import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

export default function GlobalDisclaimer() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem("disclaimerDismissed");
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("disclaimerDismissed", "true");
    };

    if (!isVisible) return null;

    return (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 relative">
            <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between">
                <div className="flex items-start sm:items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="text-sm text-yellow-800">
                        <span className="font-semibold">Medical Disclaimer:</span> Content on this platform is for informational purposes only and does not constitute medical advice.
                        Always consult with a qualified healthcare provider for medical diagnosis and treatment.
                        <span className="hidden sm:inline"> This is a neutral platform and we do not endorse specific providers.</span>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-yellow-600 hover:text-yellow-800 focus:outline-none ml-4"
                    suppressHydrationWarning={true}
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
