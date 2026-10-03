"use client";

import React, { useRef, useEffect } from "react";
import Button from "../ui/Button";
import { usePlayCountGuard } from "@/lib/integrity/playCountGuard";

export interface ParagraphAudioPlayerProps {
  src: string;
  onAudioEnded?: () => void;
}

export const ParagraphAudioPlayer: React.FC<ParagraphAudioPlayerProps> = ({
  src,
  onAudioEnded,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    playCount,
    canPlay,
    isPlayLimitReached,
    isPlaying,
    registerPlay,
    handleAudioEnded,
    resetPlayCount,
  } = usePlayCountGuard(1); // 1 play max

  useEffect(() => {
    resetPlayCount();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [src, resetPlayCount]);

  const handleEnded = () => {
    handleAudioEnded();
    if (onAudioEnded) {
      onAudioEnded();
    }
  };

  const handlePlayClick = () => {
    if (canPlay && !isPlaying && audioRef.current) {
      const allowed = registerPlay(audioRef.current);
      if (allowed) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          handleEnded();
        });
      }
    }
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 select-none">
      {/* Hidden audio element without native controls */}
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        tabIndex={-1}
        onEnded={handleEnded}
        onError={handleEnded}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Paragraph Audio (Single Play Limit)
          </span>
          <p className="text-sm font-medium text-slate-800 mt-0.5">
            {isPlayLimitReached
              ? "Audio playback completed (1/1 play used)"
              : isPlaying
              ? "Audio playing (uninterruptible)..."
              : "Listen carefully. This passage will only play once."}
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
                <span>Playing Passage...</span>
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
                <span>{isPlayLimitReached ? "Played (Locked)" : "Play Passage Audio"}</span>
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
            {playCount} of 1 play used
          </span>
        </div>
      </div>
    </div>
  );
};

export default ParagraphAudioPlayer;
