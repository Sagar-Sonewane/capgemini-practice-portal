# File Structure — Capgemini Cognitive Test Practice Portal

Next.js App Router project layout. This is the structure Antigravity should scaffold and build into.

```
capgemini-practice-portal/
│
├── app/
│   ├── layout.tsx                     # Root layout, global styles, fonts
│   ├── page.tsx                       # Landing page (module selection)
│   ├── globals.css                    # Tailwind base + custom CSS vars (timer blink, etc.)
│   │
│   ├── reading/
│   │   ├── page.tsx                   # Instructions screen → launches test
│   │   └── test/
│   │       └── page.tsx               # Active test screen (looping sentences)
│   │
│   ├── listening/
│   │   ├── page.tsx
│   │   └── test/
│   │       └── page.tsx
│   │
│   ├── writing/
│   │   ├── page.tsx
│   │   └── test/
│   │       └── page.tsx
│   │
│   ├── result/
│   │   └── page.tsx                   # Shared result screen, reads result from state/query
│   │
│   └── api/
│       ├── round/
│       │   └── route.ts               # GET: returns randomized round (client-safe fields only)
│       └── score/
│           └── route.ts               # POST: scores a single response against server-side answer key
│
├── components/
│   ├── ui/
│   │   ├── Timer.tsx                  # Countdown, red+blink at ≤10s
│   │   ├── ProgressBar.tsx            # Red depleting bar (games section, Phase 2-ready)
│   │   ├── Button.tsx
│   │   ├── SkipNextControls.tsx       # Skip / Next buttons
│   │   └── ScoreBadge.tsx             # Excellent/Good/Fair/Needs Improvement badge
│   │
│   ├── reading/
│   │   ├── SentenceDisplay.tsx        # Copy-paste/selection disabled
│   │   └── RecordControl.tsx          # Mic record/stop, triggers STT
│   │
│   ├── listening/
│   │   ├── AudioPlayer.tsx            # Play-count enforced
│   │   └── ResponseInput.tsx          # Speak or Type mode toggle
│   │
│   ├── writing/
│   │   ├── ParagraphAudioPlayer.tsx
│   │   └── QuestionBlock.tsx          # MCQ or text-answer question
│   │
│   └── result/
│       ├── ResultSummary.tsx
│       ├── ItemBreakdownList.tsx
│       └── ReviewMistakes.tsx
│
├── lib/
│   ├── scoring/
│   │   ├── editDistance.ts            # Word-level Levenshtein
│   │   ├── matchPercentage.ts         # similarity × completeness formula
│   │   └── scoreBand.ts               # % → Excellent/Good/Fair/Needs Improvement
│   │
│   ├── randomization/
│   │   ├── shuffle.ts                 # Fisher-Yates
│   │   └── getRound.ts                # Pool + recently-seen exclusion logic
│   │
│   ├── integrity/
│   │   ├── copyPasteGuard.ts          # onCopy/onContextMenu/user-select handlers
│   │   ├── playCountGuard.ts          # Enforces once/twice audio play limit
│   │   └── focusLossTracker.ts        # Tab-switch detection → integrity flag
│   │
│   └── stt/
│       └── useSpeechRecognition.ts    # Hook wrapping Web Speech API
│
├── data/                               # SERVER-ONLY — never imported client-side, never in /public
│   ├── reading.json                   # { id, text }[]
│   ├── listening.json                 # { id, audio, transcript }[]  ← transcript never sent to client
│   └── writing.json                   # { id, audio, questions: [{q, type, options?, answer}] }[]  ← answers never sent
│
├── public/
│   └── audio/
│       ├── listening/
│       │   ├── l001.mp3
│       │   └── ...
│       └── writing/
│           ├── w001.mp3
│           └── ...
│
├── types/
│   └── index.ts                       # Shared TS types: RoundItem, ScoreResult, ModuleType, etc.
│
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Notes on key boundaries

- **`/data` vs `/public`** — this split is the entire integrity fix from Section 6 of the spec. `/data` is read only by server code (API routes); nothing in it is ever bundled to the client. `/public/audio` is fine to be public since the audio itself isn't the answer.
- **`/app/api/round` and `/app/api/score`** are the only two endpoints Phase 1 needs — round selection and per-item scoring. Keep it to these two; no need for a broader REST API.
- **`/lib` is framework-agnostic logic** — scoring, randomization, integrity guards, STT hook — kept separate from `/components` so Antigravity (or you) can unit-test the scoring formula independently of any UI.
- **Result screen is shared** (`/app/result`) across all three modules rather than duplicated per module, since the layout in Section 8 of the spec is common — module-specific differences (Listening's Speak/Type note, Writing's per-question grouping) are handled via a `module` prop/param, not separate pages.

---

## Phase 2 readiness (not built now, just noted)

When games are added, they'd likely slot in as:
```
app/games/
  motion-challenge/
  grid-challenge/
  deductive-challenge/
  ...
components/games/
lib/games/
```
`ProgressBar.tsx` in `components/ui/` is already being built with the games section's red-depleting-timer use case in mind (Section 9 of the spec), so it should be generic enough to reuse rather than rebuilt in Phase 2.
