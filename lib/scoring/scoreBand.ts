export type ScoreBand = "Excellent" | "Good" | "Fair" | "Needs Improvement";

/**
 * Maps percentage score (0-100) to standard score band
 * 90-100% -> "Excellent"
 * 75-89%  -> "Good"
 * 50-74%  -> "Fair"
 * below 50% -> "Needs Improvement"
 */
export function getScoreBand(percentage: number): ScoreBand {
  if (percentage >= 90) {
    return "Excellent";
  }
  if (percentage >= 75) {
    return "Good";
  }
  if (percentage >= 50) {
    return "Fair";
  }
  return "Needs Improvement";
}
