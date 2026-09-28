"use client";

import React from "react";
import ScoreBadge from "../ui/ScoreBadge";
import { getScoreBand } from "@/lib/scoring/scoreBand";
import { AttemptResult } from "@/types";

export interface ResultSummaryProps {
  result: AttemptResult;
  focusLossCount?: number;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  result,
  focusLossCount = 0,
}) => {
  const { module, totalScore, maxScore, percentage, scoreBand, timeTakenSec, items } = result;

  // Calculate best and weakest items for reading & listening
  let bestItemScore: number | null = null;
  let weakestItemScore: number | null = null;

  if (module === "reading" || module === "listening") {
    const validScores = items
      .map((it) => it.matchPercentage)
      .filter((s): s is number => typeof s === "number");

    if (validScores.length > 0) {
      bestItemScore = Math.max(...validScores);
      weakestItemScore = Math.min(...validScores);
    }
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${remainingSecs}s`;
  };

  const moduleTitle =
    module === "reading"
      ? "Reading Assessment"
      : module === "listening"
      ? "Listening Assessment"
      : "Writing & Comprehension";

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top title & score badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
            Assessment Completed
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">{moduleTitle}</h2>
        </div>

        <div className="flex items-center gap-3">
          <ScoreBadge band={getScoreBand(percentage)} />
        </div>
      </div>

      {/* Main KPI metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <span className="text-xs font-medium text-slate-500 block">Total Points</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalScore}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ {maxScore}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <span className="text-xs font-medium text-slate-500 block">Overall Score</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
            {Math.round(percentage)}%
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <span className="text-xs font-medium text-slate-500 block">Time Taken</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
            {formatTime(timeTakenSec)}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <span className="text-xs font-medium text-slate-500 block">
            {module === "writing" ? "Items Completed" : "Best / Weakest"}
          </span>
          <div className="text-base sm:text-lg font-bold text-slate-800 mt-2">
            {module === "writing" ? (
              <span>{items.length} passages</span>
            ) : bestItemScore !== null && weakestItemScore !== null ? (
              <span className="text-slate-800">
                <span className="text-emerald-600">{bestItemScore}%</span>
                <span className="text-slate-300 mx-1.5">/</span>
                <span className="text-rose-600">{weakestItemScore}%</span>
              </span>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      {/* Non-blocking integrity note if focus was lost */}
      {focusLossCount > 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-800">
          <span className="text-base">ℹ️</span>
          <span>
            <strong>Integrity Note:</strong> Focus was lost <strong>{focusLossCount} time{focusLossCount === 1 ? "" : "s"}</strong> during this attempt (tab-switch or window minimize detected). This is informational and did not penalize your score.
          </span>
        </div>
      )}
    </div>
  );
};

export default ResultSummary;
