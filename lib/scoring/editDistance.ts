/**
 * Normalizes a string by converting to lowercase, stripping punctuation,
 * trimming whitespace, and splitting into an array of words.
 */
export function normalizeToWords(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Calculates word-level Levenshtein edit distance between two strings.
 * Input strings are normalized and split into word arrays before comparison.
 */
export function wordEditDistance(a: string, b: string): number {
  const words1 = normalizeToWords(a);
  const words2 = normalizeToWords(b);

  const m = words1.length;
  const n = words2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (words1[i - 1] === words2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }

  return dp[m][n];
}
