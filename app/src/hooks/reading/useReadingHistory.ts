import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/context/ServiceContext";
import { useReadingMetrics } from "./useReadingMetrics";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";

/**
 * 📚✨ useReadingHistory
 *
 * A delightful hook that manages your reading journey across the app!
 *
 * This hook creates a seamless experience for tracking what you've read,
 * how long you've spent reading, and your overall reading progress.
 *
 * ✅ Keeps a beautiful timeline of everything you've read
 * ⏱️ Tracks your reading time without you having to think about it
 * 📊 Provides rich metrics about your reading habits
 * 🔄 Syncs with the central analytics system for accurate statistics
 *
 * Think of it as your personal reading companion that remembers everything
 * for you and helps you build consistent reading habits! 📖💕
 */
export const useReadingHistory = () => {
  const { readingHistoryService, sectionAnalyticsController } = useServices();
  const { metrics, refreshMetrics } = useReadingMetrics();

  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🔍 Fetches your reading history when the hook initializes
   *
   * Like a librarian pulling your reading record from the archives!
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
   * 📝 Records a document you've just read
   *
   * Like adding a new entry to your reading journal! This function
   * remembers what you read and when you read it, while the analytics
   * system tracks the details like time spent and progress.
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

        const history = await readingHistoryService.getAllHistory();
        setReadingHistory(history);

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
   * 🧹 Wipes your reading history clean
   *
   * Like starting a fresh chapter in your reading journey! This gives
   * you a clean slate if you want to reset your reading metrics.
   */
  const clearReadingHistory = useCallback(async () => {
    if (confirm("Are you sure you want to clear your reading history?")) {
      try {
        await readingHistoryService.clearHistory();
        setReadingHistory([]);
        await sectionAnalyticsController.resetSectionAnalytics();
        refreshMetrics();
      } catch (err) {
        console.error("Error clearing reading history:", err);
        setError("Failed to clear reading history");
      }
    }
  }, [readingHistoryService, sectionAnalyticsController, refreshMetrics]);

  /**
   * 🔎 Retrieves detailed history for a specific document
   *
   * Like finding a specific book in your reading journal and seeing
   * all your notes about it! This combines basic history with rich
   * analytics data to show your progress and time spent.
   */
  const getDocumentHistory = useCallback(
    async (path: string) => {
      try {
        const historyItem = await readingHistoryService.getDocumentHistory(
          path
        );

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
   * ⏱️ Gets your total reading time across all documents
   *
   * Like checking how many hours you've spent on your reading adventure!
   */
  const getTotalReadingTime = useCallback(() => {
    return metrics.totalTimeSpent;
  }, [metrics.totalTimeSpent]);

  /**
   * 📊 Gets the total number of words you've read
   *
   * Like counting all the words you've absorbed in your reading journey!
   */
  const getTotalWordsRead = useCallback(() => {
    return metrics.totalWordsRead;
  }, [metrics.totalWordsRead]);

  /**
   * 🔄 Refreshes your reading history and metrics
   *
   * Like updating your reading journal with the latest entries!
   * This ensures you always see the most current information.
   */
  const refreshReadingHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const history = await readingHistoryService.getAllHistory();
      setReadingHistory(history);
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
};
