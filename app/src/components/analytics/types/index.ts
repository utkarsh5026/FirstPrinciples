import type { ReadingHistoryItem } from "@/hooks/reading/useReadingHistory";

export type AnalyticsData = {
  weeklyActivity: { day: string; count: number }[];
  categoryBreakdown: { name: string; value: number }[];
  readingByHour: { hour: number; count: number }[];
  readingHeatmap: { date: string; count: number }[];
  recentActivity: ReadingHistoryItem[];
};

export type Stats = {
  totalReads: number;
  totalMinutes: number;
  avgWordsPerRead: number;
  categoriesExplored: Set<string>;
  dailyAvg: number;
  bestDay: { day: string; count: number };
  weeklyData: { day: string; count: number }[];
  monthlyData: { name: string; count: number }[];
};
