<div align="center">

# 🎯 Capgemini Cognitive Assessment — Practice Portal

**A high-fidelity, client-first practice platform for the Capgemini Placement Cognitive Ability & Versant-style Language Assessment.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.18-black?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)
[![Tests](https://img.shields.io/badge/Tests-23%2F23%20Passing-emerald?style=for-the-badge)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Overview

The **Capgemini Practice Portal** is a web-based training tool built to help students and candidates prepare for the language assessment modules in Capgemini's recruitment drives (Reading, Listening, and Writing).

It simulates the exact test constraints, audio replay limits, speech-to-text accuracy metrics, and anti-cheating protections without requiring user accounts or persistent database infrastructure.

---

## ✨ Key Features & Modules

### 1. 📖 Reading Assessment
- **Live Voice Transcription:** Uses the browser's native Web Speech API (`webkitSpeechRecognition`) for hands-free speech input.
- **Copy-Paste & Selection Lock:** Text selection, right-click context menu, and clipboard events are blocked to prevent casual answer extraction.
- **Tolerant Scoring:** Accounts for natural speech variation and pronunciation noise using word-level Levenshtein edit distance combined with completeness ratio.

### 2. 🎧 Listening Assessment
- **Hard Playback Limits:** HTML5 audio playback is strictly capped at **1 or 2 plays** using custom runtime guards (`usePlayCountGuard`).
- **Hidden Answer Key:** Sentence transcripts are never rendered or transmitted to the client during active testing.
- **Dual Response Modes:** Choose between **🎙️ Speak Mode** (voice recording) and **⌨️ Type Mode** (transcribing from memory).

### 3. ✍️ Writing & Comprehension
- **Single-Play Audio Passages:** Informational passages play once, after which replay is locked.
- **Structured Comprehension:** Interactive Multiple-Choice Questions (MCQ) and short-answer text questions with keyword matching.
- **Quiz-Style Evaluation:** Instant grading per question with full rationale and answer key review.

### 4. 🛡️ Data & Answer-Key Security
- **Zero Client Bundling:** Question pools, transcripts, and answer keys are kept in a server-only `/data` directory.
- **Sanitized API Responses:** The `/api/round` endpoint strips all transcripts and answers before returning data to the browser.
- **Serverless Scoring:** Grading occurs server-side via `/api/score`, preventing DevTools network inspection leaks.

### 5. 🎲 Smart Randomization
- **Fisher-Yates (Knuth) Algorithm:** Unbiased uniform distribution of test items.
- **Recent Question Exclusion:** Tracks recently seen item IDs across sessions via `localStorage` (capped at 30 items) to guarantee full pool coverage before questions repeat.

### 6. 📊 Real-Time Analytics & Mistake Review
- **Score Bands:** Automatic categorization into `Excellent` (90–100%), `Good` (75–89%), `Fair` (50–74%), and `Needs Improvement` (<50%).
- **Side-by-Side Mistake Review:** Highlights any response scoring below 70% against the target ground truth.
- **Non-Blocking Integrity Tracking:** Logs window blur / tab-switch occurrences as informational notices on the result screen.
- **Dynamic Urgency Timer:** Reusable countdown timer displaying $mm:ss$ that flashes bold red when $\le 10\text{s}$ remain.

---

## 🧮 Scoring Model

Reading and Listening sentences (max 2 points per item) are evaluated using:

$$\text{similarity} = 1 - \frac{\text{wordEditDistance}(\text{transcribed}, \text{original})}{\max(\text{wordCount}(\text{transcribed}), \text{wordCount}(\text{original}))}$$

$$\text{completeness} = \frac{\min(\text{wordCount}(\text{transcribed}), \text{wordCount}(\text{original}))}{\text{wordCount}(\text{original})}$$

$$\text{matchPercentage} = \text{similarity} \times \text{completeness} \times 100$$

$$\text{points} = 2 \times \frac{\text{matchPercentage}}{100}$$

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Unified React frontend and serverless API endpoints |
| **Language** | TypeScript | Strong typing across scoring logic and payload schemas |
| **Styling** | Tailwind CSS | Modern, clean UI design system |
| **Animations** | Framer Motion | Smooth screen transitions and micro-interactions |
| **Speech-to-Text** | Web Speech API | Zero API cost, browser-native real-time recognition |
| **Testing** | Node.js Test Runner + `tsx` | Fast, dependency-light automated test execution |
| **Deployment** | Vercel | Free-tier hobby deployment with edge functions |

---

## 📁 File Structure

```
capgemini-practice-portal/
├── app/
│   ├── layout.tsx              # Root HTML layout and global styles
│   ├── page.tsx                # Landing page & module selection
│   ├── globals.css             # Tailwind base & blink keyframes
│   ├── reading/                # Reading instructions & test runner
│   ├── listening/              # Listening instructions & test runner
│   ├── writing/                # Writing comprehension & test runner
│   ├── result/                 # Unified test result & mistake review
│   └── api/
│       ├── round/route.ts      # GET: Sanitized randomized round
│       └── score/route.ts      # POST: Server-side evaluation
├── components/
│   ├── ui/                     # Reusable Timer, ProgressBar, Button, Badges
│   ├── reading/                # SentenceDisplay & RecordControl
│   ├── listening/              # Enforced AudioPlayer & ResponseInput
│   ├── writing/                # ParagraphAudioPlayer & QuestionBlock
│   └── result/                 # ResultSummary, ItemBreakdownList, ReviewMistakes
├── lib/
│   ├── scoring/                # Levenshtein distance, match %, score bands
│   ├── randomization/          # Fisher-Yates shuffle & getRound
│   ├── integrity/              # Copy-paste, play count & focus loss guards
│   └── stt/                    # Web Speech API React hook
├── data/                       # SERVER-ONLY JSON datasets (never sent to client)
├── public/                     # Static audio assets
├── tests/                      # Automated unit & integration tests
└── types/                      # Shared TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18+ or v20+ (tested on Node.js v24)
- **Browser**: Google Chrome or Microsoft Edge (recommended for Web Speech API)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/capgemini-practice-portal.git
cd capgemini-practice-portal
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 Deployment

This application is ready for one-click deployment on **Vercel**:

1. Push your repository to GitHub.
2. Import the repository in the [Vercel Dashboard](https://vercel.com/new).
3. Select **Next.js** framework preset and click **Deploy**.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
