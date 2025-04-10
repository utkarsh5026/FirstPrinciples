import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/context/ServiceContext";
import { useReadingMetrics } from "./useReadingMetrics";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";

/**
 * A focused, modular hook that manages reading history functionality
 * while using the centralized metrics system for statistics
 */
export function useReadingHistory() {
  const { readingHistoryService, sectionAnalyticsController } = useServices();
  const { metrics, refreshMetrics } = useReadingMetrics();

  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load reading history from service
   */
  useEffect(() => {
    const loadReadingHistory = async () => {
      setIsLoading(true);
      try {
        const history = await readingHistoryService.getAllHistory();
        setReadingHistory(history);
        setError(null);
      } catch (err) {
        console.error("Error loading reading history:", err);
        setError("Failed to load reading history");
      } finally {
        setIsLoading(false);
      }
    };

    loadReadingHistory();
  }, [readingHistoryService]);

  /**
   * Add document to reading history
   * This now just records the document was read, without tracking
   * words or time (since that's handled by section analytics)
   */
  const addToReadingHistory = useCallback(
    async (path: string, title: string) => {
      try {
        // We're still recording reading history but not tracking
        // words or time here anymore - that comes from section analytics
        const updatedItem = await readingHistoryService.addToReadingHistory(
          path,
          title
        );

        // Refresh the history and metrics
        const history = await readingHistoryService.getAllHistory();
        setReadingHistory(history);

        // Refresh metrics to include this latest reading
        refreshMetrics();

        return updatedItem;
      } catch (err) {
        console.error("Error adding to reading history:", err);
        setError("Failed to add to reading history");
        return null;
      }
    },
    [readingHistoryService, refreshMetrics]
  );

  /**
   * Clear reading history
   */
  const clearReadingHistory = useCallback(async () => {
    if (confirm("Are you sure you want to clear your reading history?")) {
      try {
        await readingHistoryService.clearHistory();
        setReadingHistory([]);

        // Also clear section reading data for consistency
        await sectionAnalyticsController.resetSectionAnalytics();

        // Refresh metrics
        refreshMetrics();
      } catch (err) {
        console.error("Error clearing reading history:", err);
        setError("Failed to clear reading history");
      }
    }
  }, [readingHistoryService, sectionAnalyticsController, refreshMetrics]);

  /**
   * Get document history
   */
  const getDocumentHistory = useCallback(
    async (path: string) => {
      try {
        const historyItem = await readingHistoryService.getDocumentHistory(
          path
        );

        // Enhance with section analytics data
        if (historyItem) {
          const documentStats =
            await sectionAnalyticsController.getDocumentStats();
          const docStat = documentStats.find((stat) => stat.path === path);

          if (docStat) {
            return {
              ...historyItem,
              completionPercentage: docStat.completionPercentage,
              // Use section analytics data for these metrics
              timeSpent: docStat.timeSpent || historyItem.timeSpent,
            };
          }
        }

        return historyItem;
      } catch (err) {
        console.error("Error getting document history:", err);
        setError("Failed to get document history");
        return null;
      }
    },
    [readingHistoryService, sectionAnalyticsController]
  );

  /**
   * Get total reading time from metrics
   */
  const getTotalReadingTime = useCallback(() => {
    return metrics.totalTimeSpent;
  }, [metrics.totalTimeSpent]);

  /**
   * Get total words read from metrics
   */
  const getTotalWordsRead = useCallback(() => {
    return metrics.totalWordsRead;
  }, [metrics.totalWordsRead]);

  /**
   * Refresh reading history
   */
  const refreshReadingHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const history = await readingHistoryService.getAllHistory();
      setReadingHistory(history);

      // Also refresh metrics
      refreshMetrics();

      setError(null);
    } catch (err) {
      console.error("Error refreshing reading history:", err);
      setError("Failed to refresh reading history");
    } finally {
      setIsLoading(false);
    }
  }, [readingHistoryService, refreshMetrics]);

  return {
    readingHistory,
    isLoading,
    error,
    addToReadingHistory,
    clearReadingHistory,
    getDocumentHistory,
    getTotalReadingTime,
    getTotalWordsRead,
    refreshReadingHistory,

    // Expose metrics directly
    metrics,
  };
}
