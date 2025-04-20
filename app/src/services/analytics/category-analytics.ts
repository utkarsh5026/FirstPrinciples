import type { SectionReadingData } from "@/services/section/SectionReadingService";

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
