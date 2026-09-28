"use client";

import React, { useState, useEffect } from "react";

export interface TimerProps {
  seconds?: number;
  secondsLeft?: number;
  onExpire?: () => void;
  autoCountdown?: boolean;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({
  seconds,
  secondsLeft: controlledSeconds,
  onExpire,
  autoCountdown = false,
  className = "",
}) => {
  const initialTime = controlledSeconds !== undefined ? controlledSeconds : seconds ?? 0;
  const [internalSeconds, setInternalSeconds] = useState<number>(initialTime);

  useEffect(() => {
    if (controlledSeconds !== undefined) {
      setInternalSeconds(controlledSeconds);
    } else if (seconds !== undefined) {
      setInternalSeconds(seconds);
    }
  }, [controlledSeconds, seconds]);

  useEffect(() => {
    // Auto countdown when seconds prop is provided and not externally controlled
    if (!autoCountdown && controlledSeconds !== undefined) return;

    if (internalSeconds <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      setInternalSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoCountdown, controlledSeconds, internalSeconds, onExpire]);

  const currentSeconds = controlledSeconds !== undefined ? controlledSeconds : internalSeconds;
  const isUrgent = currentSeconds <= 10 && currentSeconds > 0;
  const isExpired = currentSeconds === 0;

  const mins = Math.floor(currentSeconds / 60);
  const secs = currentSeconds % 60;
  const formattedTime = `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;

  return (
    <div
      className={`font-mono font-bold tracking-tight transition-colors ${
        isUrgent
          ? "text-red-600 animate-blink"
          : isExpired
          ? "text-red-700"
          : "text-slate-800"
      } ${className}`}
    >
      {formattedTime}
    </div>
  );
};

export default Timer;
