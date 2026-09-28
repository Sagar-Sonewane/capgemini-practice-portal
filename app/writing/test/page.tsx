"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ParagraphAudioPlayer from "@/components/writing/ParagraphAudioPlayer";
import QuestionBlock, { QuestionFeedback } from "@/components/writing/QuestionBlock";
import SkipNextControls from "@/components/ui/SkipNextControls";
import Timer from "@/components/ui/Timer";
import Button from "@/components/ui/Button";
import ScoreBadge from "@/components/ui/ScoreBadge";
import { useFocusLossTracker } from "@/lib/integrity/focusLossTracker";
import { getRecentIdsFromStorage, saveRecentIdsToStorage } from "@/lib/randomization/getRound";
import { getScoreBand } from "@/lib/scoring/scoreBand";
import { WritingItemClientSafe, ScoreResult, AttemptResult } from "@/types";

const PARAGRAPH_TIME_LIMIT = 60; // seconds if timer enabled

function WritingTestSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTimerEnabled = searchParams.get("timer") === "true";

  const [items, setItems] = useState<WritingItemClientSafe[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [scores, setScores] = useState<ScoreResult[]>([]);
  const [currentScore, setCurrentScore] = useState<ScoreResult | null>(null);
  const [questionFeedback, setQuestionFeedback] = useState<Record<number, QuestionFeedback> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(PARAGRAPH_TIME_LIMIT);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { focusLossCount } = useFocusLossTracker(true);

  // Load round data
  useEffect(() => {
    async function loadRound() {
      try {
        setIsLoading(true);
        const recentIds = getRecentIdsFromStorage("writing");
        const res = await fetch(
          `/api/round?module=writing&count=5&recentIds=${recentIds.join(",")}`
        );

        if (!res.ok) {
          throw new Error("Failed to load writing round");
        }

        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setItems(data.items);
          if (data.updatedRecentIds) {
            saveRecentIdsToStorage("writing", data.updatedRecentIds);
          }
        } else {
          throw new Error("No writing passages available for testing");
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

    setSecondsLeft(PARAGRAPH_TIME_LIMIT);

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

  const handleAnswerChange = (questionIdx: number, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIdx]: val,
    }));
  };

  const handleSubmitItem = async () => {
    const currentItem = items[currentIndex];
    if (!currentItem) return;

    setIsProcessing(true);
    try {
      const answersArray = currentItem.questions.map((_, idx) => answers[idx] || "");

      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "writing",
          itemId: currentItem.id,
          response: answersArray,
          includeAnswer: true,
        }),
      });

      if (!res.ok) throw new Error("Scoring failed");

      const data = await res.json();

      // Build feedback mapping
      const feedbackMap: Record<number, QuestionFeedback> = {};
      if (Array.isArray(data.results)) {
        data.results.forEach((r: any) => {
          feedbackMap[r.questionIndex] = {
            correct: r.correct,
            answer: r.answer,
          };
        });
      }
      setQuestionFeedback(feedbackMap);

      const scoreResult: ScoreResult = {
        id: currentItem.id,
        points: data.points,
        matchPercentage: data.percentage,
        correct: data.correctCount === data.totalQuestions,
        userResponse: answersArray.join(" | "),
        originalText: `Passage ${currentIndex + 1} (${data.correctCount}/${data.totalQuestions} correct)`,
        mode: "type",
      };

      setCurrentScore(scoreResult);
    } catch (err) {
      const fallback: ScoreResult = {
        id: currentItem.id,
        points: 0,
        matchPercentage: 0,
        correct: false,
        userResponse: "(Error scoring answers)",
        originalText: `Passage ${currentIndex + 1}`,
        mode: "type",
      };
      setCurrentScore(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (!currentScore) return;

    const nextScores = [...scores, currentScore];
    setScores(nextScores);
    setCurrentScore(null);
    setAnswers({});
    setQuestionFeedback(null);

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
      points: 0,
      matchPercentage: 0,
      correct: false,
      userResponse: "(Skipped)",
      originalText: `Passage ${currentIndex + 1} (Skipped)`,
      mode: "type",
    };

    const nextScores = [...scores, skippedScore];
    setScores(nextScores);
    setCurrentScore(null);
    setAnswers({});
    setQuestionFeedback(null);

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
      module: "writing",
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

    router.push("/result?module=writing");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading Writing assessment round...</p>
        </div>
      </main>
    );
  }

  if (fetchError || items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-6 border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Failed to Load Assessment</h2>
          <p className="text-sm text-slate-600">{fetchError || "No writing passages found."}</p>
          <Link href="/writing">
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">
              Try Again
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const currentItem = items[currentIndex];
  const allQuestionsAnswered = currentItem.questions.every(
    (_, idx) => !!answers[idx] && answers[idx].trim().length > 0
  );

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/writing"
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕ Exit Test
            </Link>
            <span className="text-xs text-slate-300">|</span>
            <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">
              Writing & Comprehension Test
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
              Passage {currentIndex + 1} / {items.length}
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

        {/* Writing Passage with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Audio player with 1-play limit */}
            <ParagraphAudioPlayer src={currentItem.audio} />

            {/* Questions list */}
            <div className="space-y-4">
              {currentItem.questions.map((q, idx) => (
                <QuestionBlock
                  key={idx}
                  questionNumber={idx + 1}
                  questionText={q.q}
                  type={q.type}
                  options={q.options}
                  userAnswer={answers[idx] || ""}
                  onChangeAnswer={(val) => handleAnswerChange(idx, val)}
                  disabled={currentScore !== null}
                  feedback={questionFeedback ? questionFeedback[idx] : undefined}
                />
              ))}
            </div>

            {/* Submit answers action bar */}
            {currentScore === null ? (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
                <span className="text-xs text-slate-500">
                  {Object.keys(answers).filter((k) => !!answers[Number(k)]?.trim()).length} of{" "}
                  {currentItem.questions.length} questions answered
                </span>
                <Button
                  variant="primary"
                  onClick={handleSubmitItem}
                  disabled={!allQuestionsAnswered || isProcessing}
                  className="px-6 py-2.5 text-sm"
                >
                  {isProcessing ? "Evaluating Answers..." : "Submit Passage Answers →"}
                </Button>
              </div>
            ) : (
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
                    Passage Evaluated
                  </span>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    Accuracy Score: <strong>{Math.round(currentScore.matchPercentage || 0)}%</strong> (+{currentScore.points} pts)
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
              nextLabel={currentIndex + 1 === items.length ? "Finish Assessment →" : "Next Passage →"}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function WritingTestPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-600">Loading Writing Test...</p>
          </div>
        </main>
      }
    >
      <WritingTestSession />
    </Suspense>
  );
}
