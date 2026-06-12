"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

const TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4 hours

export function AutoLogout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Log out on inactivity and redirect with timeout parameter
      signOut({ callbackUrl: "/login?timeout=true" });
    }, TIMEOUT_MS);
  };

  useEffect(() => {
    // Initialize timer on component mount
    resetTimer();

    // Events to track user activity
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];

    const handleActivity = () => {
      resetTimer();
    };

    // Attach listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  return null; // This is a utility component, it does not render anything
}
