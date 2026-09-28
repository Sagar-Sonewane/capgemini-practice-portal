import { normalizeToWords, wordEditDistance } from "./editDistance";

/**
 * Calculates the match percentage (0-100) between a transcribed sentence and the original sentence
 * using word-level edit distance and completeness ratio.
 *
 * Formula:
 *   similarity = 1 - (wordEditDistance(transcribed, original) / max(wordCount(transcribed), wordCount(original)))
 *   completeness = min(wordCount(transcribed), wordCount(original)) / wordCount(original)
 *   matchPercentage = similarity * completeness * 100
 */
export function getMatchPercentage(transcribed: string, original: string): number {
  const transWords = normalizeToWords(transcribed);
  const origWords = normalizeToWords(original);

  const origCount = origWords.length;
  const transCount = transWords.length;

  if (origCount === 0) {
    return 0;
  }

  if (transCount === 0) {
    return 0;
  }

  const editDist = wordEditDistance(transcribed, original);
  const maxCount = Math.max(transCount, origCount);

  const similarity = Math.max(0, 1 - editDist / maxCount);
  const completeness = Math.min(transCount, origCount) / origCount;

  const matchRatio = similarity * completeness;
  const matchPercentage = Math.round(matchRatio * 10000) / 100; // Round to 2 decimal places

  return Math.min(100, Math.max(0, matchPercentage));
}

/**
 * Detailed scoring breakdown for Reading and Listening modules (2 points max per sentence)
 */
export function getScoringDetails(transcribed: string, original: string): {
  similarity: number;
  completeness: number;
  matchPercentage: number;
  points: number;
} {
  const matchPercentage = getMatchPercentage(transcribed, original);
  const points = Math.round((2 * (matchPercentage / 100)) * 100) / 100;

  const transWords = normalizeToWords(transcribed);
  const origWords = normalizeToWords(original);
  const origCount = origWords.length;
  const transCount = transWords.length;

  if (origCount === 0 || transCount === 0) {
    return {
      similarity: 0,
      completeness: 0,
      matchPercentage: 0,
      points: 0,
    };
  }

  const editDist = wordEditDistance(transcribed, original);
  const maxCount = Math.max(transCount, origCount);
  const similarity = Math.max(0, 1 - editDist / maxCount);
  const completeness = Math.min(transCount, origCount) / origCount;

  return {
    similarity,
    completeness,
    matchPercentage,
    points,
  };
}
