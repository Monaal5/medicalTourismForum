"use client";
import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
];

export default function LanguageMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [currentLang, setCurrentLang] = useState('en');

    useEffect(() => {
        // Check cookie for current language
        const match = document.cookie.match(/(^| )googtrans=([^;]+)/);
        if (match) {
            const val = match[2]; // e.g., /en/es
            const code = val.split('/').pop(); // es
            if (code) setCurrentLang(code);
        }

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (code: string) => {
        // Set Google Translate cookie
        // Format: /auto/target_lang
        document.cookie = `googtrans=/auto/${code}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=/auto/${code}; path=/`; // Fallback

        // Reload to apply
        window.location.reload();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center text-gray-600"
                onClick={() => setIsOpen(!isOpen)}
                title="Change Language"
                aria-label="Change Language"
            >
                <Globe className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 max-h-[80vh] overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-700">Select Language</h3>
                    </div>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between ${currentLang === lang.code ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                                }`}
                            onClick={() => handleLanguageChange(lang.code)}
                        >
                            <span className="flex items-center">
                                <span className="mr-3 text-lg">{lang.flag}</span>
                                {lang.name}
                            </span>
                            {currentLang === lang.code && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                    <div className="px-4 py-2 text-xs text-center text-gray-400 border-t border-gray-100 italic">
                        Powered by AI Translation
                    </div>
                </div>
            )}
        </div>
    );
}
