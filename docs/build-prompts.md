# Build Prompts — for Antigravity

Ordered prompts, each meant to be given as its own task/session. Each assumes the previous ones are done.

**Assumes all 5 docs live in `docs/` at the project root** (`capgemini-practice-portal-spec.md`, `tech-stack.md`, `file-structure.md`, `build-prompts.md`, `STATUS.md`) — see the file-placement note from earlier in this conversation. Every prompt below opens with a "Context" line telling Antigravity which docs to read first, so each session (even a fresh one with no prior chat history) picks up the full project picture instead of relying only on whatever's pasted into that one prompt. If Antigravity doesn't have file access in a given session, paste the referenced doc's relevant sections into context manually before running the prompt.

Every prompt also ends with a step to update `STATUS.md`, so progress (and anything left half-done or blocked) stays visible without you having to re-read the whole codebase to figure out where things stand.

---

### Prompt 1 — Project scaffold

```
Context: read docs/capgemini-practice-portal-spec.md (full project spec) and 
docs/tech-stack.md before starting, so you understand what this project is and why 
these specific tech choices were made — not just what to scaffold.

Set up a new Next.js 14+ project using the App Router, TypeScript, and Tailwind CSS.
Name it "capgemini-practice-portal". 

Create the following empty folder structure (with placeholder files where noted) exactly:

[paste the tree from file-structure.md]

Add a README.md with a one-paragraph project description: a free practice tool for 
the Capgemini Cognitive Ability Test's language assessment (Reading, Listening, Writing 
modules), built for personal/classmate use, no accounts or database.

Install and configure: tailwindcss, framer-motion. Do not add any other dependencies yet.

Finally, copy STATUS.md into the project root if it isn't already there, mark row 1 
("Project scaffold") as Done, update "Last updated" and "Current phase" at the top, 
and note any deviation from this prompt (e.g. a different Next.js version) in that row's Notes column.
```

---

### Prompt 2 — Types & data schema

```
Context: read docs/STATUS.md to confirm Prompt 1 is marked Done before starting. Read 
docs/capgemini-practice-portal-spec.md Sections 2 (Modules) and 6 (Data & Answer-Key 
Security) — the types below encode the client/server data split described there.

In /types/index.ts, define TypeScript types for:

- ModuleType = "reading" | "listening" | "writing"
- ReadingItem: { id: string, text: string }
- ListeningItem: { id: string, audio: string, transcript: string }
- WritingQuestion: { q: string, type: "mcq" | "text", options?: string[], answer: string }
- WritingItem: { id: string, audio: string, questions: WritingQuestion[] }
- RoundItemClientSafe: what gets sent to the client for a round — must NEVER include 
  ListeningItem.transcript or WritingQuestion.answer
- ScoreResult: { id: string, matchPercentage?: number, points?: number, correct?: boolean }
- AttemptResult: { module: ModuleType, totalScore: number, maxScore: number, 
  percentage: number, scoreBand: string, timeTakenSec: number, items: ScoreResult[] }

Then create placeholder /data/reading.json, /data/listening.json, /data/writing.json 
with 3 sample entries each (I will replace these with the real ~50-item sets later), 
matching the types above.

Update STATUS.md: mark row 2 ("Types & data schema") Done, update "Last updated" and 
"Current phase", and note in that row that placeholder data (not the real ~50-item sets) 
is in place.
```

---

### Prompt 3 — Scoring logic

