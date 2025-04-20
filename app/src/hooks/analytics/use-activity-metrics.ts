import { analyticsWorkerManager } from "@/infrastructure/workers";
import type {
  DailyActivity,
  WeeklyActivity,
  HourlyActivity,
} from "@/services/analytics/activity-analyzer";
import {
  getDailyActivityMetrics as getDailyActivityMetricsService,
  getWeeklyActivityMetrics as getWeeklyActivityMetricsService,
  getReadingByHourMetrics as getReadingByHourMetricsService,
} from "@/services/analytics/activity-analyzer";

import type { ReadingHistoryItem } from "@/services/history";
import { withErrorHandling } from "@/utils/functions/error";
import { useCallback } from "react";

/**
 * 📊 Activity Metrics Hook
 *
 * This hook provides comprehensive analytics about your reading habits,
 * including daily, weekly, and hourly activity patterns.
 *
 **/
export const useActivityMetrics = () => {
  /**
   * ⏰ Analyzes what hours of the day you love to read!
   * Shows your reading patterns across a 24-hour cycle.
   */
  const calculateTotalReadingByHour = useCallback(
    (history: ReadingHistoryItem[]) => {
      return withErrorHandling(
        () => analyticsWorkerManager.calculateReadingByHour(history),
        [],
        {
          errorPrefix: "Failed to calculate reading by hour",
          logError: true,
        }
      )();
    },
    []
  );

  /**
   * 🗓️ Discovers which days of the week you read the most!
   * Perfect for seeing if you're a weekend reader or weekday warrior.
   */
  const calculateTotalWeeklyActivity = useCallback(
    (history: ReadingHistoryItem[]) => {
      return withErrorHandling(
        () => analyticsWorkerManager.calculateWeeklyActivity(history),
        [],
        {
          errorPrefix: "Failed to calculate weekly activity",
          logError: true,
        }
      )();
    },
    []
  );

  /**
   * 📆 Tracks your reading throughout the month!
   * See if you prefer reading at the beginning, middle, or end of the month.
   */
  const calculateTotalDailyActivity = useCallback(
    (history: ReadingHistoryItem[]) => {
      return withErrorHandling(
        async () => {
          const dailyActivity =
            await analyticsWorkerManager.calculateDailyActivity(history);
          return dailyActivity;
        },
        [],
        {
          errorPrefix: "Failed to calculate daily activity",
          logError: true,
        }
      )();
    },
    []
  );

  /**
   * 📊 Gets the most and least active days of the week!
   * Perfect for seeing if you're a weekend reader or weekday warrior.
   */
  const getDailyActivityMetrics = useCallback(
    (dailyActivity: DailyActivity[]) => {
      return withErrorHandling(
        async () => getDailyActivityMetricsService(dailyActivity),
        {
          mostActiveDay: {
            day: 0,
            count: 0,
          },
          leastActiveDay: {
            day: 0,
            count: 0,
          },
        },
        {
          errorPrefix: "Failed to get daily activity metrics",
          logError: true,
        }
      )();
    },
    []
  );

  /**
   * 📊 Gets the most and least active days of the week!
   * Perfect for seeing if you're a weekend reader or weekday warrior.
   */
  const getWeeklyActivityMetrics = useCallback(
    (
      weeklyActivity: WeeklyActivity[]
    ): Promise<{
      mostActiveDay: WeeklyActivity;
      leastActiveDay: WeeklyActivity;
    }> => {
      return withErrorHandling(
        async () => getWeeklyActivityMetricsService(weeklyActivity),
        {
          mostActiveDay: {
            day: "Sunday",
            count: 0,
          } as WeeklyActivity,
          leastActiveDay: {
            day: "Sunday",
            count: 0,
          } as WeeklyActivity,
        },
        {
          errorPrefix: "Failed to get weekly activity metrics",
          logError: true,
        }
      )();
    },
    []
  );

  /**
   * 📊 Gets the most and least active hours of the day!
   * Perfect for seeing if you're a morning or night owl.
   */
  const getReadingByHourMetrics = useCallback(
    (readingByHour: HourlyActivity[]) => {
      return withErrorHandling(
        async () => getReadingByHourMetricsService(readingByHour),
        {
          mostActiveHour: {
            hour: 0,
            count: 0,
          },
          leastActiveHour: {
            hour: 0,
            count: 0,
          },
        },
        {
          errorPrefix: "Failed to get reading by hour metrics",
          logError: true,
        }
      )();
    },
    []
  );

  return {
    calculateTotalReadingByHour,
    calculateTotalWeeklyActivity,
    calculateTotalDailyActivity,
    getDailyActivityMetrics,
    getWeeklyActivityMetrics,
    getReadingByHourMetrics,
  };
};
