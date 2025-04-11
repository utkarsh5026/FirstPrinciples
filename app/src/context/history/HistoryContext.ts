import { createContext, useContext } from "react";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";

export type ReadingHistoryContextType = {
  readingHistory: ReadingHistoryItem[];
  isLoading: boolean;
  error: string | null;
  addToReadingHistory: (
    path: string,
    title: string
  ) => Promise<ReadingHistoryItem | null>;
  clearReadingHistory: () => Promise<void>;
  getDocumentHistory: (path: string) => Promise<ReadingHistoryItem | null>;
  getTotalReadingTime: () => number;
  getTotalWordsRead: () => number;
  refreshReadingHistory: () => Promise<void>;
  metrics: {
    totalWordsRead: number;
    totalTimeSpent: number;
    documentsCompleted: number;
    sectionsCompleted: number;
    averageReadingSpeed: number;
    currentStreak: number;
    lastReadAt: number | null;
  };
};

// Create the context with an undefined default value
export const ReadingHistoryContext = createContext<
  ReadingHistoryContextType | undefined
>(undefined);

/**
 * useReadingHistory - Custom hook to use the reading history context
 *
 * This hook provides access to reading history data and functions.
 * It must be used within a ReadingHistoryProvider.
 */
export const useReadingHistory = (): ReadingHistoryContextType => {
  const context = useContext(ReadingHistoryContext);

  if (context === undefined) {
    throw new Error(
      "useReadingHistory must be used within a ReadingHistoryProvider"
    );
  }

  return context;
};