```
Context: read docs/STATUS.md to confirm Prompts 1-2 are Done. Read 
docs/capgemini-practice-portal-spec.md Section 4 (Scoring Model) in full — the formula 
below must match it exactly, including the rationale for why completeness is a separate 
factor from similarity (don't simplify or "improve" the formula on your own).

In /lib/scoring/, implement:

1. editDistance.ts — a word-level Levenshtein distance function. Input: two strings. 
   Process: normalize (lowercase, strip punctuation, trim whitespace), split into word 
   arrays, compute edit distance between the two word arrays (not characters). 
   Export: function wordEditDistance(a: string, b: string): number

2. matchPercentage.ts — implement:
   function getMatchPercentage(transcribed: string, original: string): number
   Formula:
     similarity = 1 - (wordEditDistance(transcribed, original) / max(wordCount(transcribed), wordCount(original)))
     completeness = min(wordCount(transcribed), wordCount(original)) / wordCount(original)
     matchPercentage = similarity * completeness
   Return as a 0-100 number (not 0-1).

3. scoreBand.ts — function getScoreBand(percentage: number): string
   90-100 -> "Excellent", 75-89 -> "Good", 50-74 -> "Fair", below 50 -> "Needs Improvement"

Write basic unit tests (using the test runner of your choice) for editDistance.ts and 
matchPercentage.ts with a few example sentence pairs, including: identical sentences 
(should be 100%), a sentence missing half its words (should score noticeably lower than 
a simple word-diff would suggest, per the completeness factor), and a sentence with one 
wrong word (should score high but not 100%).

Update STATUS.md: mark row 3 ("Scoring logic") Done, update "Last updated" and 
"Current phase", and note whether all unit tests passed. If you had to make a judgment 
call on the two open scoring decisions in spec Section 12 (minimum threshold, extra-word 
handling), log that choice under "Blocked / Needs Input" instead of deciding silently — 
those are flagged as needing the user's input.
```

---

### Prompt 4 — Randomization logic

```
Context: read docs/STATUS.md to confirm Prompts 1-3 are Done. Read 
docs/capgemini-practice-portal-spec.md Section 5 (Randomization) — note the integrity 
requirement that this must genuinely prevent users from guessing what's next, not just 
be "good enough"; keep that bar in mind while implementing.

In /lib/randomization/, implement:

1. shuffle.ts — a Fisher-Yates shuffle: function shuffle<T>(arr: T[]): T[]

2. getRound.ts — function getRound<T extends { id: string }>(pool: T[], count: number): T[]
   Logic:
   - Read a "recentIds" array from localStorage (key: `recent_${moduleName}`, so pass 
     moduleName as a param too)
   - Filter the pool to exclude items whose id is in recentIds
   - If fewer than `count` items remain after filtering, reset (use the full pool, 
     clear localStorage for that key)
   - Shuffle the available pool, take the first `count`
   - Update localStorage recentIds with the newly used ids, keeping only the most 
     recent 30 total (trim oldest if over)
   - Return the selected round

Note: this function will run server-side in the API route in Prompt 6, so localStorage 
won't be available there — for the API route, implement an equivalent that accepts 
recentIds as a parameter (passed from the client, which reads its own localStorage) 
rather than accessing localStorage directly in this lib function. Structure getRound.ts 
to take recentIds as an argument rather than reading storage itself, and have the 
client-side caller be the one that reads/writes localStorage around the API call.

Update STATUS.md: mark row 4 ("Randomization logic") Done, update "Last updated" and 
"Current phase".
```

---

### Prompt 5 — Integrity guards

```
Context: read docs/STATUS.md to confirm Prompts 1-4 are Done. Read 
docs/capgemini-practice-portal-spec.md Section 7 (Anti-cheating / Integrity Measures) — 
these three guards map directly to the three bullet points there.

In /lib/integrity/, implement:

1. copyPasteGuard.ts — export React event handler props (onCopy, onContextMenu) that 
   call e.preventDefault(), plus a CSS class/style object for user-select: none. 
   Meant to be spread onto the sentence-display element in the Reading module.

2. playCountGuard.ts — a React hook: function usePlayCountGuard(maxPlays: number)
   Returns: { playCount, canPlay, registerPlay } where registerPlay() increments the 
   counter and should be called on the audio element's onPlay event; if playCount 
   would exceed maxPlays, the hook should also expose a way to pause/block further plays.

3. focusLossTracker.ts — a React hook: function useFocusLossTracker()
   Listens for window 'blur' events during an active test, returns a boolean/count of 
   how many times focus was lost, to be shown as a non-blocking integrity note on the 
   result screen (do not block the test, just flag it).

Update STATUS.md: mark row 5 ("Integrity guards") Done, update "Last updated" and 
"Current phase".
```

