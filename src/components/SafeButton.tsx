"use client";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SafeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

/**
 * A button component that prevents hydration mismatches caused by browser extensions
 * This component handles attributes like 'fdprocessedid' that are added by form fillers
 */
const SafeButton = forwardRef<HTMLButtonElement, SafeButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const [isMounted, setIsMounted] = useState(false);
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef = (ref as React.RefObject<HTMLButtonElement>) || internalRef;

    useEffect(() => {
      setIsMounted(true);

      // Clean up browser extension attributes after mount
      const cleanupAttributes = () => {
        if (buttonRef.current) {
          const problematicAttrs = [
            'fdprocessedid',
            'data-lastpass-icon-root',
            'data-dashlane-rid',
            'data-bitwarden-watching',
            'data-1p-ignore',
            'data-kwimpalastyle',
            'data-gramm_editor',
            'data-gramm_id'
          ];

          problematicAttrs.forEach(attr => {
            if (buttonRef.current?.hasAttribute(attr)) {
              buttonRef.current.removeAttribute(attr);
            }
          });
        }
      };

      // Clean immediately
      cleanupAttributes();

      // Set up observer to clean up attributes added later
      let observer: MutationObserver | null = null;

      if (buttonRef.current) {
        observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName) {
              const attrName = mutation.attributeName;
              if (
                attrName.startsWith('fdprocessedid') ||
                attrName.startsWith('data-lastpass') ||
                attrName.startsWith('data-dashlane') ||
                attrName.startsWith('data-bitwarden') ||
                attrName.startsWith('data-1p') ||
                attrName.startsWith('data-kwimpalastyle') ||
                attrName.startsWith('data-gramm')
              ) {
                (mutation.target as Element).removeAttribute(attrName);
              }
            }
          });
        });

        observer.observe(buttonRef.current, {
          attributes: true,
          attributeFilter: [] // Observe all attributes
        });
      }

      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }, []);

    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
    };

    return (
      <button
        ref={buttonRef}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        suppressHydrationWarning={true}
        {...props}
      >
        {children}
      </button>
    );
  }
);

SafeButton.displayName = "SafeButton";

export default SafeButton;
