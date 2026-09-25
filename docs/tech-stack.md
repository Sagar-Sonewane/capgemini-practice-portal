# Tech Stack — Capgemini Cognitive Test Practice Portal

Concrete choices, expanding on Section 10 of the main spec. Optimized for: one builder, AI coding agent (Antigravity) doing the implementation, free-tier hosting, no backend team, small user base (classmates).

---

## 1. Core framework

**Next.js 14+ (App Router)**

Why: gives frontend (React) and backend (API routes / server actions) in a single deployable project — exactly what Section 6's server-side answer-key protection needs, with no separate backend service to stand up or pay for.

```
create-next-app@latest --typescript --tailwind --app
```

- **TypeScript** — worth it even for a solo/practice project; scoring logic (edit distance, completeness %) is exactly the kind of thing that benefits from typed function signatures so Antigravity doesn't silently pass a string where a number is expected.
- **Tailwind CSS** — fast to build "usable but modern" UI without hand-rolling CSS; keeps styling consistent across Reading/Listening/Writing without a design system overhead.

---

## 2. Hosting & deployment

**Vercel** (free "Hobby" tier)

- Zero-config deploy for Next.js (same company builds both).
- Serverless functions for API routes included free at this scale — no extra cost for the server-side scoring/round-selection logic in Section 6.
- Automatic HTTPS, preview deployments per git push — useful since you'll iterate a lot.
- Free tier limits (generous for a few dozen classmates practicing): 100GB bandwidth/month, serverless function execution well within free quota for this traffic pattern.

---

## 3. Speech-to-text (STT)

**Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`) — v1 default.

- Free, browser-native, no API key, no per-request cost.
- **Known limitation**: reliable mainly on Chrome/Edge (Chromium-based); inconsistent or unsupported on Firefox/Safari. Worth a visible note in the UI ("best experience on Chrome") rather than silently failing.
- Runs client-side — transcription happens in the browser, then the **transcribed text** (not raw audio) is sent to the server for scoring. This keeps things simple and avoids needing to upload/store user audio anywhere.

**Fallback path (not required for v1, note for later):** if browser STT proves too unreliable across your friend group's devices, a server-side STT API (e.g. a hosted Whisper endpoint) could replace it later — this would change the flow to "upload audio → server transcribes → server scores," slightly more complex and no longer fully free, so only worth it if Web Speech API quality is a real problem in practice.

---

## 4. Audio playback (Listening/Writing modules)

- Native HTML5 `<audio>` element — no library needed.
- Play-count enforcement via JS event listener on `play`, per Section 7.
- Audio files served from `/public/audio/` — static, public, no secrecy needed here per Section 6 (the audio itself isn't the "answer," the transcript is).

---

## 5. State & persistence (no database)

- **`localStorage`** only, for:
  - Recently-seen item IDs (randomization no-repeat logic, Section 5)
  - Optional: last-attempt scores if you decide to add basic history later (currently an open decision)
- No cookies, no accounts, no server-side session needed for v1.

---

## 6. Server-side content & scoring (the answer-key protection layer)

- Plain JSON files in a **server-only** directory (e.g. `/data`, NOT `/public`) — read directly by API routes via Node's `fs`, no database driver needed.
- API routes (Next.js `app/api/.../route.ts`):
  - `GET /api/round?module=reading|listening|writing` → returns a randomized round with only client-safe fields (never transcripts/answers for Listening/Writing).
  - `POST /api/score` → accepts item ID + user response, looks up the real answer server-side, computes score, returns result.
- This is "no database" in the traditional sense (no Postgres/Mongo/etc.) but still correctly keeps secrets server-side — flat files + serverless functions are enough at this content scale (~50 items × 3 modules).

---

## 7. Scoring logic

- Plain TypeScript utility functions, no external library required:
  - Word-level Levenshtein (edit distance) — small, self-contained implementation (~20 lines).
  - Completeness ratio, match % combination — per Section 4 formula.
- Keyword/exact-match logic for Writing module MCQ + short text answers — no AI/embedding calls needed for v1.

---

## 8. UI components & animation

- Tailwind CSS for layout/styling.
- **Framer Motion** (optional but recommended) for the subtle transitions/animations called out in Section 9 — fade/slide on screen change, blinking timer, progress bar depletion. Lightweight, works cleanly with React, avoids hand-writing CSS keyframes for the blink effect.
- No component library needed beyond this — the UI is simple enough (buttons, cards, progress bars, timers) that a full design system (e.g. shadcn/MUI) would be more setup than value here. A handful of custom components is enough.

---

## 9. What's deliberately NOT in the stack (v1)

- ❌ Database (Postgres/Mongo/Supabase/Firebase) — flat JSON + serverless functions cover this scale.
- ❌ Authentication/accounts — no login needed.
- ❌ Paid STT/AI API calls — Web Speech API + string-matching scoring is free and sufficient.
- ❌ Object storage (S3/R2) — `/public/audio` on Vercel is enough for ~50 short clips; revisit only if Phase 2 games add significant asset weight.
- ❌ State management library (Redux/Zustand) — React's built-in state + `localStorage` is enough for this app's complexity.

---

## 10. Summary — the whole stack in one line

**Next.js (TypeScript + Tailwind) on Vercel, with Web Speech API for STT, server-side API routes + flat JSON files for content/scoring, Framer Motion for subtle UI animation, and `localStorage` for the only client-side persistence needed.**
