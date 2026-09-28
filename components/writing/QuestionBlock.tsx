"use client";

import React from "react";

export interface QuestionFeedback {
  correct: boolean;
  answer?: string;
}

export interface QuestionBlockProps {
  questionNumber: number;
  questionText: string;
  type: "mcq" | "text";
  options?: string[];
  userAnswer: string;
  onChangeAnswer: (answer: string) => void;
  disabled?: boolean;
  feedback?: QuestionFeedback;
}

export const QuestionBlock: React.FC<QuestionBlockProps> = ({
  questionNumber,
  questionText,
  type,
  options,
  userAnswer,
  onChangeAnswer,
  disabled = false,
  feedback,
}) => {
  return (
    <div
      className={`p-6 bg-white border rounded-2xl shadow-sm space-y-4 transition-all ${
        feedback
          ? feedback.correct
            ? "border-emerald-200 bg-emerald-50/20"
            : "border-rose-200 bg-rose-50/20"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-800 leading-snug">
          <span className="text-blue-600 font-bold mr-1.5">{questionNumber}.</span>
          {questionText}
        </h3>

        {feedback && (
          <span
            className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-bold border ${
              feedback.correct
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-rose-100 text-rose-800 border-rose-300"
            }`}
          >
            {feedback.correct ? "✓ Correct" : "✕ Incorrect"}
          </span>
        )}
      </div>

      {type === "mcq" && options ? (
        <div className="space-y-2.5 pt-1">
          {options.map((option, idx) => {
            const isSelected = userAnswer === option;
            return (
              <label
                key={idx}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/50 text-blue-900 font-medium ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                } ${disabled ? "cursor-default opacity-80" : ""}`}
              >
                <input
                  type="radio"
                  name={`question-${questionNumber}`}
                  value={option}
                  checked={isSelected}
                  onChange={() => !disabled && onChangeAnswer(option)}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="flex-1">{option}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="pt-1 space-y-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => onChangeAnswer(e.target.value)}
            disabled={disabled}
            placeholder="Type your concise response here..."
            className="w-full p-3.5 border border-slate-300 rounded-xl text-slate-800 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-600"
          />
        </div>
      )}

      {/* Answer feedback key review if incorrect */}
      {feedback && !feedback.correct && feedback.answer && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-0.5">
          <span className="font-semibold block uppercase tracking-wider text-[10px]">
            Correct Answer
          </span>
          <p className="font-medium">{feedback.answer}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionBlock;
