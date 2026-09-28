"use client";

import React from "react";

export interface ProgressBarProps {
  percentRemaining?: number;
  progressPercentage?: number;
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentRemaining,
  progressPercentage,
  className = "",
  showLabel = false,
}) => {
  // Depletes red fill as percentRemaining decreases (spec Section 9)
  const remainingValue =
    percentRemaining !== undefined
      ? Math.max(0, Math.min(100, percentRemaining))
      : progressPercentage !== undefined
      ? Math.max(0, Math.min(100, progressPercentage))
      : 100;

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Time Remaining</span>
          <span>{Math.round(remainingValue)}%</span>
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-red-500 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${remainingValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