---

### Prompt 6 — API routes (server-side round selection & scoring)

```
Context: read docs/STATUS.md to confirm Prompts 1-5 are Done. Read 
docs/capgemini-practice-portal-spec.md Section 6 (Data & Answer-Key Security) in full — 
this is the single most important section in the whole spec; these two routes ARE that 
section's fix implemented. Also check docs/file-structure.md for where /data and 
/public/audio live relative to each other.

Implement two API routes. These must ensure Listening transcripts and Writing answers 
are NEVER included in any response sent to the client.

1. app/api/round/route.ts (GET, query param ?module=reading|listening|writing&count=10)
   - Reads the relevant JSON from /data (server-only import, not from /public)
   - Optionally accepts a `recentIds` query param (comma-separated) to exclude from selection
   - Uses lib/randomization/getRound.ts to select the round
   - Strips out sensitive fields before responding:
     - reading: full item is fine to send (text must be visible to the user)
     - listening: send { id, audio } only — strip transcript
     - writing: send { id, audio, questions: [{q, type, options}] } — strip each 
       question's `answer` field
   - Returns the sanitized round as JSON

2. app/api/score/route.ts (POST)
   - Body: { module, itemId, response } where response is either a transcribed/typed 
     string (reading/listening) or an array of answers (writing, one per question)
   - Looks up the real item (with transcript/answers) from /data server-side using itemId
   - For reading/listening: computes matchPercentage via lib/scoring, returns 
     { matchPercentage, points: 2 * matchPercentage/100 }
   - For writing: compares each answer (exact match for mcq, simple case-insensitive 
     substring/keyword match for text type), returns { results: [{ correct: boolean }] 
     per question }
   - Never echoes the correct answer/transcript back in the response unless the client 
     explicitly requests it for the review screen (add an optional `includeAnswer: 
     boolean` in the request body for that case, used only after scoring is complete)

Update STATUS.md: mark row 6 ("API routes") Done, update "Last updated" and 
"Current phase". Explicitly note in this row that you verified transcripts/answers are 
absent from the /api/round response (this is the core integrity guarantee — confirm it, 
don't assume it).
```

---

### Prompt 7 — Reading module UI

```
Context: read docs/STATUS.md to confirm Prompts 1-6 are Done, and check "Blocked / 
Needs Input" for whether the Reading-timer question has been answered yet. Read 
docs/capgemini-practice-portal-spec.md Section 2.1 (Reading module) and Section 9 
(UI/UX Direction) for the timer/animation behavior expected.

Build the Reading module:

1. app/reading/page.tsx — instructions screen explaining the module, "Start" button 
   that navigates to /reading/test

2. app/reading/test/page.tsx — orchestrates the test:
   - On mount, calls GET /api/round?module=reading&count=10 (pass recentIds from 
     localStorage as described in Prompt 4)
   - Loops through the round, one sentence at a time
   - For each: render components/reading/SentenceDisplay.tsx (sentence text, with 
     copyPasteGuard.ts applied) and components/reading/RecordControl.tsx 
     (record/stop mic button, uses lib/stt/useSpeechRecognition.ts to get a transcript 
     on stop)
   - On stop, calls POST /api/score with the transcript, stores the result
   - Skip/Next buttons (components/ui/SkipNextControls.tsx) to move between sentences; 
     Skip records a 0-score item, Next requires a completed recording
   - Timer (components/ui/Timer.tsx) per sentence if a time limit is desired — turns 
     red + blinks at <=10s remaining (confirm with me whether Reading has a timer or is 
     untimed before wiring this up; spec doesn't lock this per-module)
   - After the last item, navigate to /result with the accumulated AttemptResult

3. lib/stt/useSpeechRecognition.ts — a hook wrapping the Web Speech API 
   (SpeechRecognition / webkitSpeechRecognition), returns { transcript, isListening, 
   start, stop, isSupported }. Handle the unsupported-browser case gracefully (show a 
   message rather than crashing) since this only works reliably on Chromium browsers.

Style with Tailwind: clean, modern, minimal. Use Framer Motion for a subtle fade/slide 
transition between sentences — nothing elaborate.

Update STATUS.md: mark row 7 ("Reading module UI") Done, update "Last updated" and 
"Current phase". If the Reading-timer question wasn't answered yet, keep it logged 
under "Blocked / Needs Input" and note here whether you built the timer as an optional/
toggleable prop (currently off) to unblock progress without deciding it yourself.
```

