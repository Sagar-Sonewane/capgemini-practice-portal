# Project Status — Capgemini Practice Portal

This file is the single source of truth for build progress. Antigravity updates it after completing each prompt in `build-prompts.md` — do not let it drift out of sync with what's actually been built.

**Last updated:** 2026-09-28  
**Current phase:** Phase 1 complete — see Post-build checklist

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
| 2 | Types & data schema | ✅ Done | Types defined in types/index.ts; placeholder data (3 entries each in reading/listening/writing.json) created |
| 3 | Scoring logic | ✅ Done | Word-level Levenshtein, matchPercentage (similarity × completeness), scoreBand implemented; all 11 unit tests passed |
| 4 | Randomization logic | ✅ Done | Fisher-Yates shuffle and getRound (with recentIds exclusion, exhaustion reset, and 30-item cap) implemented; all 6 unit tests passed |
| 5 | Integrity guards | ✅ Done | copyPasteGuard (handlers/CSS), usePlayCountGuard (play limit enforcement), useFocusLossTracker (blur/visibility tracking) implemented |
| 6 | API routes (round & score) | ✅ Done | /api/round (GET) and /api/score (POST) implemented; verified transcripts/answers strictly absent from round responses (6 unit tests passed) |
| 7 | Reading module UI | ✅ Done | Instructions & test runner built with STT hook, copyPasteGuard, Framer Motion transitions, and optional timer toggle (default untimed per spec 2.1) |
| 8 | Listening module UI | ✅ Done | Instructions & test runner built with 2-play AudioPlayer, Speak vs Type ResponseInput toggle, and server-side score evaluation |
| 9 | Writing module UI | ✅ Done | Instructions & test runner built with single-play ParagraphAudioPlayer, QuestionBlock (MCQ + text), and quiz-style evaluation |
| 10 | Result screen | ✅ Done | ResultSummary, ItemBreakdownList, ReviewMistakes (<70% filter), focus loss integrity note, and retry controls built |
| 11 | Landing page & shared UI polish | ✅ Done | Landing page with 3 module cards, animations, Timer (mm:ss + blink), and Phase 2-ready depleting ProgressBar built; all 23 tests pass |

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
- [ ] Replace placeholder JSON (3 sample items) with the real ~50-item datasets per module
- [ ] Test Web Speech API behavior across the browsers your friends actually use
- [x] Confirm timer/progress bar blink + red-state animations look right, not janky
- [ ] Deploy to Vercel, share link, do one full end-to-end run yourself before sending to classmates

---

## Phase 2 (not started — backlog only)

Gamified reasoning challenges (Motion Challenge, Grid Challenge, Deductive Challenge, Inductive Challenge, Switch Challenge, Digit Challenge) — tracked separately, not part of this status table until Phase 1 is complete and Phase 2 planning begins.
