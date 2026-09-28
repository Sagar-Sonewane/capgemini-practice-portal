import { shuffle } from "./shuffle";

export interface ItemWithId {
  id: string;
}

export interface RoundSelectionResult<T> {
  selected: T[];
  updatedRecentIds: string[];
}

const MAX_RECENT_HISTORY = 30;

/**
 * Selects `count` items from `pool`, excluding items with IDs in `recentIds`.
 * If fewer than `count` items remain after filtering, resets and selects from the full pool.
 * Returns the selected items and the updated list of recent IDs (capped to the latest 30).
 */
export function getRound<T extends ItemWithId>(
  pool: T[],
  count: number = 10,
  recentIds: string[] = []
): RoundSelectionResult<T> {
  if (!pool || pool.length === 0) {
    return { selected: [], updatedRecentIds: [] };
  }

  const effectiveCount = Math.min(count, pool.length);
  const recentSet = new Set(recentIds);

  let available = pool.filter((item) => !recentSet.has(item.id));
  let baseRecentIds = recentIds;

  // If remaining pool has fewer items than requested count, reset pool and history
  if (available.length < effectiveCount) {
    available = [...pool];
    baseRecentIds = [];
  }

  const shuffled = shuffle(available);
  const selected = shuffled.slice(0, effectiveCount);
  const newSelectedIds = selected.map((item) => item.id);

  // Append new IDs and keep only the latest 30
  const updatedRecentIds = [...baseRecentIds, ...newSelectedIds].slice(-MAX_RECENT_HISTORY);

  return {
    selected,
    updatedRecentIds,
  };
}

/**
 * Client-side helper: reads recent IDs for a given module from localStorage
 */
export function getRecentIdsFromStorage(moduleName: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`recent_${moduleName}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Client-side helper: writes recent IDs for a given module to localStorage
 */
export function saveRecentIdsToStorage(moduleName: string, recentIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `recent_${moduleName}`,
      JSON.stringify(recentIds.slice(-MAX_RECENT_HISTORY))
    );
  } catch {
    // Graceful handling of private mode or storage quota errors
  }
}

/**
 * Client-side helper: clears recent IDs for a given module from localStorage
 */
export function clearRecentIdsFromStorage(moduleName: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`recent_${moduleName}`);
  } catch {
    // Graceful handling
  }
}
