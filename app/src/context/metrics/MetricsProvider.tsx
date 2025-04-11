import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useServices } from "../services/ServiceContext";
import { ReadingMetricsContext } from "./MetricsContext";
import { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";

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

interface ReadingMetricsProviderProps {
  children: ReactNode;
}

/**
 * ReadingMetricsProvider - Provides reading metrics state and functions to the component tree
 *
 * This provider centralizes all reading metrics calculations and data, making them
 * available to any component in the tree without recalculating.
 */
export const ReadingMetricsProvider: React.FC<ReadingMetricsProviderProps> = ({
  children,
}) => {
  const {
    readingSessionTracker,
    sectionAnalyticsController,
    readingHistoryService,
  } = useServices();

  const [metrics, setMetrics] = useState<ReadingMetrics>({
    totalWordsRead: 0,
    totalTimeSpent: 0,
    documentsCompleted: 0,
    sectionsCompleted: 0,
    averageReadingSpeed: 0,
    currentStreak: 0,
    lastReadAt: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all reading metrics from section analytics
   */
  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get section reading data as the primary source of truth
      const sectionProgress =
        await sectionAnalyticsController.getSectionReadingProgress();
      const documentStats = await sectionAnalyticsController.getDocumentStats();

      // Get session data for time tracking
      const sessions = await readingSessionTracker.getAllSessions();

      // Calculate total time spent (using active time when available)
      const totalTimeSpent = sessions.reduce((total, session) => {
        if (session.activeTime) {
          return total + session.activeTime;
        } else if (session.duration) {
          return total + session.duration;
        }
        return total;
      }, 0);

      // Calculate total words read based on section content
      // This could be enhanced with more accurate word counts per section
      const totalWordsRead = sessions.reduce((total, session) => {
        return total + (session.wordCount || 0);
      }, 0);

      // Get document completion count
      const documentsCompleted = documentStats.filter(
        (doc) => doc.completionPercentage >= 100
      ).length;

      // Calculate average reading speed (words per minute)
      const minutesSpent = totalTimeSpent / (1000 * 60);
      const averageReadingSpeed =
        minutesSpent > 0 ? Math.round(totalWordsRead / minutesSpent) : 0;

      // Get last read timestamp
      const lastReadDocument = documentStats.sort(
        (a, b) => b.lastReadAt - a.lastReadAt
      )[0];

      const lastReadAt = lastReadDocument ? lastReadDocument.lastReadAt : null;

      // Get streak data from reading history service
      // We still use this since it has streak calculation logic
      const history = await readingHistoryService.getAllHistory();
      const readingDays = getUniqueReadingDays(history);
      const { currentStreak } = calculateReadingStreak(readingDays);

      // Update metrics state
      setMetrics({
        totalWordsRead,
        totalTimeSpent,
        documentsCompleted,
        sectionsCompleted: sectionProgress.completedSections,
        averageReadingSpeed,
        currentStreak,
        lastReadAt,
      });

      setError(null);
    } catch (err) {
      console.error("Error loading reading metrics:", err);
      setError("Failed to load reading metrics");
    } finally {
      setIsLoading(false);
    }
  }, [
    sectionAnalyticsController,
    readingSessionTracker,
    readingHistoryService,
  ]);

  // Load metrics on hook mount
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  /**
   * Helper function to get unique reading days from history
   */
  const getUniqueReadingDays = (history: ReadingHistoryItem[]): string[] => {
    const readingDays = new Set<string>();

    history.forEach((item) => {
      if (item.lastReadAt) {
        const date = new Date(item.lastReadAt);
        const dateString = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`;
        readingDays.add(dateString);
      }
    });

    return Array.from(readingDays).sort((a, b) => a.localeCompare(b));
  };

  /**
   * Helper function to calculate reading streak
   */
  const calculateReadingStreak = (
    readingDays: string[]
  ): {
    currentStreak: number;
    longestStreak: number;
  } => {
    if (readingDays.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Sort reading days (oldest first)
    const sortedDays = [...readingDays].sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    // Check if today or yesterday is in the reading days
    const today = new Date();
    const todayString = `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = `${yesterday.getFullYear()}-${
      yesterday.getMonth() + 1
    }-${yesterday.getDate()}`;

    const hasToday = readingDays.includes(todayString);
    const hasYesterday = readingDays.includes(yesterdayString);

    // Calculate current streak
    let currentStreak = 0;

    if (hasToday || hasYesterday) {
      // Start with 1 for today/yesterday
      currentStreak = 1;

      // Start checking from yesterday or day before
      const startDate = hasToday ? yesterday : new Date(yesterday);
      startDate.setDate(startDate.getDate() - 1);

      const checkDate = startDate;

      // Go back day by day until streak breaks
      while (true) {
        const checkDateString = `${checkDate.getFullYear()}-${
          checkDate.getMonth() + 1
        }-${checkDate.getDate()}`;

        if (readingDays.includes(checkDateString)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak (simplified)
    let longestStreak = currentStreak;
    let tempStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const current = new Date(sortedDays[i]);
      const prev = new Date(sortedDays[i - 1]);

      const diffTime = current.getTime() - prev.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    return { currentStreak, longestStreak };
  };

  /**
   * Convert milliseconds to a formatted time string
   */
  const formatReadingTime = useCallback((ms: number): string => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  const data = useMemo(
    () => ({
      metrics,
      isLoading,
      error,
      refreshMetrics: loadMetrics,
      formatReadingTime,
    }),
    [metrics, isLoading, error, loadMetrics, formatReadingTime]
  );

  return (
    <ReadingMetricsContext.Provider value={data}>
      {children}
    </ReadingMetricsContext.Provider>
  );
};
