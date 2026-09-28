import { useState, useEffect, useCallback } from "react";

export interface UseFocusLossTrackerReturn {
  focusLossCount: number;
  hasLostFocus: boolean;
  resetFocusLoss: () => void;
}

/**
 * Hook to track window blur / tab-switch events during an active test session.
 * Used for non-blocking integrity reporting on results.
 */
export function useFocusLossTracker(isActive: boolean = true): UseFocusLossTrackerReturn {
  const [focusLossCount, setFocusLossCount] = useState<number>(0);

  useEffect(() => {
    if (!isActive || typeof window === "undefined") return;

    const handleBlur = () => {
      setFocusLossCount((prev) => prev + 1);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setFocusLossCount((prev) => prev + 1);
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive]);

  const resetFocusLoss = useCallback(() => {
    setFocusLossCount(0);
  }, []);

  return {
    focusLossCount,
    hasLostFocus: focusLossCount > 0,
    resetFocusLoss,
  };
}
