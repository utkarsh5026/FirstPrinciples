import type { ReadingHistoryItem } from "@/services/history";
import { create } from "zustand";
import { useDocumentStore } from "./documentStore";
import { useHistoryStore } from "./historyStore";
import { parseError } from "@/utils/error";

export type CategoryBreakdown = {
  category: string;
  count: number;
  percentage: number;
  categoryCount: number;
};

type State = {
  categoryBreakdown: CategoryBreakdown[];
  isLoading: boolean;
  error: string | null;
};

type Actions = {
  createCategoryBreakdown: (
    readingHistory: ReadingHistoryItem[]
  ) => CategoryBreakdown[];
  initialize: () => Promise<void>;
};

/**
 * 📊 Category Store
 *
 * This magical store keeps track of all your reading categories! ✨
 * It automatically updates whenever your reading history changes,
 * giving you fresh insights about your reading habits.
 *
 * Features:
 * - 🔄 Auto-syncs with your reading history
 * - 📈 Calculates percentage breakdowns of what you read
 * - 🏷️ Organizes documents by their categories
 * - 📚 Tracks how many documents you have in each category
 */
export const useCategoryStore = create<State & Actions>((set, get) => {
  /**
   * 🔍 Listen for changes in reading history and update categories
   */
  useHistoryStore.subscribe((state) => {
    const readingHistory = state.readingHistory;
    const categoryBreakdown = get().createCategoryBreakdown(readingHistory);
    set({ categoryBreakdown });
  });

  return {
    categoryBreakdown: [],
    isLoading: false,
    error: null,

    /**
     * ✨ Creates a beautiful breakdown of your reading categories
     * Analyzes your history to show what categories you read most!
     */
    createCategoryBreakdown: (readingHistory) => {
      const categoryMap: Record<string, number> = {};
      readingHistory.forEach((item) => {
        const category = item.path.split("/")[0] || "uncategorized";
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      });

      const total = Object.values(categoryMap).reduce(
        (sum, count) => sum + count,
        0
      );

      const availableDocuments = useDocumentStore.getState().availableDocuments;

      const result = Object.entries(categoryMap);
      return result
        .map(([category, count]) => ({
          category,
          count,
          categoryCount: availableDocuments.filter(
            (doc) => doc.path.split("/")[0] === category
          ).length,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },

    /**
     * 🚀 Gets everything up and running
     * Loads your initial category data when the app starts!
     */
    initialize: async () => {
      set({ isLoading: true });
      try {
        const readingHistory = useHistoryStore.getState().readingHistory;
        const categoryBreakdown = get().createCategoryBreakdown(readingHistory);
        set({ categoryBreakdown, isLoading: false });
      } catch (error) {
        console.error("Error initializing category store:", error);
        set({
          error: parseError(error, "Failed to initialize category store"),
          isLoading: false,
        });
      }
    },
  };
});
