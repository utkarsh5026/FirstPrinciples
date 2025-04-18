import {
  BaseWorkerManager,
  type WorkerManagerConfig,
} from "@/workers/base/BaseWorkerManager";
import type { ReadingHistoryItem } from "@/services/history/ReadingHistoryService";
import type { CategoryBreakdown } from "@/stores/categoryStore";
import type { FileMetadata } from "@/utils/MarkdownLoader";
import type {
  DailyActivity,
  WeeklyActivity,
  HourlyActivity,
} from "@/services/history/activity";

export interface AnalyticsWorkerAPI {
  // Streak calculations (from historyStore)
  calculateStreak(readingHistory: ReadingHistoryItem[]): Promise<{
    longestStreak: number;
    currentStreak: number;
  }>;

  // Category analytics (from categoryStore)
  calculateCategoryBreakdown(
    readingHistory: ReadingHistoryItem[],
    availableDocuments: FileMetadata[]
  ): Promise<CategoryBreakdown[]>;

  // Activity metrics (from activityStore)
  calculateWeeklyActivity(
    readingHistory: ReadingHistoryItem[]
  ): Promise<WeeklyActivity[]>;

  calculateReadingByHour(
    readingHistory: ReadingHistoryItem[]
  ): Promise<HourlyActivity[]>;

  calculateDailyActivity(
    readingHistory: ReadingHistoryItem[]
  ): Promise<DailyActivity[]>;

  // Combined activity metrics for efficiency
  calculateAllActivityMetrics(readingHistory: ReadingHistoryItem[]): Promise<{
    weeklyActivity: WeeklyActivity[];
    readingByHour: HourlyActivity[];
    dailyActivity: DailyActivity[];
  }>;
}

/**
 * Analytics Worker Manager
 *
 * Manages background processing of reading analytics data including:
 * - Reading streak calculations
 * - Category breakdowns
 * - Activity patterns (daily, weekly, hourly)
 */
export class AnalyticsWorkerManager extends BaseWorkerManager<AnalyticsWorkerAPI> {
  constructor(config: WorkerManagerConfig = {}) {
    super(config);
  }

  protected createWorker(): Worker {
    return new Worker(new URL("./analytics.worker.ts", import.meta.url), {
      type: "module",
    });
  }

  // Streak calculation
  public async calculateStreak(readingHistory: ReadingHistoryItem[]): Promise<{
    longestStreak: number;
    currentStreak: number;
  }> {
    return this.executeTask((proxy) => proxy.calculateStreak(readingHistory));
  }

  // Category breakdown
  public async calculateCategoryBreakdown(
    readingHistory: ReadingHistoryItem[],
    availableDocuments: FileMetadata[]
  ): Promise<CategoryBreakdown[]> {
    return this.executeTask((proxy) =>
      proxy.calculateCategoryBreakdown(readingHistory, availableDocuments)
    );
  }

  // Activity metrics
  public async calculateWeeklyActivity(
    readingHistory: ReadingHistoryItem[]
  ): Promise<WeeklyActivity[]> {
    return this.executeTask((proxy) =>
      proxy.calculateWeeklyActivity(readingHistory)
    );
  }

  public async calculateReadingByHour(
    readingHistory: ReadingHistoryItem[]
  ): Promise<Array<{ hour: number; count: number }>> {
    return this.executeTask((proxy) =>
      proxy.calculateReadingByHour(readingHistory)
    );
  }

  public async calculateDailyActivity(
    readingHistory: ReadingHistoryItem[]
  ): Promise<Array<{ day: number; count: number }>> {
    return this.executeTask((proxy) =>
      proxy.calculateDailyActivity(readingHistory)
    );
  }

  // Combined method for efficiency
  public async calculateAllActivityMetrics(
    readingHistory: ReadingHistoryItem[]
  ): Promise<{
    weeklyActivity: Array<{ day: string; count: number }>;
    readingByHour: Array<{ hour: number; count: number }>;
    dailyActivity: Array<{ day: number; count: number }>;
  }> {
    return this.executeTask((proxy) =>
      proxy.calculateAllActivityMetrics(readingHistory)
    );
  }
}

// Export singleton instance
export const analyticsWorkerManager = new AnalyticsWorkerManager();
