# Capgemini Cognitive Ability Test — Practice Portal
## Product & Build Spec (Phase 1)

---

## 1. Purpose

A free web-based practice tool built by a student, for peers, to practice the **Cognitive/Versant-style ability test** used in Capgemini placement drives. Phase 1 covers the language assessment (Reading, Listening, Writing). Phase 2 (backlog, not in this spec) covers gamified reasoning challenges (Motion Challenge, Grid Challenge, Deductive/Inductive Challenge, Switch Challenge, Digit Challenge).

No accounts, no persistent backend database. Hosted as a single web app (target: Vercel), used casually by the builder and classmates.

---

## 2. Phase 1 Modules

### 2.1 Reading
- Sentence is **shown on screen**, fully visible, no time limit.
- User reads it aloud into the mic.
- Copy-paste and text selection disabled on the sentence (deters casual copying/exporting, not meant to be bulletproof).
- Audio recorded → transcribed via STT → scored against the original sentence text.

### 2.2 Listening
- Audio clip plays **once or twice, no more** (hard-enforced via play counter, not just UI convention).
- **Once started, playback cannot be paused, seeked, or rewound** — no native browser audio controls are exposed; the only control is a single "Play" button, disabled once the play limit is reached. This closes the loophole of replaying/scrubbing a clip to re-listen past the intended limit.
- Sentence/transcript is **never shown** to the user.
- User responds in one of two modes:
  - **Speak**: record → STT → compare to ground-truth transcript.
  - **Type**: type from memory → compare directly to ground-truth transcript.
- Scored against the same match-percentage formula as Reading.
- **Difficulty tiers, derived from audio duration**:
  - **Low**: clips ≤ ~5–8 seconds — short, single sentences.
  - **Medium**: clips ~9–15 seconds — longer sentences, more content to retain.
- Difficulty is attached to each item (`difficulty: "low" | "medium"`) so rounds can optionally be filtered or balanced by tier later; v1 just tags and stores it, selection logic can use it or ignore it.

### 2.3 Writing
- A paragraph is played as audio (once).
- **Source**: any clip longer than ~15 seconds is treated as a Writing paragraph rather than a Listening sentence — same raw dataset, split by length.
- User is shown comprehension questions tied to that paragraph (MCQ and/or short text answers).
- MCQ = exact match. Text answers = keyword/simple similarity match (no AI call needed for v1).
- Scored as correct/incorrect per question (quiz-style, not %-match like the other two modules).
- **Questions are authored once, at build/data-prep time**, not generated at runtime — see Section 3 for the question-authoring step, since duration-based classification only produces the paragraph + transcript, not its questions.

---

## 3. Content Source

~50 sentences per module (Reading pool, Listening pool), provided by T&P cell. Writing module content = paragraphs + associated question sets, also T&P-provided.

**Listening + Writing dataset pipeline**: a single raw folder of audio+transcript pairs (matching filenames) is split by **audio duration** into Listening (short/medium) and Writing (long, >~15s) — see `docs/dataset-organization-prompt.md` for the exact script used to classify, rename, and fold this into `listening.json` / `writing.json`. Writing's comprehension questions are **not** derivable from duration or transcript alone — they're authored once per paragraph (manually or LLM-assisted-then-reviewed) as a separate step, since generating a good question requires understanding the paragraph's content, not just its length.

Reading sample sentences are long/complex (15–40 words, embedded clauses) — scoring must tolerate natural speech variation, not require exact match.

---

## 4. Scoring Model

### 4.1 Reading & Listening (per sentence, 2 points max)

Accounts for two things: (a) how close the response is to the original, tolerant of accent/pronunciation-driven STT noise, and (b) whether the user said the *whole* sentence, not just a correct fragment.

```
similarity     = 1 - (wordEditDistance(transcribed, original) / max(wordCount(transcribed), wordCount(original)))
completeness   = min(wordCount(transcribed), wordCount(original)) / wordCount(original)
matchPercentage = similarity × completeness

points = 2 × matchPercentage
```

