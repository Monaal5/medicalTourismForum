"use client";
import { useEffect, useState } from "react";

/**
 * Hook to safely handle client-side only content and prevent hydration mismatches
 * Returns true only after the component has mounted on the client side
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Hook to safely access window object and other browser APIs
 * Returns true if we're running in the browser
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook to get the current timestamp that's consistent between server and client
 * Useful for preventing hydration mismatches when dealing with dates
 */
export function useConsistentTimestamp(initialTimestamp?: number) {
  const [timestamp, setTimestamp] = useState(initialTimestamp || Date.now());
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated && !initialTimestamp) {
      setTimestamp(Date.now());
    }
  }, [isHydrated, initialTimestamp]);

  return timestamp;
}
