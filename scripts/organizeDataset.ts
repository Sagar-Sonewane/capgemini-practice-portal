import fs from "fs";
import path from "path";
import { parseFile } from "music-metadata";

// ==========================================
// CONFIGURATION CONSTANTS
// ==========================================
export const RAW_DATASET_DIR =
  process.env.RAW_DATASET_DIR ||
  (fs.existsSync(path.resolve(process.cwd(), "dataset"))
    ? "./dataset"
    : "./raw-dataset");

export const LOW_MAX_SEC = 8;
export const MEDIUM_MAX_SEC = 15;

const PUBLIC_AUDIO_LISTENING_DIR = path.resolve(process.cwd(), "public/audio/listening");
const PUBLIC_AUDIO_WRITING_DIR = path.resolve(process.cwd(), "public/audio/writing");
const DATA_LISTENING_FILE = path.resolve(process.cwd(), "data/listening.json");
const DATA_WRITING_FILE = path.resolve(process.cwd(), "data/writing.json");

interface ListeningEntry {
  id: string;
  audio: string;
  transcript: string;
  difficulty?: "low" | "medium";
}

interface WritingEntry {
  id: string;
  audio: string;
  transcript?: string;
  questions: any[];
}

interface DiscoveredPair {
  stem: string;
  audioPath: string;
  audioExt: string;
  transcriptPath?: string;
  duration?: number;
}

// Helper to ensure target directories exist
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper to format sequential numbers e.g. 1 -> "001"
function formatIndex(index: number): string {
  return String(index).padStart(3, "0");
}