---

### Prompt 8 — Listening module UI

```
Context: read docs/STATUS.md to confirm Prompts 1-7 are Done. Read 
docs/capgemini-practice-portal-spec.md Section 2.2 (Listening module) — note the 
once/twice play limit and that the transcript must never be shown, which the 
integrity guard from Prompt 5 and the API route from Prompt 6 already enforce.

Build the Listening module, mirroring the Reading module's structure:

1. app/listening/page.tsx — instructions screen (explain: audio plays once or twice, 
   no text shown, respond by speaking or typing)

2. app/listening/test/page.tsx:
   - Fetches round from GET /api/round?module=listening&count=10
   - For each item: components/listening/AudioPlayer.tsx (uses playCountGuard hook, 
     max 2 plays, disables play button after limit) and 
     components/listening/ResponseInput.tsx (toggle between Speak mode — reuses 
     useSpeechRecognition — and Type mode — plain text input)
   - On submit, POST to /api/score with the transcript/typed text
   - Same Skip/Next, Timer, and result-navigation pattern as Reading

Style consistently with the Reading module — same Tailwind/Framer Motion conventions.

Update STATUS.md: mark row 8 ("Listening module UI") Done, update "Last updated" and 
"Current phase".
```

---

### Prompt 9 — Writing module UI

```
Context: read docs/STATUS.md to confirm Prompts 1-8 are Done. Read 
docs/capgemini-practice-portal-spec.md Section 2.3 (Writing module) — scoring here is 
correct/incorrect per question, not the match-percentage formula used by the other two 
modules; don't reuse Prompt 3's scoring functions for this one.

Build the Writing module:

1. app/writing/page.tsx — instructions screen (explain: paragraph plays once, then 
   answer questions about it)

2. app/writing/test/page.tsx:
   - Fetches round from GET /api/round?module=writing&count=5 (fewer items since each 
     has multiple questions)
   - For each item: play the paragraph audio (once, via a simplified AudioPlayer with 
     maxPlays=1), then show components/writing/QuestionBlock.tsx for each question 
     (renders MCQ as radio buttons/options, text type as a text input)
   - On completing all questions for an item, POST to /api/score with the array of answers
   - Skip/Next between items (a full paragraph + its questions = one "item")
   - Same result-navigation pattern

Style consistently with the other two modules.

Update STATUS.md: mark row 9 ("Writing module UI") Done, update "Last updated" and 
"Current phase".
```

---

### Prompt 10 — Result screen

