// Mock death count generator for the Grim Market game

const BASE_DEATH_COUNT = 170000; // Base daily death count
const VARIANCE = 1000; // Small variance for day-to-day differences
const DEATHS_PER_SECOND = BASE_DEATH_COUNT / 86400; // ~0.2 deaths per second

/**
 * Generate a deterministic UUID from a date string
 * This ensures the same date always produces the same UUID
 */
export function dateToUUID(date: string): string {
  // Create a deterministic hash from the date
  let hash = 0;
  const str = `grim-market-${date}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Convert to hex and pad to create UUID format
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 31).toString(16).padStart(8, '0');
  const hex3 = Math.abs(hash * 37).toString(16).padStart(8, '0');
  const hex4 = Math.abs(hash * 41).toString(16).padStart(8, '0');

  // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return `${hex.slice(0, 8)}-${hex2.slice(0, 4)}-4${hex2.slice(5, 8)}-a${hex3.slice(1, 4)}-${hex4.slice(0, 8)}${hex.slice(0, 4)}`;
}

// Specific death counts for known dates (for consistent demo values)
const FIXED_DEATH_COUNTS: Record<string, number> = {
  "2026-01-18": 170000, // Today
  "2026-01-17": 170100, // Yesterday
};

/**
 * Generate a final death count for a given date (end of day total)
 * Uses the date as a seed for deterministic results
 */
export function generateDeathCount(date: string): number {
  // Return fixed value if available
  if (FIXED_DEATH_COUNTS[date]) {
    return FIXED_DEATH_COUNTS[date];
  }

  // Use date string as a seed for consistent results
  const seed = hashCode(date);
  const random = seededRandom(seed);

  // Generate a value with some variance from the base
  const variance = Math.floor((random - 0.5) * 2 * VARIANCE);
  return BASE_DEATH_COUNT + variance;
}

/**
 * Calculate the current death count based on time of day
 * Returns the interpolated count between 0 and the day's final total
 */
export function getCurrentDeathCount(date: string): number {
  const finalCount = generateDeathCount(date);
  const now = new Date();
  const todayStr = formatDate(now);

  // If it's a past date, return the final count
  if (date < todayStr) {
    return finalCount;
  }

  // If it's a future date, return 0
  if (date > todayStr) {
    return 0;
  }

  // For today, calculate based on time elapsed
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const secondsElapsed = Math.floor((now.getTime() - startOfDay.getTime()) / 1000);

  // Calculate current count based on elapsed time
  const currentCount = Math.floor((secondsElapsed / 86400) * finalCount);
  return Math.min(currentCount, finalCount);
}

/**
 * Get deaths per second rate for display purposes
 */
export function getDeathsPerSecond(): number {
  return DEATHS_PER_SECOND;
}

/**
 * Simple hash function for strings
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator (0-1)
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return formatDate(new Date());
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse a date string to a human-readable format
 */
export function formatDateReadable(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDate();
}

/**
 * Check if a date string is yesterday
 */
export function isYesterday(dateStr: string): boolean {
  return dateStr === getYesterdayDate();
}

/**
 * Check if a date string is tomorrow
 */
export function isTomorrow(dateStr: string): boolean {
  return dateStr === getTomorrowDate();
}