async function run() {
  console.log("==================================================");
  console.log(" 🎙️  Capgemini Practice Portal — Dataset Organizer");
  console.log("==================================================");
  console.log(`Source directory: ${RAW_DATASET_DIR}`);
  console.log(`Thresholds: Low <= ${LOW_MAX_SEC}s, Medium <= ${MEDIUM_MAX_SEC}s, Writing > ${MEDIUM_MAX_SEC}s\n`);

  const resolvedSourceDir = path.resolve(process.cwd(), RAW_DATASET_DIR);

  if (!fs.existsSync(resolvedSourceDir)) {
    console.error(`❌ Source directory "${resolvedSourceDir}" not found.`);
    process.exit(1);
  }

  ensureDirectoryExists(PUBLIC_AUDIO_LISTENING_DIR);
  ensureDirectoryExists(PUBLIC_AUDIO_WRITING_DIR);
  ensureDirectoryExists(path.dirname(DATA_LISTENING_FILE));

  const allFiles = fs.readdirSync(resolvedSourceDir);
  const audioExtensions = new Set([".mp3", ".wav", ".m4a", ".ogg"]);

  const pairs: DiscoveredPair[] = [];
  const missingTranscriptFiles: string[] = [];

  for (const file of allFiles) {
    const ext = path.extname(file).toLowerCase();
    if (audioExtensions.has(ext)) {
      const stem = path.basename(file, ext);
      const matchingTxt = path.join(resolvedSourceDir, `${stem}.txt`);
      const audioFullPath = path.join(resolvedSourceDir, file);

      if (fs.existsSync(matchingTxt)) {
        pairs.push({
          stem,
          audioPath: audioFullPath,
          audioExt: ext,
          transcriptPath: matchingTxt,
        });
      } else {
        missingTranscriptFiles.push(file);
      }
    }
  }

  // Read durations for all valid pairs
  console.log(`Analyzing audio metadata for ${pairs.length} paired files...`);

  for (const pair of pairs) {
    try {
      const metadata = await parseFile(pair.audioPath);
      pair.duration = metadata.format.duration || 0;
    } catch (err: any) {
      console.warn(`⚠️ Warning: Could not read metadata for ${pair.audioPath}: ${err.message}`);
      pair.duration = 0;
    }
  }

  // Load existing data if present
  let existingListening: ListeningEntry[] = [];
  if (fs.existsSync(DATA_LISTENING_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_LISTENING_FILE, "utf-8");
      existingListening = JSON.parse(raw);
    } catch {
      existingListening = [];
    }
  }

  let existingWriting: WritingEntry[] = [];
  if (fs.existsSync(DATA_WRITING_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_WRITING_FILE, "utf-8");
      existingWriting = JSON.parse(raw);
    } catch {
      existingWriting = [];
    }
  }

  // Remove initial dummy placeholder entries (e.g. l001, w001) if real organized files are being populated
  const isDummyPlaceholder = (entry: any) =>
    ["l001", "l002", "l003", "w001", "w002", "w003"].includes(entry.id) &&
    entry.audio.endsWith(".mp3") &&
    !fs.existsSync(path.join(process.cwd(), "public", entry.audio.replace(/^\//, "")));

  const filteredListening = existingListening.filter((item) => !isDummyPlaceholder(item));
  const filteredWriting = existingWriting.filter((item) => !isDummyPlaceholder(item));

  // Determine starting indices for each tier
  const getNextIndex = (entries: { id: string }[], prefix: string): number => {
    let max = 0;
    const regex = new RegExp(`^${prefix}(\\d+)$`);
    for (const entry of entries) {
      const match = entry.id.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    }
    return max + 1;
  };

  let nextLowIndex = getNextIndex(filteredListening, "l-low-");
  let nextMedIndex = getNextIndex(filteredListening, "l-med-");
  let nextWritingIndex = getNextIndex(filteredWriting, "w");

  const existingListeningTranscripts = new Set(filteredListening.map((l) => l.transcript.trim()));
  const existingWritingTranscripts = new Set(filteredWriting.map((w) => (w.transcript || "").trim()));

  let addedLowCount = 0;
  let addedMedCount = 0;
  let addedWritingCount = 0;

  // Sort pairs by stem for deterministic ordering
  pairs.sort((a, b) => a.stem.localeCompare(b.stem, undefined, { numeric: true }));

  for (const pair of pairs) {
    const transcript = fs.readFileSync(pair.transcriptPath!, "utf-8").trim();
    const duration = pair.duration || 0;

    if (duration <= LOW_MAX_SEC) {
      // Listening - Low
      if (existingListeningTranscripts.has(transcript)) continue;

      const newId = `l-low-${formatIndex(nextLowIndex++)}`;
      const targetFilename = `${newId}${pair.audioExt}`;
      const targetAudioPath = path.join(PUBLIC_AUDIO_LISTENING_DIR, targetFilename);

      fs.copyFileSync(pair.audioPath, targetAudioPath);

      filteredListening.push({
        id: newId,
        audio: `/audio/listening/${targetFilename}`,
        transcript,
        difficulty: "low",
      });
      existingListeningTranscripts.add(transcript);
      addedLowCount++;
    } else if (duration <= MEDIUM_MAX_SEC) {
      // Listening - Medium
      if (existingListeningTranscripts.has(transcript)) continue;

      const newId = `l-med-${formatIndex(nextMedIndex++)}`;
      const targetFilename = `${newId}${pair.audioExt}`;
      const targetAudioPath = path.join(PUBLIC_AUDIO_LISTENING_DIR, targetFilename);

      fs.copyFileSync(pair.audioPath, targetAudioPath);

      filteredListening.push({
        id: newId,
        audio: `/audio/listening/${targetFilename}`,
        transcript,
        difficulty: "medium",
      });
      existingListeningTranscripts.add(transcript);
      addedMedCount++;
    } else {
      // Writing (duration > 15s)
      if (existingWritingTranscripts.has(transcript)) continue;

      const newId = `w${formatIndex(nextWritingIndex++)}`;
      const targetFilename = `${newId}${pair.audioExt}`;
      const targetAudioPath = path.join(PUBLIC_AUDIO_WRITING_DIR, targetFilename);

      fs.copyFileSync(pair.audioPath, targetAudioPath);

      filteredWriting.push({
        id: newId,
        audio: `/audio/writing/${targetFilename}`,
        transcript,
        questions: [],
      });
      existingWritingTranscripts.add(transcript);
      addedWritingCount++;
    }
  }

  // Save updated JSON files
  fs.writeFileSync(DATA_LISTENING_FILE, JSON.stringify(filteredListening, null, 2), "utf-8");
  fs.writeFileSync(DATA_WRITING_FILE, JSON.stringify(filteredWriting, null, 2), "utf-8");

  // Summary
  console.log("\n==================================================");
  console.log(" 📊  Dataset Organization Summary");
  console.log("==================================================");
  console.log(`🎧 Listening (Low, <= ${LOW_MAX_SEC}s):       +${addedLowCount} items (Total: ${filteredListening.filter(i => i.difficulty === "low").length})`);
  console.log(`🎧 Listening (Med, >${LOW_MAX_SEC}s, <=${MEDIUM_MAX_SEC}s): +${addedMedCount} items (Total: ${filteredListening.filter(i => i.difficulty === "medium").length})`);
  console.log(`✍️  Writing   (Paragraph, > ${MEDIUM_MAX_SEC}s):  +${addedWritingCount} items (Total: ${filteredWriting.length})`);
  console.log(`--------------------------------------------------`);
  console.log(`📁 Total Listening entries in /data/listening.json: ${filteredListening.length}`);
  console.log(`📁 Total Writing entries in /data/writing.json:     ${filteredWriting.length}`);

  if (missingTranscriptFiles.length > 0) {
    console.log(`\n⚠️  The following ${missingTranscriptFiles.length} audio file(s) had NO matching .txt transcript and were skipped:`);
    for (const f of missingTranscriptFiles) {
      console.log(`   - ${f}`);
    }
  } else {
    console.log(`\n✅ All discovered audio files had matching .txt transcripts.`);
  }

  console.log("\n✨ Dataset organization completed successfully.\n");
}

run().catch((err) => {
  console.error("Fatal error during dataset organization:", err);
  process.exit(1);
});
