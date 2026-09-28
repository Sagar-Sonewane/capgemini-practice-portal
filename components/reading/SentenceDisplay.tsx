"use client";

import React from "react";
import { copyPasteGuardProps } from "@/lib/integrity/copyPasteGuard";

export interface SentenceDisplayProps {
  sentence: string;
  sentenceNumber?: number;
  totalSentences?: number;
}

export const SentenceDisplay: React.FC<SentenceDisplayProps> = ({
  sentence,
  sentenceNumber,
  totalSentences,
}) => {
  return (
    <div
      {...copyPasteGuardProps}
      className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 transition-all"
    >
      {sentenceNumber && totalSentences ? (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Sentence {sentenceNumber} of {totalSentences}</span>
          <span className="text-slate-400 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
            Protected Text
          </span>
        </div>
      ) : null}

      <p className="text-xl sm:text-2xl leading-relaxed text-slate-800 font-medium tracking-tight">
        {sentence}
      </p>
    </div>
  );
};

export default SentenceDisplay;
