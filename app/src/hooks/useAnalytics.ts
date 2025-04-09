import { useState, useEffect, useCallback } from "react";
import { analyticsController } from "@/services/analytics/AnalyticsController";
import { readingListService } from "@/services/analytics/ReadingListService";
import { readingHistoryService } from "@/services/analytics/ReadingHistoryService";

/**
 * Custom hook for using the analytics system in React components
 * @param availableDocuments Array of all available documents
 * @returns Analytics state and actions
 */
export function useAnalytics(availableDocuments: any[] = []) {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize analytics when the hook mounts
  useEffect(() => {
    const initAnalytics = async () => {
      try {
        setIsLoading(true);

        // Initialize controller
        await analyticsController.initialize();

        // Set available documents
        analyticsController.setAvailableDocuments(availableDocuments);

        // Get initial analytics data
        const data = await analyticsController.getAnalyticsData();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Error initializing analytics:", err);
        setError("Failed to initialize analytics system");
      } finally {
        setIsLoading(false);
      }
    };

    initAnalytics();
  }, []);

  // Update available documents when they change
  useEffect(() => {
    analyticsController.setAvailableDocuments(availableDocuments);
  }, [availableDocuments]);

  // Start reading a document
  const startReading = useCallback(
    async (path: string, title: string, content?: string) => {
      try {
        await analyticsController.startReading(path, title, content);
      } catch (err) {
        console.error("Error starting reading:", err);
        setError("Failed to start reading session");
      }
    },
    []
  );

  // End reading a document
  const endReading = useCallback(
    async (path: string, title: string, content?: string) => {
      try {
        const data = await analyticsController.endReading(path, title, content);
        setAnalyticsData(data);
        return data;
      } catch (err) {
        console.error("Error ending reading:", err);
        setError("Failed to end reading session");
        return null;
      }
    },
    []
  );

  // Add to reading list
  const addToReadingList = useCallback(async (path: string, title: string) => {
    try {
      const result = await readingListService.addToReadingList(path, title);

      if (result) {
        const data = await analyticsController.getAnalyticsData();
        setAnalyticsData(data);
      }

      return result;
    } catch (err) {
      console.error("Error adding to reading list:", err);
      setError("Failed to add to reading list");
      return false;
    }
  }, []);

  // Toggle completion of reading list item
  const toggleTodoCompletion = useCallback(async (id: string) => {
    try {
      const updatedItem = await readingListService.toggleCompletion(id);

      if (updatedItem) {
        const data = await analyticsController.getAnalyticsData();
        setAnalyticsData(data);
      }

      return updatedItem;
    } catch (err) {
      console.error("Error toggling todo completion:", err);
      setError("Failed to update reading list item");
      return null;
    }
  }, []);

  // Remove item from reading list
  const removeFromReadingList = useCallback(async (id: string) => {
    try {
      const result = await readingListService.removeItem(id);
      if (result) {
        const data = await analyticsController.getAnalyticsData();
        setAnalyticsData(data);
      }
      return result;
    } catch (err) {
      console.error("Error removing from reading list:", err);
      setError("Failed to remove from reading list");
      return false;
    }
  }, []);

  // Clear reading list
  const clearReadingList = useCallback(async () => {
    try {
      await readingListService.clearList();
      const data = await analyticsController.getAnalyticsData();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Error clearing reading list:", err);
      setError("Failed to clear reading list");
    }
  }, []);

  // Clear reading history
  const clearReadingHistory = useCallback(async () => {
    try {
      await readingHistoryService.clearHistory();
      const data = await analyticsController.getAnalyticsData();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Error clearing reading history:", err);
      setError("Failed to clear reading history");
    }
  }, []);

  // Reset all analytics data
  const resetAllData = useCallback(async () => {
    try {
      await analyticsController.resetAllData();

      // Refresh analytics data
      const data = await analyticsController.getAnalyticsData();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Error resetting analytics data:", err);
      setError("Failed to reset analytics data");
    }
  }, []);

  // Refresh analytics data
  const refreshAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await analyticsController.getAnalyticsData();
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      console.error("Error refreshing analytics:", err);
      setError("Failed to refresh analytics data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Data
    analyticsData,
    isLoading,
    error,

    // Reading actions
    startReading,
    endReading,

    // Reading list actions
    addToReadingList,
    toggleTodoCompletion,
    removeFromReadingList,
    clearReadingList,

    // History actions
    clearReadingHistory,

    // Other actions
    resetAllData,
    refreshAnalytics,
  };
}
