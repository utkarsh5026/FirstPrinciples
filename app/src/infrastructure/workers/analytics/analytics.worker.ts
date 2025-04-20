import * as Comlink from "comlink";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import type { CategoryBreakdown } from "@/stores/categoryStore";
import { createCategoryBreakdown } from "@/services/history";
import { createCategoryMap } from "@/services/history/analytics";
import type { FileMetadata } from "@/services/document";
import {
  calculateTotalWeeklyActivity,
  calculateTotalReadingByHour,
  calculateTotalDailyActivity,
} from "@/services/analytics/activity-analyzer";
import { calculateStreak } from "@/services/analytics/streak-calculator";

class AnalyticsWorker {
  /**
   * Calculate reading streak metrics
   */
  calculateStreak(readingHistory: ReadingHistoryItem[]): {
    longestStreak: number;
    currentStreak: number;
  } {
    return calculateStreak(readingHistory);
  }

  /**
   * Calculate category breakdown statistics
   */
  calculateCategoryBreakdown(
    readingHistory: ReadingHistoryItem[],
    availableDocuments: FileMetadata[]
  ): CategoryBreakdown[] {
    return createCategoryBreakdown(readingHistory, availableDocuments);
  }

  /**
   * Calculate weekly reading activity pattern
   */
  calculateWeeklyActivity(
    readingHistory: ReadingHistoryItem[]
  ): Array<{ day: string; count: number }> {
    return calculateTotalWeeklyActivity(readingHistory);
  }

  /**
   * Calculate hourly reading activity pattern
   */
  calculateReadingByHour(
    readingHistory: ReadingHistoryItem[]
  ): Array<{ hour: number; count: number }> {
    return calculateTotalReadingByHour(readingHistory);
  }

  /**
   * Calculate daily reading activity pattern
   */
  calculateDailyActivity(
    readingHistory: ReadingHistoryItem[]
  ): Array<{ day: number; count: number }> {
    return calculateTotalDailyActivity(readingHistory);
  }

  /**
   * Calculate all activity metrics in a single operation for efficiency
   */
  calculateAllActivityMetrics(readingHistory: ReadingHistoryItem[]): {
    weeklyActivity: Array<{ day: string; count: number }>;
    readingByHour: Array<{ hour: number; count: number }>;
    dailyActivity: Array<{ day: number; count: number }>;
  } {
    const weeklyActivity = this.calculateWeeklyActivity(readingHistory);
    const readingByHour = this.calculateReadingByHour(readingHistory);
    const dailyActivity = this.calculateDailyActivity(readingHistory);

    return {
      weeklyActivity,
      readingByHour,
      dailyActivity,
    };
  }

  /**
   * Create a category map
   */
  createCategoryMap(
    readingHistory: ReadingHistoryItem[]
  ): Record<string, ReadingHistoryItem[]> {
    return createCategoryMap(readingHistory);
  }
}

Comlink.expose(new AnalyticsWorker());

export {};
