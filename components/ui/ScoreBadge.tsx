import React from "react";

export type ScoreBand = "Excellent" | "Good" | "Fair" | "Needs Improvement";

export interface ScoreBadgeProps {
  band: ScoreBand;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ band }) => {
  const styles: Record<ScoreBand, string> = {
    Excellent: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Good: "bg-blue-100 text-blue-800 border-blue-300",
    Fair: "bg-amber-100 text-amber-800 border-amber-300",
    "Needs Improvement": "bg-rose-100 text-rose-800 border-rose-300",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[band] || "bg-slate-100 text-slate-800 border-slate-300"}`}>
      {band}
    </span>
  );
};

export default ScoreBadge;
