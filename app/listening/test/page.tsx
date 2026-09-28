"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import AudioPlayer from "@/components/listening/AudioPlayer";
import ResponseInput from "@/components/listening/ResponseInput";
import SkipNextControls from "@/components/ui/SkipNextControls";
import Timer from "@/components/ui/Timer";
import ScoreBadge from "@/components/ui/ScoreBadge";
import { useFocusLossTracker } from "@/lib/integrity/focusLossTracker";
import { getRecentIdsFromStorage, saveRecentIdsToStorage } from "@/lib/randomization/getRound";
import { getScoreBand } from "@/lib/scoring/scoreBand";
import { ListeningItemClientSafe, ScoreResult, AttemptResult } from "@/types";

const SENTENCE_TIME_LIMIT = 30; // seconds if timer enabled

function ListeningTestSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTimerEnabled = searchParams.get("timer") === "true";

  const [items, setItems] = useState<ListeningItemClientSafe[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scores, setScores] = useState<ScoreResult[]>([]);
  const [currentScore, setCurrentScore] = useState<ScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(SENTENCE_TIME_LIMIT);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { focusLossCount } = useFocusLossTracker(true);

  // Load round data
  useEffect(() => {
    async function loadRound() {
      try {
        setIsLoading(true);
        const recentIds = getRecentIdsFromStorage("listening");
        const res = await fetch(
          `/api/round?module=listening&count=10&recentIds=${recentIds.join(",")}`
        );

        if (!res.ok) {
          throw new Error("Failed to load listening round");
        }

        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setItems(data.items);
          if (data.updatedRecentIds) {
            saveRecentIdsToStorage("listening", data.updatedRecentIds);
          }
        } else {
          throw new Error("No listening items available for testing");
        }
      } catch (err: any) {
        setFetchError(err.message || "Failed to initialize test");
      } finally {
        setIsLoading(false);
        startTimeRef.current = Date.now();
      }
    }

    loadRound();
  }, []);

  // Timer logic
  useEffect(() => {
    if (!isTimerEnabled || isLoading || items.length === 0 || currentScore !== null) {
      return;
    }

    setSecondsLeft(SENTENCE_TIME_LIMIT);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isTimerEnabled, isLoading, items.length, currentScore]);

  // Submit response for scoring
  const handleSubmitResponse = useCallback(
    async (responseText: string, mode: "speak" | "type") => {
      const currentItem = items[currentIndex];
      if (!currentItem) return;

      setIsProcessing(true);
      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            module: "listening",
            itemId: currentItem.id,
            response: responseText,
            includeAnswer: true,
          }),
        });

        if (!res.ok) throw new Error("Scoring failed");

        const data = await res.json();
        const scoreResult: ScoreResult = {
          id: currentItem.id,
          matchPercentage: data.matchPercentage,
          points: data.points,
          userResponse: responseText || "(No response recorded)",
          originalText: data.originalText || "(Ground truth transcript)",
          mode,
        };

        setCurrentScore(scoreResult);
      } catch (err) {
        const fallback: ScoreResult = {
          id: currentItem.id,
          matchPercentage: 0,
          points: 0,
          userResponse: responseText || "(Error scoring)",
          originalText: "(Protected transcript)",
          mode,
        };
        setCurrentScore(fallback);
      } finally {
        setIsProcessing(false);
      }
    },
    [items, currentIndex]
  );

  const handleNext = () => {
    if (!currentScore) return;

    const nextScores = [...scores, currentScore];
    setScores(nextScores);
    setCurrentScore(null);

    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishTest(nextScores);
    }
  };

  const handleSkip = () => {
    const currentItem = items[currentIndex];

    const skippedScore: ScoreResult = {
      id: currentItem ? currentItem.id : `skip-${currentIndex}`,
      matchPercentage: 0,
      points: 0,
      userResponse: "(Skipped)",
      originalText: "(Protected transcript)",
      mode: "type",
    };

    const nextScores = [...scores, skippedScore];
    setScores(nextScores);
    setCurrentScore(null);

    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishTest(nextScores);
    }
  };

  const finishTest = (finalScores: ScoreResult[]) => {
    const timeTakenSec = Math.round((Date.now() - startTimeRef.current) / 1000);
    const totalScore = finalScores.reduce((sum, item) => sum + (item.points || 0), 0);
    const maxScore = items.length * 2;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const scoreBand = getScoreBand(percentage);

    const attemptResult: AttemptResult = {
      module: "listening",
      totalScore: Math.round(totalScore * 100) / 100,
      maxScore,
      percentage: Math.round(percentage * 10) / 10,
      scoreBand,
      timeTakenSec,
      items: finalScores,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("lastAttemptResult", JSON.stringify(attemptResult));
      sessionStorage.setItem("lastFocusLossCount", String(focusLossCount));
    }

    router.push("/result?module=listening");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading Listening assessment round...</p>
        </div>
      </main>
    );
  }

  if (fetchError || items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-6 border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Failed to Load Assessment</h2>
          <p className="text-sm text-slate-600">{fetchError || "No audio items found."}</p>
          <Link href="/listening">
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">
              Try Again
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/listening"
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕ Exit Test
            </Link>
            <span className="text-xs text-slate-300">|</span>
            <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">
              Listening Test
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isTimerEnabled && currentScore === null ? (
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-medium">Time:</span>
                <Timer secondsLeft={secondsLeft} />
              </div>
            ) : null}

            <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {currentIndex + 1} / {items.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
          />
        </div>

        {/* Listening Item with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Audio playback component with 2-play limit */}
            <AudioPlayer src={currentItem.audio} maxPlays={2} />

            {/* Response Input (Speak or Type mode) */}
            <ResponseInput
              onSubmit={handleSubmitResponse}
              disabled={currentScore !== null}
              isProcessing={isProcessing}
            />

            {/* Score result feedback banner */}
            {currentScore && (
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Response Scored
                    </span>
                    <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full capitalize">
                      Mode: {currentScore.mode}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    Accuracy Match: <strong>{currentScore.matchPercentage}%</strong> (+{currentScore.points} pts)
                  </p>
                </div>
                <ScoreBadge band={getScoreBand(currentScore.matchPercentage || 0)} />
              </div>
            )}

            {/* Navigation controls */}
            <SkipNextControls
              onSkip={handleSkip}
              onNext={handleNext}
              isNextDisabled={currentScore === null}
              nextLabel={currentIndex + 1 === items.length ? "Finish Assessment →" : "Next Sentence →"}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function ListeningTestPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-600">Loading Listening Test...</p>
          </div>
        </main>
      }
    >
      <ListeningTestSession />
    </Suspense>
  );
}
