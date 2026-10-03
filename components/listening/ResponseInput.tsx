"use client";

import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useSpeechRecognition } from "@/lib/stt/useSpeechRecognition";

export interface ResponseInputProps {
  onSubmit: (response: string, mode: "speak" | "type") => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export const ResponseInput: React.FC<ResponseInputProps> = ({
  onSubmit,
  disabled = false,
  isProcessing = false,
}) => {
  const [mode, setMode] = useState<"speak" | "type">("speak");
  const [typedText, setTypedText] = useState<string>("");

  const {
    transcript,
    isListening,
    isSupported,
    start: startSTT,
    stop: stopSTT,
    getLatestTranscript,
    resetTranscript,
    error: sttError,
  } = useSpeechRecognition();

  // Clear typed text and speech when switching modes
  const handleModeChange = (newMode: "speak" | "type") => {
    if (isListening) stopSTT();
    setMode(newMode);
  };

  const handleStartSpeaking = () => {
    resetTranscript();
    startSTT();
  };

  const handleStopSpeaking = () => {
    const textOnStop = stopSTT();
    // Allow brief buffer for STT engine to finalize final word boundary
    setTimeout(() => {
      const finalText = getLatestTranscript() || textOnStop || transcript;
      onSubmit(finalText, "speak");
    }, 300);
  };

  const handleSubmitType = () => {
    if (!typedText.trim()) return;
    onSubmit(typedText.trim(), "type");
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Response Mode
          </span>
          <p className="text-sm font-medium text-slate-700 mt-0.5">
            Choose how you want to respond
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => handleModeChange("speak")}
            disabled={disabled || isProcessing}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "speak"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🎙️ Speak Mode
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("type")}
            disabled={disabled || isProcessing}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "type"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ⌨️ Type Mode
          </button>
        </div>
      </div>

      {mode === "speak" ? (
        <div className="space-y-4">
          {!isSupported && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              ⚠️ Speech recognition is not supported on this browser. Please switch to <strong>Type Mode</strong> or use Google Chrome / Microsoft Edge.
            </div>
          )}

          <div className="flex flex-col items-center gap-3 py-2">
            {isListening ? (
              <Button
                variant="danger"
                onClick={handleStopSpeaking}
                disabled={disabled || isProcessing}
                className="flex items-center gap-2 px-6 py-3 shadow-sm"
              >
                <span className="w-3 h-3 rounded-full bg-white animate-ping inline-block" />
                <span>Stop & Submit</span>
              </Button>
            ) : isProcessing ? (
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Evaluating & Scoring Voice Response...</span>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={handleStartSpeaking}
                disabled={disabled || isProcessing || !isSupported}
                className="flex items-center gap-2 px-6 py-3 shadow-sm bg-blue-600 hover:bg-blue-700"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
                <span>Click to Speak</span>
              </Button>
            )}

            {sttError && (
              <p className="text-xs text-red-600 font-medium">Notice: {sttError}</p>
            )}
          </div>

          {/* Live speech preview while speaking */}
          {isListening && transcript && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Live Speech Detected
              </span>
              <p className="text-sm font-mono text-slate-800 italic">
                "{transcript}"
              </p>
            </div>
          )}

          {!isListening && !isProcessing && (
            <p className="text-xs text-center text-slate-400">
              Listen to the sentence audio, click to speak, and click Stop when done — score will submit automatically.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Type From Memory
            </label>
            <textarea
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              disabled={disabled || isProcessing}
              placeholder="Type the exact sentence you heard..."
              className="w-full p-4 border border-slate-300 rounded-xl text-slate-800 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">
              {typedText.trim().split(/\s+/).filter(Boolean).length} words typed
            </span>
            <Button
              variant="primary"
              onClick={handleSubmitType}
              disabled={disabled || isProcessing || !typedText.trim()}
              className="px-5 py-2 text-xs"
            >
              {isProcessing ? "Scoring Response..." : "Submit Typed Answer →"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseInput;
