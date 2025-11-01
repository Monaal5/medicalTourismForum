"use client";
import { useEffect, useState, useRef } from "react";

interface HydrationSafeComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  suppressWarnings?: boolean;
}

/**
 * A wrapper component that handles hydration mismatches caused by browser extensions
 * and other client-side modifications to the DOM.
 *
 * This component:
 * 1. Renders a fallback during SSR and initial hydration
 * 2. Only shows the actual content after client-side hydration is complete
 * 3. Cleans up any attributes added by browser extensions
 */
export default function HydrationSafeComponent({
  children,
  fallback = null,
  className = "",
  suppressWarnings = true
}: HydrationSafeComponentProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mark as hydrated after component mounts
    setIsHydrated(true);

    // Clean up browser extension attributes that cause hydration mismatches
    const cleanupExtensionAttributes = () => {
      if (containerRef.current) {
        const elementsWithExtensionAttrs = containerRef.current.querySelectorAll(
          '[fdprocessedid], [data-lastpass-icon-root], [data-dashlane-rid], [data-bitwarden-watching], [data-1p-ignore], [data-kwimpalastyle]'
        );

        elementsWithExtensionAttrs.forEach((element) => {
          // Remove common browser extension attributes
          const attributesToRemove = [
            'fdprocessedid',
            'data-lastpass-icon-root',
            'data-dashlane-rid',
            'data-bitwarden-watching',
            'data-1p-ignore',
            'data-kwimpalastyle',
            'data-gramm_editor',
            'data-gramm_id'
          ];

          attributesToRemove.forEach(attr => {
            if (element.hasAttribute(attr)) {
              element.removeAttribute(attr);
            }
          });
        });
      }
    };

    // Clean up immediately after hydration
    cleanupExtensionAttributes();

    // Set up a MutationObserver to clean up attributes added later
    let observer: MutationObserver | null = null;

    if (containerRef.current) {
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            const target = mutation.target as Element;
            const attrName = mutation.attributeName;

            // Remove problematic attributes when they're added
            if (attrName && (
              attrName.startsWith('fdprocessedid') ||
              attrName.startsWith('data-lastpass') ||
              attrName.startsWith('data-dashlane') ||
              attrName.startsWith('data-bitwarden') ||
              attrName.startsWith('data-1p') ||
              attrName.startsWith('data-kwimpalastyle') ||
              attrName.startsWith('data-gramm')
            )) {
              target.removeAttribute(attrName);
            }
          }
        });
      });

      observer.observe(containerRef.current, {
        attributes: true,
        subtree: true,
        attributeFilter: [] // Observe all attributes
      });
    }

    // Cleanup observer on unmount
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Show fallback during SSR and before hydration
  if (!isHydrated) {
    return fallback ? (
      <div className={className} suppressHydrationWarning={suppressWarnings}>
        {fallback}
      </div>
    ) : null;
  }

  // Show actual content after hydration
  return (
    <div
      ref={containerRef}
      className={`hydration-safe ${className}`}
      suppressHydrationWarning={suppressWarnings}
    >
      {children}
    </div>
  );
}

/**
 * Hook version for components that need hydration-safe behavior
 */
export function useHydrationSafe() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * HOC version for wrapping entire components
 */
export function withHydrationSafe<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function HydrationSafeWrapper(props: T) {
    return (
      <HydrationSafeComponent fallback={fallback}>
        <Component {...props} />
      </HydrationSafeComponent>
    );
  };
}
