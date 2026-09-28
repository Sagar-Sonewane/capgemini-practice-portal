/**
 * Fisher-Yates (Knuth) unbiased array shuffle algorithm.
 * Returns a new shuffled array without mutating the original input.
 */
export function shuffle<T>(arr: T[]): T[] {
  if (!arr || arr.length <= 1) {
    return arr ? [...arr] : [];
  }

  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result;
}
