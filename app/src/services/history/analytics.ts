import type { ReadingHistoryItem } from "./ReadingHistoryService";
import type { FileMetadata } from "@/utils/MarkdownLoader";

export const createCategoryBreakdown = (
  readingHistory: ReadingHistoryItem[],
  availableDocuments: FileMetadata[]
) => {
  const categoryMap: Record<string, number> = {};
  readingHistory.forEach((item) => {
    const category = item.path.split("/")[0] || "uncategorized";
    categoryMap[category] = (categoryMap[category] || 0) + 1;
  });

  const total = Object.values(categoryMap).reduce(
    (sum, count) => sum + count,
    0
  );

  const result = Object.entries(categoryMap);
  return result
    .map(([category, count]) => ({
      category,
      count,
      categoryCount: availableDocuments.filter(
        (doc) => doc.path.split("/")[0] === category
      ).length,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * 🔍 Calculate reading streak
 * Get your reading streak!
 */
export const calculateStreak = (readingHistory: ReadingHistoryItem[]) => {
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
    let longestStreak = currentStreak;
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
 * 🔍 Create a category map
 * Get the category map from the reading history
 */
export const createCategoryMap = (
  readingHistory: ReadingHistoryItem[]
): Record<string, ReadingHistoryItem[]> => {
  const categoryMap: Record<string, ReadingHistoryItem[]> = {};
  readingHistory.forEach((item) => {
    const category = item.path.split("/")[0] || "uncategorized";
    categoryMap[category] = [...(categoryMap[category] || []), item];
  });

  for (const category in categoryMap) {
    const sorted = [...categoryMap[category]];
    sorted.sort((a, b) => b.lastReadAt - a.lastReadAt);
    categoryMap[category] = sorted;
  }

  return categoryMap;
};
