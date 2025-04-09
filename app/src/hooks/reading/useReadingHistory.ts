import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/context/ServiceContext";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";

/**
 * A focused, modular hook that manages only reading history functionality
 */
/**
 * 📚 useReadingHistory - A delightful hook that manages your reading journey!
 *
 * This hook provides a complete solution for tracking your document reading history
 * with features like adding new entries, viewing past readings, and calculating
 * your reading statistics. ✨
 *
 * It handles all the complex state management and service interactions
 * behind the scenes, giving you a clean and simple interface to work with. 🧩
 *
 * The hook automatically loads your reading history when mounted and provides
 * helpful loading states and error handling to create a smooth user experience. 🌈
 *
 * Perfect for building reading trackers, progress indicators, or any feature
 * that needs to understand a user's reading patterns! 📖
 */
export function useReadingHistory() {
  const { readingHistoryService } = useServices();
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🔄 Load reading history from service
   * Fetches your complete reading history when the hook is first used!
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
   * 📝 Add document to reading history
   * Records your reading activity and updates your history automatically!
   */
  const addToReadingHistory = useCallback(
    async (path: string, title: string, content?: string) => {
      try {
        const updatedItem = await readingHistoryService.addToReadingHistory(
          path,
          title,
          content
        );

        const history = await readingHistoryService.getAllHistory();
        setReadingHistory(history);

        return updatedItem;
      } catch (err) {
        console.error("Error adding to reading history:", err);
        setError("Failed to add to reading history");
        return null;
      }
    },
    [readingHistoryService]
  );

  /**
   * 🧹 Clear reading history
   * Start fresh with a clean slate! Includes a confirmation prompt.
   */
  const clearReadingHistory = useCallback(async () => {
    if (confirm("Are you sure you want to clear your reading history?")) {
      try {
        await readingHistoryService.clearHistory();
        setReadingHistory([]);
      } catch (err) {
        console.error("Error clearing reading history:", err);
        setError("Failed to clear reading history");
      }
    }
  }, [readingHistoryService]);

  /**
   * 🔍 Get document history
   * Retrieve detailed history for a specific document!
   */
  const getDocumentHistory = useCallback(
    async (path: string) => {
      try {
        return await readingHistoryService.getDocumentHistory(path);
      } catch (err) {
        console.error("Error getting document history:", err);
        setError("Failed to get document history");
        return null;
      }
    },
    [readingHistoryService]
  );

  /**
   * ⏱️ Get total reading time
   * See how much time you've invested in reading!
   */
  const getTotalReadingTime = useCallback(async () => {
    try {
      return await readingHistoryService.getTotalReadingTime();
    } catch (err) {
      console.error("Error getting total reading time:", err);
      setError("Failed to calculate total reading time");
      return 0;
    }
  }, [readingHistoryService]);

  /**
   * 📊 Get total words read
   * Track your reading volume with word count statistics!
   */
  const getTotalWordsRead = useCallback(async () => {
    try {
      return await readingHistoryService.getTotalWordsRead();
    } catch (err) {
      console.error("Error getting total words read:", err);
      setError("Failed to calculate total words read");
      return 0;
    }
  }, [readingHistoryService]);

  /**
   * 🔄 Refresh reading history
   * Get the latest data whenever you need it!
   */
  const refreshReadingHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const history = await readingHistoryService.getAllHistory();
      setReadingHistory(history);
      setError(null);
    } catch (err) {
      console.error("Error refreshing reading history:", err);
      setError("Failed to refresh reading history");
    } finally {
      setIsLoading(false);
    }
  }, [readingHistoryService]);

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
  };
}
