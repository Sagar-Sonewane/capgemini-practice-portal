import { useState, useCallback, useRef } from "react";

export interface UsePlayCountGuardReturn {
  playCount: number;
  canPlay: boolean;
  playsRemaining: number;
  isPlayLimitReached: boolean;
  registerPlay: (audioElement?: HTMLAudioElement | null) => boolean;
  handlePlayEvent: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
  resetPlayCount: () => void;
}

/**
 * Hook to enforce hard play-count limits on audio playback (e.g. max 1 or 2 plays).
 * Pauses and blocks the HTML5 audio element if play limits are exceeded.
 */
export function usePlayCountGuard(maxPlays: number = 2): UsePlayCountGuardReturn {
  const [playCount, setPlayCount] = useState<number>(0);
  const playCountRef = useRef<number>(0);
  playCountRef.current = playCount;

  const canPlay = playCount < maxPlays;
  const playsRemaining = Math.max(0, maxPlays - playCount);
  const isPlayLimitReached = playCount >= maxPlays;

  const registerPlay = useCallback(
    (audioElement?: HTMLAudioElement | null): boolean => {
      if (playCountRef.current < maxPlays) {
        setPlayCount((prev) => {
          const next = prev + 1;
          playCountRef.current = next;
          return next;
        });
        return true;
      }

      // Hard block: pause audio if limit reached
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      return false;
    },
    [maxPlays]
  );

  const handlePlayEvent = useCallback(
    (e: React.SyntheticEvent<HTMLAudioElement>) => {
      const audio = e.currentTarget;
      if (playCountRef.current >= maxPlays) {
        audio.pause();
        audio.currentTime = 0;
        return;
      }
      setPlayCount((prev) => {
        const next = prev + 1;
        playCountRef.current = next;
        return next;
      });
    },
    [maxPlays]
  );

  const resetPlayCount = useCallback(() => {
    setPlayCount(0);
    playCountRef.current = 0;
  }, []);

  return {
    playCount,
    canPlay,
    playsRemaining,
    isPlayLimitReached,
    registerPlay,
    handlePlayEvent,
    resetPlayCount,
  };
}
