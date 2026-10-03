import { useState, useCallback, useRef } from "react";

export interface UsePlayCountGuardReturn {
  playCount: number;
  canPlay: boolean;
  playsRemaining: number;
  isPlayLimitReached: boolean;
  isPlaying: boolean;
  registerPlay: (audioElement?: HTMLAudioElement | null) => boolean;
  handleAudioEnded: () => void;
  resetPlayCount: () => void;
}

/**
 * Hook to enforce hard play-count limits on audio playback (e.g. max 1 or 2 plays).
 * Ensures counting only occurs on explicit button action (onClick) and playback
 * runs uninterruptibly without DOM event double-counting.
 */
export function usePlayCountGuard(maxPlays: number = 2): UsePlayCountGuardReturn {
  const [playCount, setPlayCount] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playCountRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  
  playCountRef.current = playCount;
  isPlayingRef.current = isPlaying;

  const canPlay = playCount < maxPlays && !isPlaying;
  const playsRemaining = Math.max(0, maxPlays - playCount);
  const isPlayLimitReached = playCount >= maxPlays;

  const registerPlay = useCallback(
    (audioElement?: HTMLAudioElement | null): boolean => {
      // Only allow play if limit is not reached and not already actively playing
      if (playCountRef.current < maxPlays && !isPlayingRef.current) {
        setPlayCount((prev) => {
          const next = prev + 1;
          playCountRef.current = next;
          return next;
        });
        setIsPlaying(true);
        isPlayingRef.current = true;
        return true;
      }

      // Hard block: pause audio if limit reached
      if (audioElement && playCountRef.current >= maxPlays) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      return false;
    },
    [maxPlays]
  );

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, []);

  const resetPlayCount = useCallback(() => {
    setPlayCount(0);
    setIsPlaying(false);
    playCountRef.current = 0;
    isPlayingRef.current = false;
  }, []);

  return {
    playCount,
    canPlay,
    playsRemaining,
    isPlayLimitReached,
    isPlaying,
    registerPlay,
    handleAudioEnded,
    resetPlayCount,
  };
}
