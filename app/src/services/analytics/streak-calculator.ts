import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";

export type Streak = {
  currentStreak: number;
  longestStreak: number;
};

/**
 * 📅 Calculate streak
 * Get the current and longest streak of reading days
 */
const calculateStreak = (readingHistory: ReadingHistoryItem[]): Streak => {
  const readingDays = getUniqueReadingDays(readingHistory);

  if (readingDays.length === 0)
    return {
      currentStreak: 0,
      longestStreak: 0,
    };

  const sortedDays = [...readingDays].sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const currentStreak = calculateCurrentStreak(sortedDays);
  const longestStreak = calculateLongestStreak(sortedDays);

  return { currentStreak, longestStreak };
};

/**
 * 📅 Create a date key
 * Get the date in a format that can be used to calculate streaks
 */
const createDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

/**
 * 📅 Get unique reading days
 * Get the unique reading days from the reading history
 */
const getUniqueReadingDays = (history: ReadingHistoryItem[]): string[] => {
  const readingDays = new Set<string>();
  history.forEach((item) => {
    if (item.lastReadAt) {
      const date = new Date(item.lastReadAt);
      const dateKey = createDateKey(date);
      readingDays.add(dateKey);
    }
  });
  return Array.from(readingDays).sort((a, b) => a.localeCompare(b));
};

/**
 * 📅 Calculate current streak
 * Get the current streak of reading days
 */
const calculateCurrentStreak = (readingDays: string[]): number => {
  const today = new Date();
  const todayString = createDateKey(today);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = createDateKey(yesterday);

  const hasToday = readingDays.includes(todayString);
  const hasYesterday = readingDays.includes(yesterdayString);

  let currentStreak = 0;

  if (hasToday || hasYesterday) {
    currentStreak = 1;

    const startDate = hasToday ? yesterday : new Date(yesterday);
    startDate.setDate(startDate.getDate() - 1);

    const checkDate = startDate;

    while (true) {
      const checkDateKey = createDateKey(checkDate);
      if (!readingDays.includes(checkDateKey)) break;

      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  return currentStreak;
};

/**
 * 📅 Calculate longest streak
 * Get the longest streak of reading days
 */
const calculateLongestStreak = (readingDays: string[]): number => {
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < readingDays.length; i++) {
    const current = new Date(readingDays[i]);
    const prev = new Date(readingDays[i - 1]);

    const diffTime = current.getTime() - prev.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return longestStreak;
};

export { calculateStreak, calculateCurrentStreak, calculateLongestStreak };
