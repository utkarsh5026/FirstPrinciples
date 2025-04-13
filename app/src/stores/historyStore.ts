import { create } from "zustand";
import {
  readingHistoryService,
  type ReadingHistoryItem,
} from "@/services/analytics/ReadingHistoryService";
import { sectionAnalyticsController } from "@/services/analytics/SectionAnalyticsController";

type State = {
  readingHistory: ReadingHistoryItem[];
  isLoading: boolean;
  error: string | null;
};

type Actions = {
  addToReadingHistory: (
    path: string,
    title: string
  ) => Promise<ReadingHistoryItem | null>;
  clearReadingHistory: () => Promise<void>;
  getDocumentHistory: (path: string) => Promise<ReadingHistoryItem | null>;
  refreshReadingHistory: () => Promise<void>;
  initialize: () => Promise<void>;
};

/**
 * 📚 History Store
 *
 * A central store for tracking and managing reading history.
 *
 * ✨ Features:
 * - Tracks documents you've read
 * - Records time spent on each document
 * - Maintains completion percentages
 * - Syncs with analytics services
 *
 * 🔍 Use this store when you need to access or modify reading history!
 */
export const useHistoryStore = create<State & Actions>((set, get) => ({
  readingHistory: [],
  isLoading: true,
  error: null,

  /**
   * 📝 Add a document to reading history
   * Tracks what you've been reading!
   */
  addToReadingHistory: async (path, title) => {
    try {
      // Record the reading in the history service
      const updatedItem = await readingHistoryService.addToReadingHistory(
        path,
        title
      );

      // Refresh the history in the store
      await get().refreshReadingHistory();

      return updatedItem;
    } catch (error) {
      console.error("Error adding to reading history:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to add to reading history",
      });
      return null;
    }
  },

  /**
   * 🧹 Clear reading history
   * Fresh start with a clean slate!
   */
  clearReadingHistory: async () => {
    if (confirm("Are you sure you want to clear your reading history?")) {
      try {
        await readingHistoryService.clearHistory();
        await sectionAnalyticsController.resetSectionAnalytics();
        set({ readingHistory: [], error: null });
      } catch (error) {
        console.error("Error clearing reading history:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to clear reading history",
        });
      }
    }
  },

  /**
   * 🔍 Get history for a specific document
   * Find out when you read something!
   */
  getDocumentHistory: async (path) => {
    try {
      const historyItem = await readingHistoryService.getDocumentHistory(path);

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
    } catch (error) {
      console.error("Error getting document history:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to get document history",
      });
      return null;
    }
  },

  /**
   * 🔄 Refresh reading history
   * Get the latest reading data!
   */
  refreshReadingHistory: async () => {
    set({ isLoading: true });
    try {
      const history = await readingHistoryService.getAllHistory();
      set({ readingHistory: history, error: null, isLoading: false });
    } catch (error) {
      console.error("Error refreshing reading history:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to refresh reading history",
        isLoading: false,
      });
    }
  },

  /**
   * 🚀 Initialize the store
   * Gets everything ready to go!
   */
  initialize: async () => {
    set({ isLoading: true });
    try {
      const history = await readingHistoryService.getAllHistory();
      set({ readingHistory: history, error: null, isLoading: false });
    } catch (error) {
      console.error("Error loading reading history:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load reading history",
        isLoading: false,
      });
    }
  },
}));
