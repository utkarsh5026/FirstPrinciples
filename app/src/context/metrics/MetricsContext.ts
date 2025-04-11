import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import { createContext, useContext } from "react";

/**
 * Interface for reading metrics data
 */
export type ReadingMetrics = {
  totalWordsRead: number;
  totalTimeSpent: number; // in milliseconds
  documentsCompleted: number;
  sectionsCompleted: number;
  averageReadingSpeed: number; // words per minute
  currentStreak: number;
  longestStreak: number;
  lastReadAt: number | null;
  currentLevel: number;
};

export type ReadingAnalyticsData = {
  weeklyActivity: { day: string; count: number }[];
  categoryBreakdown: { name: string; value: number }[];
  readingByHour: { hour: number; count: number }[];
  readingHeatmap: { date: string; count: number }[];
  recentActivity: ReadingHistoryItem[];
};

export type ReadingMetricsContextType = {
  metrics: ReadingMetrics;
  isLoading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
  formatReadingTime: (ms: number) => string;
  analyticsData: ReadingAnalyticsData;
  monthlyData: { name: string; count: number }[];
};

// Create the context with an undefined default value
export const ReadingMetricsContext = createContext<
  ReadingMetricsContextType | undefined
>(undefined);

/**
 * useReadingMetrics - Custom hook to use the reading metrics context
 *
 * This hook provides access to reading metrics data and functions.
 * It must be used within a ReadingMetricsProvider.
 */
export const useReadingMetrics = (): ReadingMetricsContextType => {
  const context = useContext(ReadingMetricsContext);

  if (context === undefined) {
    throw new Error(
      "useReadingMetrics must be used within a ReadingMetricsProvider"
    );
  }

  return context;
};
