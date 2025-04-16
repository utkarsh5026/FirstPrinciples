import { sectionReadingService } from "@/services/section/SectionReadingService";
import { parseError } from "@/utils/error";
import { create } from "zustand";
import { LoadingWithError } from "../base/base";

/**
 * 📚 Reading Metrics Store
 *
 * A powerful store that tracks and calculates various reading metrics
 * to help users understand their reading habits and progress.
 *
 * This store provides insights like words read, time spent reading,
 * reading speed, and completion percentages - all to motivate
 * and encourage consistent reading habits! 📈
 */
type Actions = {
  getCategoryWordsRead: (category?: string) => Promise<number>;
  getCategoryTimeSpent: (category?: string) => Promise<number>;
  getCategoryMetrics: (category?: string) => Promise<{
    wordsRead: number;
    timeSpent: number;
    avgReadingSpeed: number;
    completedSections: number;
    totalSections: number;
    completionPercentage: number;
  }>;
};

type ReadingMetricsStore = LoadingWithError & Actions;

/**
 * 🧠 Reading Metrics Store
 *
 * Tracks all your reading achievements and progress in one place!
 * Perfect for understanding your reading habits and celebrating milestones.
 */
const useReadingMetricsStore = create<ReadingMetricsStore>((set) => ({
  documentMetrics: null,
  loading: false,
  error: null,

  /**
   * 📝 Word Counter
   *
   * Counts all the words you've read across documents or within a specific category.
   * Great for tracking your reading volume and celebrating those word count milestones!
   */
  getCategoryWordsRead: async (category?: string): Promise<number> => {
    try {
      const allReadings = await sectionReadingService.getAllReadings();

      // Filter readings by category if provided
      const filteredReadings = category
        ? allReadings.filter(
            (reading) => reading.category === category && reading.isComplete
          )
        : allReadings.filter((reading) => reading.isComplete);

      // Sum up word counts
      const totalWords = filteredReadings.reduce(
        (total, reading) => total + (reading.wordCount || 0),
        0
      );

      return totalWords;
    } catch (error) {
      console.error(
        `Error calculating words read for category ${category}:`,
        error
      );
      set({
        error: parseError(
          error,
          `Failed to calculate words read for category ${category}`
        ),
      });
      return 0;
    }
  },

  /**
   * ⏱️ Reading Time Tracker
   *
   * Measures how much time you've spent reading overall or in a specific category.
   * Helps you understand your time investment in learning and knowledge acquisition!
   */
  getCategoryTimeSpent: async (category?: string): Promise<number> => {
    try {
      const allReadings = await sectionReadingService.getAllReadings();

      // Filter readings by category if provided
      const filteredReadings = category
        ? allReadings.filter((reading) => reading.category === category)
        : allReadings;

      // Sum up time spent
      const totalTime = filteredReadings.reduce(
        (total, reading) => total + reading.timeSpent,
        0
      );

      return totalTime;
    } catch (error) {
      console.error(
        `Error calculating time spent for category ${category}:`,
        error
      );
      set({
        error: parseError(
          error,
          `Failed to calculate time spent${category ? ` for ${category}` : ""}`
        ),
      });
      return 0;
    }
  },

  /**
   * 🔍 Reading Insights Dashboard
   *
   * The ultimate reading analytics tool! Provides comprehensive metrics about your reading habits.
   * Shows words read, time spent, reading speed, completion status, and more in one convenient place.
   * Perfect for the data-loving reader who wants to optimize their learning journey! 📊
   */
  getCategoryMetrics: async (
    category?: string
  ): Promise<{
    wordsRead: number;
    timeSpent: number;
    avgReadingSpeed: number;
    completedSections: number;
    totalSections: number;
    completionPercentage: number;
  }> => {
    try {
      const allReadings = await sectionReadingService.getAllReadings();

      // Filter readings by category if provided
      const filteredReadings = category
        ? allReadings.filter((reading) => reading.category === category)
        : allReadings;

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
          allReadings
            .filter((r) => r.documentPath === docPath)
            .map((r) => r.sectionId)
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
    } catch (error) {
      console.error(
        `Error calculating metrics for category ${category}:`,
        error
      );
      set({
        error: parseError(
          error,
          `Failed to calculate metrics for category ${category}`
        ),
      });
      return {
        wordsRead: 0,
        timeSpent: 0,
        avgReadingSpeed: 0,
        completedSections: 0,
        totalSections: 0,
        completionPercentage: 0,
      };
    }
  },
}));

export default useReadingMetricsStore;