```
Context: read docs/STATUS.md to confirm Prompts 1-9 are Done. Read 
docs/capgemini-practice-portal-spec.md Section 8 (Result Screen) in full — this prompt 
implements that section exactly, including the module-specific differences it calls out 
(Listening's Speak/Type note, Writing's per-question grouping instead of match %).

Build app/result/page.tsx and its components:

1. components/result/ResultSummary.tsx — overall score, percentage, ScoreBadge 
   (components/ui/ScoreBadge.tsx using scoreBand.ts), time taken, best/weakest item 
   (reading/listening: highest/lowest matchPercentage; writing: just correct/total, 
   no best/weakest needed)

2. components/result/ItemBreakdownList.tsx — scrollable list of every item in the 
   round with its score/correctness, matching the format in the spec (Section 8)

3. components/result/ReviewMistakes.tsx — for items below 70% (reading/listening) or 
   incorrect (writing), fetch the correct answer via POST /api/score with 
   includeAnswer: true (or a dedicated small endpoint if cleaner) and show original 
   vs. user response side by side

4. Buttons: Retry (re-runs the same module's test flow with a fresh round), Home 
   (navigate to /)

5. If focusLossTracker flagged any tab-switches during the test, show a small, 
   non-judgmental note on the result screen (e.g. "Focus was lost N times during this 
   attempt") — informational only, not a penalty to the score.

The result screen should read its data from wherever the test pages store the 
AttemptResult when navigating here (e.g. via router state, a query param with a result 
ID stored in sessionStorage, or similar — your choice, keep it simple since there's no 
backend persistence needed for this handoff).

Update STATUS.md: mark row 10 ("Result screen") Done, update "Last updated" and 
"Current phase". If the attempt-history open question (spec Section 12) was decided one 
way or another here, note the decision; otherwise leave it logged under "Blocked / 
Needs Input".
```

---

### Prompt 11 — Landing page & shared UI polish

```
Context: read docs/STATUS.md to confirm Prompts 1-10 are Done. Read 
docs/capgemini-practice-portal-spec.md Section 9 (UI/UX Direction) in full — this is 
the last prompt and the one most focused on getting that section's "usable but modern, 
not extra-stylish" direction right across the whole app, not just this one page.

Build app/page.tsx — the landing/module-selection screen: three cards (Reading, 
Listening, Writing) each with a short description and a "Start" link to the 
respective module's instructions page. Keep it simple and modern per the UI direction: 
subtle entrance animation (Framer Motion), Tailwind styling, no heavy visuals.

Also finalize components/ui/Timer.tsx and components/ui/ProgressBar.tsx as standalone, 
reusable components (not tied to any one module) per these specs:

- Timer.tsx: props { seconds: number, onExpire?: () => void }. Counts down, displays 
  mm:ss, turns red and blinks (CSS animation) when remaining <= 10 seconds.
- ProgressBar.tsx: props { percentRemaining: number }. Renders a horizontal bar that 
  depletes (red fill) as percentRemaining decreases — built generically now so it can 
  be reused in Phase 2's games section without rework.

Do a final pass ensuring Tailwind styling is consistent across all three modules and 
the result screen (spacing, button styles, colors, typography) — extract repeated 
patterns into components/ui/Button.tsx etc. if not already done.

Update STATUS.md: mark row 11 ("Landing page & shared UI polish") Done, update 
"Last updated" and set "Current phase" to "Phase 1 complete — see Post-build checklist". 
Go through the "Post-build checklist" section in STATUS.md and check off anything you 
can verify directly (e.g. confirming /api/round strips sensitive fields); leave the rest 
unchecked for the user to do manually.
```

---

## Notes for using these prompts

- Give them to Antigravity **one at a time, in order** — each depends on the folder/files from the previous prompt existing.
- Each prompt's "Context" line is there so it works even as a **fresh session with no memory of earlier prompts** — as long as Antigravity can read the `docs/` folder, it gets the full picture (what's been built, why, and the relevant spec section) every time, not just whatever's in that one prompt's text.
- Check `STATUS.md` after each prompt before moving to the next — it's the quick way to confirm a step is genuinely done (and see any deviation or blocker) without re-reading the code yourself.
- After Prompt 2, replace the placeholder JSON with your real ~50-item datasets before continuing (or continue with placeholders and swap the JSON files in later — either works since the API routes read from `/data` dynamically).
- Prompt 7's timer question (is Reading timed per-sentence?) isn't locked in the spec — decide before running that prompt, or tell Antigravity to build it as an optional/toggleable prop so it's easy to turn on later.
- After all prompts: manually test the `/api/round` response in a browser or via curl to confirm transcripts/answers are genuinely absent — this is the one thing worth double-checking yourself rather than trusting blindly, since it's the core integrity guarantee of the whole app.
