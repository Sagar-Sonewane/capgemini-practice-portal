# Project Status — Capgemini Practice Portal

This file is the single source of truth for build progress. Antigravity updates it after completing each prompt in `build-prompts.md` — do not let it drift out of sync with what's actually been built.

**Last updated:** 2026-10-02  
**Current phase:** Datasets organized — Reading (65 sentences), Listening (22 audio items: 12 low, 10 medium), Writing (14 audio paragraphs organized, questions pending). 3 bugs found in use — fix Prompts 12-14 pending (see `docs/build-prompts.md` "Post-Phase-1 Fixes")

---

## How to update this file (for Antigravity)

After finishing a prompt:
1. Change that prompt's status below from `⬜ Not started` → `✅ Done`, or `🚧 In progress` if partially complete.
2. Add a one-line note under "Notes" for that prompt if anything deviated from the prompt as written (e.g. a decision you had to make, a library swapped, something deferred).
3. Update the **Last updated** date and **Current phase** at the top.
4. If a prompt surfaced an open question that needs the user's input before continuing, log it under "Blocked / Needs Input" instead of marking the prompt done.

---

## Build Progress

| # | Prompt | Status | Notes |
|---|---|---|---|
| 1 | Project scaffold | ✅ Done | Next.js 14.2.24 (App Router) + TS + Tailwind CSS + Framer Motion scaffolded |
| 2 | Types & data schema | ✅ Done | Types defined in types/index.ts; Reading uses full 65-item dataset; Listening (22 items) & Writing (14 paragraphs) organized |
| 3 | Scoring logic | ✅ Done | Word-level Levenshtein, matchPercentage (similarity × completeness), scoreBand implemented; all 11 unit tests passed |
| 4 | Randomization logic | ✅ Done | Fisher-Yates shuffle and getRound (with recentIds exclusion, exhaustion reset, and 30-item cap) implemented; all 6 unit tests passed |
| 5 | Integrity guards | ✅ Done | copyPasteGuard (handlers/CSS), usePlayCountGuard (play limit enforcement), useFocusLossTracker (blur/visibility tracking) implemented |
| 6 | API routes (round & score) | ✅ Done | /api/round (GET) and /api/score (POST) implemented; verified transcripts/answers strictly absent from round responses (6 unit tests passed) |
| 7 | Reading module UI | ✅ Done | Instructions & test runner built with STT hook, copyPasteGuard, Framer Motion transitions, and optional timer toggle (default untimed per spec 2.1) |
| 8 | Listening module UI | ✅ Done | Instructions & test runner built with 2-play AudioPlayer, Speak vs Type ResponseInput toggle, and server-side score evaluation |
| 9 | Writing module UI | ✅ Done | Instructions & test runner built with single-play ParagraphAudioPlayer, QuestionBlock (MCQ + text), and quiz-style evaluation |
| 10 | Result screen | ✅ Done | ResultSummary, ItemBreakdownList, ReviewMistakes (<70% filter), focus loss integrity note, and retry controls built |
| 11 | Landing page & shared UI polish | ✅ Done | Landing page with 3 module cards, animations, Timer (mm:ss + blink), and Phase 2-ready depleting ProgressBar built; all 23 tests pass |
| 12 | Fix: Listening difficulty selector | ✅ Done | Segmented button selector (Low [≤8s] / Medium [8–15s] / Both) on instructions screen; filtered before shuffling in /api/round; active difficulty badge on test screen |
| 13 | Fix: Listening play-count bug + disable pause/seek | ✅ Done | Root cause was double-incrementing from registerPlay + native onPlay DOM event listener. Removed all native controls, made playback uninterruptible (no pause/seek), only increment on button click, enforce lock in React state |
| 14 | Fix: auto-submit on stop recording | ✅ Done | Chained Stop recording directly to submission/scoring logic in both Reading and Listening (speak-mode); removed redundant separate submit button and added processing state |

---

## Blocked / Needs Input

_(Anything a prompt couldn't resolve on its own — e.g. the open Reading-timer decision — goes here until the user answers it.)_

- [x] Is the Reading module timed per-sentence, or untimed? -> Built as optional toggle (default untimed as per spec Section 2.1)
- [ ] Minimum score threshold vs. pure linear scoring to 0% (spec Section 12)
- [ ] Should extra/filler words reduce score beyond what edit distance already captures? (spec Section 12)
- [ ] Attempt-history/progress tracking in v1, or defer entirely? (spec Section 12)

---

## Post-build checklist (once all 11 prompts are done)

- [x] Manually verify `/api/round` response never includes Listening transcripts or Writing answers (the core integrity guarantee — check this yourself, don't just trust it)
- [x] **Swap Reading placeholder → real dataset**: Full dataset with 65 sentences active in `/data/reading.json`
- [x] **Dataset organization script created & executed**: `scripts/organizeDataset.ts` (npm run organize-dataset) executed on raw dataset.
  - **Listening**: 22 items organized (`l-low-001`..`012` [<=8s, low], `l-med-001`..`010` [8-15s, medium]) with audio placed in `/public/audio/listening/` and entries in `/data/listening.json`.
  - **Writing**: 14 items organized (`w001`..`w014` [>15s]) with audio placed in `/public/audio/writing/` and passages + empty questions slots in `/data/writing.json`.
- [ ] **Writing Questions authoring (Step 2)**: Author 2-3 comprehension questions for each of the 14 paragraphs in `/data/writing.json`.
- [ ] **Run Prompt 12**: Listening difficulty selector (Low/Medium/Both) — needed now that real low/medium data exists
- [ ] **Run Prompt 13**: Fix Listening play-count bug + remove native audio controls (no pause/seek) as anti-cheat measure
- [ ] **Run Prompt 14**: Auto-submit on stop recording for Reading & Listening-speak-mode
- [ ] Test Web Speech API behavior across the browsers your friends actually use
- [x] Confirm timer/progress bar blink + red-state animations look right, not janky
- [ ] Deploy to Vercel, share link, do one full end-to-end run yourself before sending to classmates

---

## Phase 2 (not started — backlog only)

Gamified reasoning challenges (Motion Challenge, Grid Challenge, Deductive Challenge, Inductive Challenge, Switch Challenge, Digit Challenge) — tracked separately, not part of this status table until Phase 1 is complete and Phase 2 planning begins.
