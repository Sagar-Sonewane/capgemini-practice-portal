"use client";

import React from "react";
import { AttemptResult } from "@/types";

export interface ReviewMistakesProps {
  result: AttemptResult;
}

export const ReviewMistakes: React.FC<ReviewMistakesProps> = ({ result }) => {
  const { module, items } = result;

  // Filter items below 70% or incorrect
  const mistakes = items.filter((item) => {
    if (module === "writing") {
      return item.correct === false || (item.matchPercentage ?? 100) < 70;
    }
    return (item.matchPercentage ?? 0) < 70;
  });

  if (mistakes.length === 0) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-8 text-center space-y-2 shadow-sm">
        <div className="text-3xl">🎉</div>
        <h3 className="text-lg font-bold text-emerald-900">Outstanding Performance!</h3>
        <p className="text-sm text-emerald-700 max-w-md mx-auto">
          You scored 70% or higher on all items in this session. Keep up the high accuracy!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Review Mistakes & Weak Areas</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {mistakes.length} item{mistakes.length === 1 ? "" : "s"} scored below 70% threshold. Compare your response against the original to improve.
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
          {mistakes.length} to review
        </span>
      </div>

      <div className="space-y-4">
        {mistakes.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Item Review #{idx + 1}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full">
                {item.matchPercentage ?? 0}% Match
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original sentence / ground truth */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">
                  Original Target Text
                </span>
                <p className="text-sm font-medium text-slate-900 leading-relaxed">
                  {item.originalText || "(Target sentence)"}
                </p>
              </div>

              {/* User's response */}
              <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">
                    Your Response
                  </span>
                  {item.mode && (
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      {item.mode} mode
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-800 font-mono italic leading-relaxed">
                  {item.userResponse || "(No response recorded)"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewMistakes;