- Comparison is **word-level edit distance**, not character-level — a single wrong word costs "1 word," not several characters.
- Normalize both strings before comparing: lowercase, strip punctuation, trim whitespace.
- Open decision (not yet locked): whether to apply a minimum threshold (e.g. <40% match → 0 pts) instead of pure linear scoring down to 0, and whether extra/filler words (beyond what's in the original) should also reduce the score or be absorbed into edit-distance cost.

### 4.2 Writing
- Each question scored correct/incorrect.
- Module score = correct answers / total questions.

### 4.3 Score bands (shared across modules, on % basis)
```
90–100%  → Excellent
75–89%   → Good
50–74%   → Fair
<50%     → Needs Improvement
```

---

## 5. Randomization (per round, per module)

- Each module has its own ~50-item pool.
- Each test round draws N items (e.g. 10) at random using a **Fisher-Yates shuffle** — unbiased, no repeats within a round.
- **No-repeat across consecutive sessions**: track recently-seen item IDs (last ~30) in `localStorage`; exclude them from the next round's draw until the pool is exhausted, then reset.
- No backend needed — this is entirely client-side via `localStorage`, but must still guarantee users cycle through most of the pool before anything repeats. Integrity of randomization is not to be compromised for the sake of simplicity — only the infrastructure (no DB, no accounts) stays lightweight.

---

## 6. Data & Answer-Key Security

**Problem:** if sentence/transcript/answer data is shipped to the client as static JSON (e.g. in `/public`), anyone can open DevTools → Network tab and read the full answer key — a real integrity hole, especially for Listening (transcript is the "answer") and Writing (correct answers).

**Fix — server-side round selection & scoring, no traditional database required:**

```
/data                     ← SERVER-ONLY, never in /public
  reading.json            (sentence text CAN be sent to client — reading requires visibility)
  listening.json          (transcript NEVER sent to client)
  writing.json            (answers NEVER sent to client)

/public/audio             ← audio files served publicly (no secrecy loss — user must hear them anyway)
```

**Flow:**
1. Client requests a round → server (API route, e.g. Next.js `/app/api/round`) randomly selects N items server-side and returns only what's needed to *display* the item (sentence text for Reading, audio URL only for Listening/Writing — never the answer key).
2. User responds → client sends transcribed/typed answer to a server route (e.g. `/app/api/score`).
3. Server compares against the real answer/transcript (which never left the server) → returns score (and optionally the correct text, for post-scoring review).
4. Reading is a partial exception since the sentence must be visible to be read — but even there, only the current round's items are ever sent to the client, not the full 50-item bank at once.

This requires no database — just server-side logic (API routes / serverless functions), which Vercel supports natively at no extra cost for this scale of usage.

---

## 7. Anti-cheating / Integrity Measures (all client-side, no extra infra)

- **Copy-paste / selection block** on Reading sentences (`onCopy`, `onContextMenu`, `user-select: none`).
- **Play-count enforcement** on Listening audio — hard-capped via a counter tied to the Play button's click (not the native `play` DOM event, which can fire more than once per intended listen). No native browser audio controls are rendered at all (no `controls` attribute, no scrub bar, no pause) — once a play starts it runs to completion uninterrupted; pausing/seeking to "save" part of a listen for later is not possible.
- **Tab-switch / focus-loss detection** — flag (not block) when the window loses focus mid-test, shown as an integrity note on the result screen.
- **Answer-key never exposed client-side** — see Section 6.

---

## 8. Result Screen (shown after completing a module round)

**Common structure across modules:**
- Overall score (points and/or %) + score band badge
- Summary stats: average match %, best/weakest item, time taken
- Per-item breakdown (scrollable list): original vs. score per sentence/question
- Actions: **Review Mistakes**, **Retry**, **Home**

**Module-specific details:**
- **Reading & Listening**: per-sentence match %; Listening also notes which mode was used (Speak vs Type), since accuracy expectations differ between the two.
- **Writing**: per-question correct/incorrect, grouped by paragraph.

**Review Mistakes screen:** shows original vs. user's response side-by-side for any item below a threshold (e.g. <70% match, or incorrect for Writing) — this is the main learning value of the tool, not just the score.

**Open decision (not yet locked):** whether to show attempt-over-attempt history/improvement (e.g. "improved from 65% → 72%"). Feasible via `localStorage` without a real DB if wanted later; not required for v1.

---

## 9. UI/UX Direction

**Overall philosophy:** usable and modern, not "designed" or flashy. Clean layout, clear hierarchy, subtle motion — not a portfolio piece. Prioritize clarity and speed of use over visual flair.

- **Subtle animations only** — e.g. gentle fade/slide on screen transitions, small feedback pulses on button press/score reveal. No heavy motion, no decorative effects.
- **Navigation controls**: Skip and Next buttons on test items where relevant (e.g. skip a sentence/question without answering, move to next item once done).
- **Timer (Reading/Listening/Writing, wherever timed)**:
  - Countdown shown clearly on screen.
  - Turns **red with a blinking animation** when 10 seconds or fewer remain — a clear, low-effort urgency cue.
- **Progress bar (Games section, Phase 2)**:
  - **Red progress bar** showing remaining time for each game/challenge, depletes as time runs out.

This direction applies across both Phase 1 (Reading/Listening/Writing) and Phase 2 (games) UIs, so the visual language stays consistent as the product grows.

---

## 10. Tech Stack (proposed, lean)

- **Framework**: Next.js (React) — gives both frontend and server-side API routes in one deployable app.
- **Hosting**: Vercel (free tier sufficient for this scale — a handful of users, small audio files).
- **Speech-to-text**: Web Speech API to start (free, browser-native; known limitation — Chrome-only, quality varies by browser/OS).
- **Audio playback**: HTML5 `<audio>`, with a JS play-counter enforcing the once/twice limit.
- **State/history**: `localStorage` only — no accounts, no user database, in Phase 1.
- **Content storage**: server-only JSON files + `/public/audio` for clips (Section 6). No traditional database needed at this scale; can migrate to object storage (e.g. Cloudflare R2/S3) later if content volume grows significantly (e.g. with Phase 2 games).

---

## 11. Explicitly Out of Scope for Phase 1

- User accounts / login
- Cross-device sync or attempt history beyond local browser storage
- Phase 2 gamified reasoning challenges (Motion, Grid, Deductive, Inductive, Switch, Digit) — tracked separately as backlog
- AI-judged semantic scoring for free-text answers (keyword/exact-match is sufficient for v1; can be added later as an enhanced feedback mode)

---

## 12. Open Decisions (to resolve before/during build)

1. Minimum score threshold (hard floor at low match %) vs. pure linear scoring to 0.
2. Whether extra/filler words in a response should reduce score beyond what edit distance already captures.
3. Whether to add attempt-history/progress tracking via `localStorage` in v1 or defer entirely.
