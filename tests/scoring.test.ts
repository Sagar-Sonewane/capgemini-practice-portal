import test from "node:test";
import assert from "node:assert/strict";
import { wordEditDistance, normalizeToWords } from "../lib/scoring/editDistance";
import { getMatchPercentage, getScoringDetails } from "../lib/scoring/matchPercentage";
import { getScoreBand } from "../lib/scoring/scoreBand";

test("wordEditDistance - Normalization & Tokenization", () => {
  const words = normalizeToWords("  Hello, World! This is a TEST...  ");
  assert.deepEqual(words, ["hello", "world", "this", "is", "a", "test"]);
});

test("wordEditDistance - Exact matches", () => {
  const s1 = "The quick brown fox jumps over the lazy dog";
  const s2 = "The quick brown fox jumps over the lazy dog.";
  assert.equal(wordEditDistance(s1, s2), 0);
});

test("wordEditDistance - Single word substitution", () => {
  const s1 = "The quick brown fox jumps over the lazy dog";
  const s2 = "The quick blue fox jumps over the lazy dog";
  assert.equal(wordEditDistance(s1, s2), 1);
});

test("wordEditDistance - Deletions and Insertions", () => {
  const s1 = "The brown fox";
  const s2 = "The quick brown fox";
  assert.equal(wordEditDistance(s1, s2), 1);
});

test("getMatchPercentage - Identical sentences score 100%", () => {
  const original = "Artificial intelligence algorithms are becoming increasingly integral to modern financial forecasting models.";
  const transcribed = "Artificial intelligence algorithms are becoming increasingly integral to modern financial forecasting models.";
  const score = getMatchPercentage(transcribed, original);
  assert.equal(score, 100);
});

test("getMatchPercentage - Identical sentences with different case and punctuation score 100%", () => {
  const original = "Effective communication between multidisciplinary teams, often determines success!";
  const transcribed = "effective communication between multidisciplinary teams often determines success";
  const score = getMatchPercentage(transcribed, original);
  assert.equal(score, 100);
});

test("getMatchPercentage - Sentence with 1 wrong word out of 10 words scores high but < 100%", () => {
  const original = "The implementation of distributed computing architectures requires a comprehensive understanding of network latency"; // 13 words
  const transcribed = "The implementation of distributed computing systems requires a comprehensive understanding of network latency"; // 'systems' instead of 'architectures' (1 edit / 13 max words = ~92.3% similarity * 100% completeness)
  const score = getMatchPercentage(transcribed, original);
  assert.ok(score > 90 && score < 100, `Expected score between 90 and 100, got ${score}`);
});

test("getMatchPercentage - Sentence missing half its words scores noticeably lower due to completeness factor", () => {
  // 10 words original:
  const original = "one two three four five six seven eight nine ten";
  // User only spoke first 5 words:
  const transcribed = "one two three four five";
  // Word edit distance = 5 deletions
  // Similarity = 1 - (5 / 10) = 0.5 (50%)
  // Completeness = 5 / 10 = 0.5 (50%)
  // matchPercentage = 0.5 * 0.5 = 0.25 (25%)
  const score = getMatchPercentage(transcribed, original);
  assert.equal(score, 25);
  // Notice that without completeness factor, a pure diff would be 50%, but with completeness it is 25%
});

test("getMatchPercentage - Empty inputs handle gracefully", () => {
  assert.equal(getMatchPercentage("", "Some original sentence"), 0);
  assert.equal(getMatchPercentage("Some transcribed sentence", ""), 0);
  assert.equal(getMatchPercentage("", ""), 0);
});

test("getScoringDetails - Computes 2 points max correctly", () => {
  const original = "The quick brown fox jumps over the lazy dog";
  const transcribed = "The quick brown fox jumps over the lazy dog";
  const details = getScoringDetails(transcribed, original);
  assert.equal(details.matchPercentage, 100);
  assert.equal(details.points, 2);
  assert.equal(details.similarity, 1);
  assert.equal(details.completeness, 1);
});

test("getScoreBand - Correctly maps percentages to bands", () => {
  assert.equal(getScoreBand(100), "Excellent");
  assert.equal(getScoreBand(90), "Excellent");
  assert.equal(getScoreBand(89.9), "Good");
  assert.equal(getScoreBand(75), "Good");
  assert.equal(getScoreBand(74.9), "Fair");
  assert.equal(getScoreBand(50), "Fair");
  assert.equal(getScoreBand(49.9), "Needs Improvement");
  assert.equal(getScoreBand(0), "Needs Improvement");
});
