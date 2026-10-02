# Dataset Organization — Listening & Writing

## What this solves

You have one raw folder of audio files + matching-named transcript files. This needs to become:
- `listening.json` items tagged `difficulty: "low"` (≤5–8s clips) or `"medium"` (~9–15s clips)
- `writing.json` items (>15s clips) — but these also need **comprehension questions**, which can't be derived from duration or transcript length alone (that's a separate authoring step below, not part of the automated script).

This is a **one-time, run-locally script**, not app runtime code — it doesn't go in `/app`, it's a build-tooling script you run once (or re-run if you add more raw files later) to produce the two JSON files.

---

## Step 1 — Run this prompt in Antigravity to build the categorization script

```
Context: read docs/capgemini-practice-portal-spec.md Section 2.2 and 2.3 (difficulty 
tiers and Writing's >15s threshold) and Section 3 (dataset pipeline). Read 
docs/build-prompts.md's Prompt 2 section for the exact ListeningItem/WritingItem shapes 
this script must output.

Build a one-time Node.js script at scripts/organizeDataset.ts (run via ts-node or 
tsx, not part of the Next.js app itself) that:

1. Reads a raw dataset folder (path configurable via a RAW_DATASET_DIR constant at the 
   top of the file, default "./raw-dataset") containing audio files (.mp3/.wav) and 
   matching-named transcript files (.txt) — e.g. sentence_01.mp3 + sentence_01.txt are 
   a pair, matched by filename stem.

2. For each pair, reads the audio file's duration in seconds. Use the 
   `music-metadata` npm package (parseFile) for this — it's pure JS, no ffmpeg binary 
   dependency, works across platforms without extra system installs.

3. Classifies each pair by duration:
   - duration <= 8 seconds -> Listening, difficulty "low"
   - duration > 8 and <= 15 seconds -> Listening, difficulty "medium"
   - duration > 15 seconds -> Writing (paragraph)
   Make these three thresholds named constants at the top of the file (LOW_MAX_SEC = 8, 
   MEDIUM_MAX_SEC = 15) so they're easy to adjust later without touching the logic.

4. For Listening items: copies the audio file to /public/audio/listening/, renamed 
   sequentially within its tier as l-low-001.mp3, l-low-002.mp3, ... and l-med-001.mp3, 
   l-med-002.mp3, .... Builds a listening.json array (written to /data/listening.json) 
   with entries: { id, audio: "/audio/listening/<filename>", transcript: <contents of 
   the matching .txt file, trimmed>, difficulty }. id format: "l-low-001", "l-med-001" 
   matching the audio filename stem.

5. For Writing items: copies the audio file to /public/audio/writing/, renamed 
   sequentially as w001.mp3, w002.mp3, .... Builds a writing.json array (written to 
   /data/writing.json) with entries: { id: "w001", audio: "/audio/writing/w001.mp3", 
   transcript: <contents of matching .txt, trimmed>, questions: [] } — leave questions 
   as an empty array; these get filled in manually in Step 2 below, this script's job 
   is only to produce the paragraph + transcript + empty questions slot.

6. If listening.json or writing.json already exist at /data/, merge rather than 
   overwrite: keep existing entries (matched by id), only append genuinely new ones 
   (a pair whose audio filename stem doesn't match any existing entry's id-derived 
   filename), so re-running the script after adding more raw files doesn't wipe out 
   manually-added Writing questions from a previous run.

7. Print a summary when done: how many Listening-low, Listening-medium, and Writing 
   items were found/added, and list any audio file that had NO matching .txt transcript 
   (these should be flagged, not silently skipped or guessed at).

8. Add the script to package.json as a "organize-dataset" script command.

After building this, update docs/STATUS.md: add a note under the Post-build checklist 
that the dataset organization script exists at scripts/organizeDataset.ts and has been 
run against the real raw dataset, with the resulting item counts per tier.
```

---

## Step 2 — Writing comprehension questions (manual, after Step 1 runs)

The script above gets you paragraphs + transcripts into `writing.json` with empty `questions: []`. Someone still has to read each paragraph and write 2–3 comprehension questions — this is inherently a content-understanding task, not something duration-based classification can do.

**Two ways to do this efficiently:**

**A — Do it yourself, paragraph by paragraph.** For each Writing paragraph, write 2–3 questions that test whether someone listening (not reading) caught the key facts — who/what/when/where type questions work well for this format, matching the "Q&A on a paragraph you heard once" pattern from the original T&P images.

**B — Draft with AI, then review yourself.** Paste me each paragraph's transcript here and I'll draft a few comprehension questions (mix of MCQ and short-text) in the exact `WritingQuestion` shape your schema expects — but **you should still listen to the audio and sanity-check each question against it** before it goes live, the same caution as the earlier STT-transcript point: a question drafted from text alone can occasionally miss something only audible in the actual recording (tone, emphasis, a number spoken differently than written).

Either way, once questions are filled in, manually edit the corresponding entry in `/data/writing.json` — no need to re-run the script for this part.

---

## Folder layout this produces

```
/data                          (server-only)
  listening.json                difficulty: "low" | "medium" per item
  writing.json                  questions filled in manually after Step 1

/public/audio
  /listening
    l-low-001.mp3, l-low-002.mp3, ...
    l-med-001.mp3, l-med-002.mp3, ...
  /writing
    w001.mp3, w002.mp3, ...

/raw-dataset                    (your original folder — keep it, script reads from 
                                  it but doesn't modify/delete originals)
```
