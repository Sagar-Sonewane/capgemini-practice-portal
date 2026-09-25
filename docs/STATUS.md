# Project Status — Capgemini Practice Portal

This file is the single source of truth for build progress. Antigravity updates it after completing each prompt in `build-prompts.md` — do not let it drift out of sync with what's actually been built.

**Last updated:** _(update this line every time the file changes)_
**Current phase:** _Not started_

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
| 1 | Project scaffold | ⬜ Not started | |
| 2 | Types & data schema | ⬜ Not started | |
| 3 | Scoring logic | ⬜ Not started | |
| 4 | Randomization logic | ⬜ Not started | |
| 5 | Integrity guards | ⬜ Not started | |
| 6 | API routes (round & score) | ⬜ Not started | |
| 7 | Reading module UI | ⬜ Not started | |
| 8 | Listening module UI | ⬜ Not started | |
| 9 | Writing module UI | ⬜ Not started | |
| 10 | Result screen | ⬜ Not started | |
| 11 | Landing page & shared UI polish | ⬜ Not started | |

---

## Blocked / Needs Input

_(Anything a prompt couldn't resolve on its own — e.g. the open Reading-timer decision — goes here until the user answers it.)_

- [ ] Is the Reading module timed per-sentence, or untimed? (affects Prompt 7)
- [ ] Minimum score threshold vs. pure linear scoring to 0% (spec Section 12)
- [ ] Should extra/filler words reduce score beyond what edit distance already captures? (spec Section 12)
- [ ] Attempt-history/progress tracking in v1, or defer entirely? (spec Section 12)

---

## Post-build checklist (once all 11 prompts are done)

- [ ] Manually verify `/api/round` response never includes Listening transcripts or Writing answers (the core integrity guarantee — check this yourself, don't just trust it)
- [ ] Replace placeholder JSON (3 sample items) with the real ~50-item datasets per module
- [ ] Test Web Speech API behavior across the browsers your friends actually use
- [ ] Confirm timer/progress bar blink + red-state animations look right, not janky
- [ ] Deploy to Vercel, share link, do one full end-to-end run yourself before sending to classmates

---

## Phase 2 (not started — backlog only)

Gamified reasoning challenges (Motion Challenge, Grid Challenge, Deductive Challenge, Inductive Challenge, Switch Challenge, Digit Challenge) — tracked separately, not part of this status table until Phase 1 is complete and Phase 2 planning begins.
