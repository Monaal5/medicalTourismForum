"use client";

import { useEffect } from "react";

export default function GoogleTranslate() {
    useEffect(() => {
        // Define the global init function that Google Translate API expects
        // @ts-ignore
        window.googleTranslateElementInit = () => {
            // @ts-ignore
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    autoDisplay: false,
                    includedLanguages: "en,es,fr,de,it,pt,ru,zh-CN,ja,ko,hi,ar,tr",
                },
                "google_translate_element"
            );
        };

        // Create and append the script
        const script = document.createElement("script");
        script.src =
            "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Cleanup
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            // @ts-ignore
            delete window.googleTranslateElementInit;
        };
    }, []);

    return (
        <div
            id="google_translate_element"
            style={{ display: "none" }}
            // Even with useEffect, add suppression just in case behavior varies
            suppressHydrationWarning
        ></div>
    );
}
