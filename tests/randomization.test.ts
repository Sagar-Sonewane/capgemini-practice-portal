import test from "node:test";
import assert from "node:assert/strict";
import { shuffle } from "../lib/randomization/shuffle";
import { getRound } from "../lib/randomization/getRound";

test("shuffle - Handles edge cases (empty and single item)", () => {
  assert.deepEqual(shuffle([]), []);
  assert.deepEqual(shuffle([42]), [42]);
});

test("shuffle - Preserves all items and length", () => {
  const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const shuffled = shuffle(original);

  assert.equal(shuffled.length, original.length);
  assert.deepEqual([...shuffled].sort((a, b) => a - b), original);
});

test("getRound - Returns requested count and does not repeat recent items", () => {
  const pool = Array.from({ length: 50 }, (_, i) => ({
    id: `item-${i + 1}`,
    value: `Question ${i + 1}`,
  }));

  const recentIds = ["item-1", "item-2", "item-3", "item-4", "item-5"];
  const result = getRound(pool, 10, recentIds);

  assert.equal(result.selected.length, 10);

  // None of the selected items should be in recentIds
  for (const item of result.selected) {
    assert.ok(!recentIds.includes(item.id), `Expected ${item.id} not to be in recentIds`);
  }

  // Updated recent IDs should contain old + new
  assert.equal(result.updatedRecentIds.length, 15);
  for (const item of result.selected) {
    assert.ok(result.updatedRecentIds.includes(item.id));
  }
});

test("getRound - Resets pool when available items are fewer than requested count", () => {
  const pool = [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
  ];

  // 4 items recently seen, requesting 3 items -> only 1 available, so it resets
  const recentIds = ["1", "2", "3", "4"];
  const result = getRound(pool, 3, recentIds);

  assert.equal(result.selected.length, 3);
  // After reset, updated recent IDs should only contain newly selected items (length 3)
  assert.equal(result.updatedRecentIds.length, 3);
});

test("getRound - Caps recent history to 30 items", () => {
  const pool = Array.from({ length: 60 }, (_, i) => ({ id: `id-${i + 1}` }));

  // 25 existing recent items
  const recentIds = Array.from({ length: 25 }, (_, i) => `id-${i + 1}`);

  // Draw 10 items
  const result = getRound(pool, 10, recentIds);

  assert.equal(result.selected.length, 10);
  // 25 + 10 = 35 -> capped to 30
  assert.equal(result.updatedRecentIds.length, 30);
});

test("getRound - Handles pool smaller than count", () => {
  const smallPool = [{ id: "a" }, { id: "b" }];
  const result = getRound(smallPool, 5, []);
  assert.equal(result.selected.length, 2);
});
