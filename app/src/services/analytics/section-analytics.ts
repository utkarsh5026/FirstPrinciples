import type { SectionReadingData } from "@/services/section/SectionReadingService";

export type CategoryStats = {
  totalTimeSpent: number;
  totalWordsRead: number;
  documentCount: number;
  lastReadAt: number;
};

export const getTimeSpentOnDay = (
  date: Date,
  readings: SectionReadingData[]
) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return readings
    .filter((reading) => {
      const readDate = new Date(reading.lastReadAt);
      return readDate >= startOfDay && readDate <= endOfDay;
    })
    .reduce((total, reading) => total + reading.timeSpent, 0);
};

/**
 * Calculate total words read across all documents
 */
export const getTotalWordsRead = (
  readings: SectionReadingData[],
  wordCountMap?: Record<string, number>
) => {
  const readSectionIds = new Set<string>();
  readings
    .filter((reading) => reading.isComplete)
    .forEach((reading) => readSectionIds.add(reading.sectionId));

  let totalWords = 0;

  if (!wordCountMap) {
    const completedReadings = readings.filter((r) => r.isComplete);
    completedReadings.forEach((reading) => {
      totalWords += reading.wordCount || 0;
    });
    return totalWords;
  }

  readSectionIds.forEach((sectionId) => {
    if (wordCountMap[sectionId]) {
      totalWords += wordCountMap[sectionId];
      return;
    }

    const sectionReadings = readings.filter(
      (r) => r.sectionId === sectionId && r.isComplete
    );
    if (sectionReadings.length > 0) {
      totalWords += sectionReadings[0].wordCount || 0;
    }
  });

  return totalWords;
};

/**
 * Calculate reading speed (words per minute)
 */
export const getReadingSpeed = (readings: SectionReadingData[]) => {
  let totalWords = 0;
  let totalTime = 0;

  readings
    .filter((reading) => reading.isComplete && reading.wordCount)
    .forEach((reading) => {
      totalWords += reading.wordCount || 0;
      totalTime += reading.timeSpent;
    });

  const minutes = totalTime / (1000 * 60);
  return minutes > 0 ? Math.round(totalWords / minutes) : 0;
};

export const getDailyReadingStats = (
  readings: SectionReadingData[],
  days = 7
) => {
  const getDateRange = (daysCount: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (daysCount - 1));
    return { startDate: start, endDate: end };
  };

  const initializeDailyStats = (startDate: Date, daysCount: number) => {
    const stats: Record<string, { timeSpent: number; wordsRead: number }> = {};

    for (let i = 0; i < daysCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split("T")[0];
      stats[dateKey] = { timeSpent: 0, wordsRead: 0 };
    }

    return stats;
  };

  const populateDailyStats = (
    stats: Record<string, { timeSpent: number; wordsRead: number }>,
    readingData: SectionReadingData[],
    startDate: Date,
    endDate: Date
  ) => {
    readingData.forEach((reading) => {
      const readDate = new Date(reading.lastReadAt);
      if (readDate < startDate || readDate > endDate) {
        return;
      }

      const dateKey = readDate.toISOString().split("T")[0];

      if (!stats[dateKey]) {
        stats[dateKey] = { timeSpent: 0, wordsRead: 0 };
      }
      stats[dateKey].timeSpent += reading.timeSpent;

      if (reading.isComplete) {
        stats[dateKey].wordsRead += reading.wordCount || 0;
      }
    });

    return stats;
  };

  const formatDailyStats = (
    stats: Record<string, { timeSpent: number; wordsRead: number }>
  ) => {
    return Object.entries(stats)
      .map(([date, stats]) => ({
        date,
        timeSpent: stats.timeSpent,
        wordsRead: stats.wordsRead,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const { startDate, endDate } = getDateRange(days);
  const dailyStats = initializeDailyStats(startDate, days);
  const populatedStats = populateDailyStats(
    dailyStats,
    readings,
    startDate,
    endDate
  );
  return formatDailyStats(populatedStats);
};

export const getCategoryStats = (readings: SectionReadingData[]) => {
  const initializeCategoryStats = (): CategoryStats => {
    return {
      totalTimeSpent: 0,
      totalWordsRead: 0,
      documentCount: 0,
      lastReadAt: 0,
    };
  };

  const updateCategoryStats = (
    stats: CategoryStats,
    reading: SectionReadingData
  ) => {
    const { timeSpent, wordCount, isComplete, lastReadAt } = reading;

    stats.totalTimeSpent += timeSpent;
    stats.lastReadAt = Math.max(stats.lastReadAt, lastReadAt);

    if (isComplete) {
      stats.totalWordsRead += wordCount || 0;
    }

    return stats;
  };

  const countUniqueDocuments = (
    readings: SectionReadingData[],
    category: string
  ) => {
    const docSet = new Set<string>();
    readings
      .filter((r) => r.category === category)
      .forEach((r) => docSet.add(r.documentPath));

    return docSet.size;
  };

  const categoryMap: Record<string, CategoryStats> = {};

  readings.forEach((reading) => {
    const { category } = reading;
    if (!category) return;

    if (!categoryMap[category]) {
      categoryMap[category] = initializeCategoryStats();
    }

    updateCategoryStats(categoryMap[category], reading);
  });

  Object.keys(categoryMap).forEach((category) => {
    categoryMap[category].documentCount = countUniqueDocuments(
      readings,
      category
    );
  });

  return categoryMap;
};

/**
 * Get total time spent on a document
 */
export const getTotalTimeSpent = (readings: SectionReadingData[]): number => {
  return readings.reduce((total, reading) => total + reading.timeSpent, 0);
};
