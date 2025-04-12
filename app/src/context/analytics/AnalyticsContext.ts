import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import { createContext, useContext } from "react";

export type ReadingAnalyticsData = {
  weeklyActivity: { day: string; count: number }[];
  categoryBreakdown: { name: string; value: number }[];
  readingByHour: { hour: number; count: number }[];
  readingHeatmap: { date: string; count: number }[];
  recentActivity: ReadingHistoryItem[];
};

export type CategoryBreakdown = {
  category: string;
  count: number;
  percentage: number;
  categoryCount: number;
};

export type AnalyticsContextType = {
  createCatgegoryBreakDown: (
    readingHistory: ReadingHistoryItem[]
  ) => CategoryBreakdown[];
  totalCategoryBreakdown: CategoryBreakdown[];
};

// Create the context with an undefined default value
export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

/**
 * useReadingMetrics - Custom hook to use the reading metrics context
 *
 * This hook provides access to reading metrics data and functions.
 * It must be used within a ReadingMetricsProvider.
 */
export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);

  if (context === undefined) {
    throw new Error("useAnalytics must be used within a AnalyticsProvider");
  }

  return context;
};
