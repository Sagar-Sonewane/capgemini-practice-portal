"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function ListeningInstructionsPage() {
  const router = useRouter();
  const [enableTimer, setEnableTimer] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<"both" | "low" | "medium">("both");

  const handleStart = () => {
    const params = new URLSearchParams();
    if (enableTimer) params.set("timer", "true");
    if (difficulty !== "both") params.set("difficulty", difficulty);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    router.push(`/listening/test${queryString}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            ← Back to Home
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            Module 2
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Listening Assessment
          </h1>
          <p className="text-slate-600 leading-relaxed">
            Test your auditory comprehension and memory by repeating or transcribing spoken sentences.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Assessment Instructions</h2>

          <ul className="space-y-4 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs">
                1
              </span>
              <span>
                <strong>Play-Count Limit:</strong> Each sentence audio clip can only be played <strong>once or twice</strong>. Once the limit is reached, replay is locked.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs">
                2
              </span>
              <span>
                <strong>No Text Displayed:</strong> The sentence text is never shown on screen during the test.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs">
                3
              </span>
              <span>
                <strong>Flexible Response Modes:</strong> Respond either by <strong>speaking aloud</strong> into your microphone or by <strong>typing from memory</strong>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs">
                4
              </span>
              <span>
                <strong>Accurate Scoring:</strong> Evaluated against the server-side ground truth transcript using word-level accuracy and completeness.
              </span>
            </li>
          </ul>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            {/* Difficulty Selector */}
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2.5">
              <div>
                <span className="text-sm font-medium text-slate-800 block">Difficulty Level</span>
                <span className="text-xs text-slate-500">Choose sentence length and complexity</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                {[
                  { id: "both", title: "Both", desc: "Mixed (Low & Med)" },
                  { id: "low", title: "Low", desc: "Short (≤ 8 sec)" },
                  { id: "medium", title: "Medium", desc: "Longer (8–15 sec)" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDifficulty(opt.id as "both" | "low" | "medium")}
                    className={`py-2 px-3 rounded-lg text-left transition-all border ${
                      difficulty === opt.id
                        ? "bg-white border-blue-500 text-blue-700 shadow-xs ring-1 ring-blue-500"
                        : "bg-slate-100/70 border-transparent text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                    }`}
                  >
                    <span className="block text-xs font-semibold">{opt.title}</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-sm font-medium text-slate-800 block">Optional Countdown Timer</span>
                <span className="text-xs text-slate-500">Enable a 30s response timer per sentence</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTimer}
                  onChange={(e) => setEnableTimer(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
              🎧 <strong>Tip:</strong> Use headphones for clear audio and ensure a quiet background environment.
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" onClick={handleStart} className="px-8 py-3 text-base">
            Start Listening Test →
          </Button>
        </div>
      </div>
    </main>
  );
}
