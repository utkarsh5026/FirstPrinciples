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
  lastReadAt: number | null;
};

export type ReadingMetricsContextType = {
  metrics: ReadingMetrics;
  isLoading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
  formatReadingTime: (ms: number) => string;
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
