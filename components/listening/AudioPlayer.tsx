"use client";

import React, { useRef, useEffect } from "react";
import Button from "../ui/Button";
import { usePlayCountGuard } from "@/lib/integrity/playCountGuard";

export interface AudioPlayerProps {
  src: string;
  maxPlays?: number;
  onPlayLimitReached?: () => void;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  maxPlays = 2,
  onPlayLimitReached,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    playCount,
    canPlay,
    playsRemaining,
    isPlayLimitReached,
    isPlaying,
    registerPlay,
    handleAudioEnded,
    resetPlayCount,
  } = usePlayCountGuard(maxPlays);

  // Reset play counter whenever src changes (new sentence item)
  useEffect(() => {
    resetPlayCount();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [src, resetPlayCount]);

  useEffect(() => {
    if (isPlayLimitReached && onPlayLimitReached) {
      onPlayLimitReached();
    }
  }, [isPlayLimitReached, onPlayLimitReached]);

  const handlePlayClick = () => {
    // Only allow starting playback if not currently playing and within limit
    if (canPlay && !isPlaying && audioRef.current) {
      const allowed = registerPlay(audioRef.current);
      if (allowed) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Handle auto-play block or playback error gracefully
          handleAudioEnded();
        });
      }
    }
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 select-none">
      {/* Hidden audio element without native controls or keyboard intercept */}
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        tabIndex={-1}
        onEnded={handleAudioEnded}
        onError={handleAudioEnded}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Audio Playback Limit
          </span>
          <p className="text-sm font-medium text-slate-800 mt-0.5">
            {isPlayLimitReached
              ? "Playback limit reached for this sentence"
              : isPlaying
              ? "Audio playing (uninterruptible)..."
              : `You can listen to this clip ${playsRemaining} more time${playsRemaining === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isPlayLimitReached ? "secondary" : "primary"}
            onClick={handlePlayClick}
            disabled={!canPlay || isPlaying || isPlayLimitReached}
            className="flex items-center gap-2 px-5 py-2.5 shadow-sm"
          >
            {isPlaying ? (
              <>
                <svg
                  className="w-5 h-5 text-current animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z"
                  />
                </svg>
                <span>Playing Audio...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 text-current"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>
                  {playCount === 0
                    ? "Play Sentence Audio"
                    : isPlayLimitReached
                    ? "Playback Limit Reached"
                    : `Replay Audio (${playsRemaining} left)`}
                </span>
              </>
            )}
          </Button>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${
              isPlayLimitReached
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : isPlaying
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {playCount} of {maxPlays} plays used
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
