export type ModuleType = "reading" | "listening" | "writing";

export interface ReadingItem {
  id: string;
  text: string;
}

export interface ListeningItem {
  id: string;
  audio: string;
  transcript: string;
  difficulty?: "low" | "medium";
}

export interface WritingQuestion {
  q: string;
  type: "mcq" | "text";
  options?: string[];
  answer: string;
}

export interface WritingItem {
  id: string;
  audio: string;
  questions: WritingQuestion[];
}

// Client-safe types (answer key / transcripts stripped)
export type WritingQuestionClientSafe = Omit<WritingQuestion, "answer">;

export interface WritingItemClientSafe {
  id: string;
  audio: string;
  questions: WritingQuestionClientSafe[];
}

export interface ListeningItemClientSafe {
  id: string;
  audio: string;
  difficulty?: "low" | "medium";
}

// Discriminant union or item type for client-safe payload
export type RoundItemClientSafe =
  | ReadingItem
  | ListeningItemClientSafe
  | WritingItemClientSafe;

export interface ScoreResult {
  id: string;
  matchPercentage?: number;
  points?: number;
  correct?: boolean;
  userResponse?: string;
  originalText?: string;
  mode?: "speak" | "type";
}

export interface AttemptResult {
  module: ModuleType;
  totalScore: number;
  maxScore: number;
  percentage: number;
  scoreBand: string;
  timeTakenSec: number;
  items: ScoreResult[];
}
