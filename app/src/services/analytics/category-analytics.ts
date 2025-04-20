import type { SectionReadingData } from "@/services/reading/section-reading-service";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import type { FileMetadata } from "@/services/document";

export type CategoryMetrics = {
  wordsRead: number;
  timeSpent: number;
  avgReadingSpeed: number;
  completedSections: number;
  totalSections: number;
  completionPercentage: number;
};

/**
 * 🔍 Reading Insights Dashboard
 *
 * The ultimate reading analytics tool! Provides comprehensive metrics about your reading habits.
 * Shows words read, time spent, reading speed, completion status, and more in one convenient place.
 * Perfect for the data-loving reader who wants to optimize their learning journey! 📊
 */
export const getCategoryMetrics = async (
  readings: SectionReadingData[],
  category?: string
): Promise<CategoryMetrics> => {
  const filteredReadings = category
    ? readings.filter((reading) => reading.category === category)
    : readings;

  const completedSections = new Set(
    filteredReadings
      .filter((reading) => reading.isComplete)
      .map((reading) => reading.sectionId)
  ).size;

  const wordsRead = filteredReadings
    .filter((reading) => reading.isComplete)
    .reduce((total, reading) => total + (reading.wordCount || 0), 0);

  const timeSpent = filteredReadings.reduce(
    (total, reading) => total + reading.timeSpent,
    0
  );

  // Calculate reading speed (words per minute)
  const minutes = timeSpent / (1000 * 60);
  const avgReadingSpeed = minutes > 0 ? Math.round(wordsRead / minutes) : 0;

  // Get total sections for this category/overall
  const uniqueDocPaths = new Set(
    filteredReadings.map((reading) => reading.documentPath)
  );

  let totalSections = 0;
  // This is an approximation - for better accuracy, you'd need to store
  // the total section count per document in your database
  for (const docPath of uniqueDocPaths) {
    totalSections += new Set(
      readings.filter((r) => r.documentPath === docPath).map((r) => r.sectionId)
    ).size;
  }

  const completionPercentage =
    totalSections > 0
      ? Math.round((completedSections / totalSections) * 100)
      : 0;

  return {
    wordsRead,
    timeSpent,
    avgReadingSpeed,
    completedSections,
    totalSections,
    completionPercentage,
  };
};

/**
 * 📝 Word Counter
 *
 * Counts all the words you've read across documents or within a specific category.
 * Great for tracking your reading volume and celebrating those word count milestones!
 */
export const getCategoryWordsRead = (
  readings: SectionReadingData[],
  category?: string
): number => {
  const filteredReadings = category
    ? readings.filter(
        (reading) => reading.category === category && reading.isComplete
      )
    : readings.filter((reading) => reading.isComplete);

  const totalWords = filteredReadings.reduce(
    (total, reading) => total + (reading.wordCount || 0),
    0
  );
  return totalWords;
};

/**
 * ⏱️ Reading Time Tracker
 *
 * Measures how much time you've spent reading overall or in a specific category.
 * Helps you understand your time investment in learning and knowledge acquisition!
 */
export const getCategoryTimeSpent = (
  readings: SectionReadingData[],
  category?: string
): number => {
  const filteredReadings = category
    ? readings.filter((reading) => reading.category === category)
    : readings;

  const totalTime = filteredReadings.reduce(
    (total, reading) => total + reading.timeSpent,
    0
  );

  return totalTime;
};

/**
 * 📝 Category Breakdown
 *
 * Creates a breakdown of categories and their counts.
 * Great for seeing which categories you're most interested in!
 */
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
