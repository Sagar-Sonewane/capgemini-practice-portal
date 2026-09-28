"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function WritingInstructionsPage() {
  const router = useRouter();
  const [enableTimer, setEnableTimer] = useState<boolean>(false);

  const handleStart = () => {
    router.push(`/writing/test${enableTimer ? "?timer=true" : ""}`);
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
            Module 3
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Writing & Comprehension Assessment
          </h1>
          <p className="text-slate-600 leading-relaxed">
            Listen to spoken informational paragraphs and answer tied comprehension questions.
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
                <strong>Single Audio Play:</strong> Each paragraph passage plays <strong>only once</strong>. Listen attentively and take mental notes of key facts.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs">
                2
              </span>
              <span>
                <strong>Comprehension Questions:</strong> Each passage includes multiple-choice questions (MCQ) and short-answer text questions.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs">
                3
              </span>
              <span>
                <strong>Quiz Scoring:</strong> Questions are evaluated as correct or incorrect. Overall score is the percentage of questions answered correctly.
              </span>
            </li>
          </ul>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-sm font-medium text-slate-800 block">Optional Countdown Timer</span>
                <span className="text-xs text-slate-500">Enable a 60s timer per passage set</span>
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
              ✍️ <strong>Tip:</strong> For short text questions, focus on concise, direct answers capturing the main terms mentioned in the audio.
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" onClick={handleStart} className="px-8 py-3 text-base">
            Start Writing Test →
          </Button>
        </div>
      </div>
    </main>
  );
}
