"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ResultSummary from "@/components/result/ResultSummary";
import ItemBreakdownList from "@/components/result/ItemBreakdownList";
import ReviewMistakes from "@/components/result/ReviewMistakes";
import Button from "@/components/ui/Button";
import { AttemptResult } from "@/types";

function ResultView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleParam = searchParams.get("module") || "reading";

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [focusLossCount, setFocusLossCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"summary" | "mistakes" | "breakdown">("summary");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rawResult = sessionStorage.getItem("lastAttemptResult");
        const rawFocusLoss = sessionStorage.getItem("lastFocusLossCount");

        if (rawResult) {
          const parsed = JSON.parse(rawResult);
          setResult(parsed);
        }
        if (rawFocusLoss) {
          setFocusLossCount(parseInt(rawFocusLoss, 10) || 0);
        }
      } catch (err) {
        console.error("Failed to parse attempt result", err);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const handleRetry = () => {
    const targetModule = result ? result.module : moduleParam;
    router.push(`/${targetModule}/test`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading Assessment Results...</p>
        </div>
      </main>
    );
  }

  // Fallback if no result found in session storage
  if (!result) {
    return (
      <main className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
            📊
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">No Recent Assessment Result</h2>
            <p className="text-sm text-slate-600">
              Complete a test session to view your accuracy breakdown and performance metrics.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link href={`/${moduleParam}`}>
              <Button variant="primary" className="w-full">
                Start {moduleParam.charAt(0).toUpperCase() + moduleParam.slice(1)} Test
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            ← Practice Portal Home
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRetry} className="text-xs px-4 py-2">
              ↻ Retry Module
            </Button>
            <Link href="/">
              <Button variant="primary" className="text-xs px-4 py-2">
                Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Summary Card */}
        <ResultSummary result={result} focusLossCount={focusLossCount} />

        {/* Tab navigation */}
        <div className="flex items-center justify-center border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "summary"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Overview & Mistakes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("breakdown")}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "breakdown"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Full Item Breakdown ({result.items.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "summary" ? (
          <div className="space-y-8">
            <ReviewMistakes result={result} />
            <ItemBreakdownList result={result} />
          </div>
        ) : (
          <ItemBreakdownList result={result} />
        )}

        {/* Bottom CTA actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-xs gap-4">
          <div>
            <h4 className="text-base font-bold text-slate-900">Ready for another session?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Practice another randomized round to cycle through more questions from the bank.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="primary" onClick={handleRetry} className="w-full sm:w-auto px-6 py-2.5">
              Retry This Module →
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-600">Loading Result Page...</p>
          </div>
        </main>
      }
    >
      <ResultView />
    </Suspense>
  );
}
