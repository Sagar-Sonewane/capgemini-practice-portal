"use client";

import React from "react";
import { AttemptResult, ScoreResult } from "@/types";

export interface ItemBreakdownListProps {
  result: AttemptResult;
}

export const ItemBreakdownList: React.FC<ItemBreakdownListProps> = ({ result }) => {
  const { module, items } = result;

  const getItemStatusBadge = (item: ScoreResult) => {
    const pct = item.matchPercentage ?? 0;
    if (pct >= 85) {
      return (
        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          {pct}%
        </span>
      );
    }
    if (pct >= 60) {
      return (
        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
          {pct}%
        </span>
      );
    }
    return (
      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200">
        {pct}%
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Per-Item Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed performance breakdown for all {items.length} items in this round
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1 space-y-4">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="pt-4 first:pt-0 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  #{idx + 1}
                </span>
                {item.mode && (
                  <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {item.mode}
                  </span>
                )}
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-semibold text-slate-700">
                  +{item.points ?? 0} pts
                </span>
              </div>

              <div>{getItemStatusBadge(item)}</div>
            </div>

            {/* Original Sentence / Item context */}
            {item.originalText && (
              <p className="text-sm font-medium text-slate-900 leading-relaxed">
                {item.originalText}
              </p>
            )}

            {/* User response */}
            {item.userResponse && (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                  Your Response
                </span>
                <p className="text-slate-700 font-mono italic">
                  {item.userResponse}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemBreakdownList;
