"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

interface ModuleCardProps {
  id: string;
  title: string;
  badge: string;
  description: string;
  details: string[];
  href: string;
  icon: string;
  delay: number;
}

function ModuleCard({
  title,
  badge,
  description,
  details,
  href,
  icon,
  delay,
}: ModuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
            {icon}
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            {badge}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>

        <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          {details.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6 mt-4">
        <Link href={href} className="block">
          <Button variant="primary" className="w-full justify-between group-hover:bg-blue-700">
            <span>Start Assessment</span>
            <span>→</span>
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const modules: ModuleCardProps[] = [
    {
      id: "reading",
      title: "Reading Assessment",
      badge: "Module 1",
      icon: "📖",
      description:
        "Practice reading complex technical and professional sentences aloud into your microphone with automated accuracy scoring.",
      details: [
        "10 randomized sentences per round",
        "Word-level Levenshtein similarity & completeness",
        "Copy-paste & text selection protection",
      ],
      href: "/reading",
      delay: 0.1,
    },
    {
      id: "listening",
      title: "Listening Assessment",
      badge: "Module 2",
      icon: "🎧",
      description:
        "Listen to spoken sentences with strict replay limits and respond either by repeating aloud or typing from memory.",
      details: [
        "Audio strictly limited to 1–2 plays",
        "Sentence text hidden during test",
        "Dual response mode: Speak or Type",
      ],
      href: "/listening",
      delay: 0.2,
    },
    {
      id: "writing",
      title: "Writing & Comprehension",
      badge: "Module 3",
      icon: "✍️",
      description:
        "Listen to informational audio passages and answer tied multiple-choice and short text comprehension questions.",
      details: [
        "Passage audio plays once",
        "MCQ and short-answer text questions",
        "Quiz-style percentage scoring",
      ],
      href: "/writing",
      delay: 0.3,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-semibold">
            <span>🎯 Placement Prep Portal</span>
            <span>•</span>
            <span>Language Modules</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Capgemini Cognitive Ability Practice Portal
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Free practice tool designed for the Capgemini cognitive language assessment test. Master Reading, Listening, and Writing modules with real exam-like mechanics.
          </p>
        </motion.div>

        {/* 3 Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((m) => (
            <ModuleCard key={m.id} {...m} />
          ))}
        </div>

        {/* Feature Highlights Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs"
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
            Practice Portal Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span>🔒</span> No Accounts / No Database
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero setup required. Your recent sessions and attempts are saved locally on your device.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span>🎲</span> Smart Randomization
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fisher-Yates shuffling with recent question exclusion ensures you cycle through the whole question bank.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span>🛡️</span> Server-Side Answer Protection
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Answer keys and transcripts are never bundled to the browser to ensure authentic test practice.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-4">
          Built for student practice • Capgemini Cognitive Assessment Language Modules (Phase 1)
        </div>
      </div>
    </main>
  );
}
