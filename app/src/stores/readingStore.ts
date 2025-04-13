import { create } from "zustand";
import {
  readingListService,
  type ReadingTodoItem,
} from "@/services/analytics/ReadingListService";
import { parseError } from "@/utils/error";

export type ReadingStatus = {
  pendingCount: number;
  completedCount: number;
  completionPercentage: number;
  totalCount: number;
};

interface ReadingListState {
  todoList: ReadingTodoItem[];
  isLoading: boolean;
  error: string | null;
  status: ReadingStatus;

  addToReadingList: (path: string, title: string) => Promise<boolean>;
  removeFromReadingList: (id: string) => Promise<boolean>;
  toggleTodoCompletion: (id: string) => Promise<ReadingTodoItem | null>;
  clearReadingList: () => Promise<void>;
  getCompletionStats: () => Promise<ReadingStatus>;
  refreshReadingList: () => Promise<void>;

  // initialize: () => Promise<void>;
}

export const useReadingStore = create<ReadingListState>((set, get) => ({
  todoList: [],
  isLoading: true,
  error: null,
  status: {
    pendingCount: 0,
    completedCount: 0,
    completionPercentage: 0,
    totalCount: 0,
  },

  addToReadingList: async (path, title) => {
    try {
      const success = await readingListService.addToReadingList(path, title);

      if (success) {
        await get().refreshReadingList();
      }

      return success;
    } catch (error) {
      console.error("Error adding to reading list:", error);
      set({
        error: parseError(error, "Failed to add to reading list"),
      });
      return false;
    }
  },

  removeFromReadingList: async (id) => {
    try {
      const success = await readingListService.removeItem(id);

      if (success) {
        await get().refreshReadingList();
      }

      return success;
    } catch (error) {
      console.error("Error removing from reading list:", error);
      set({
        error: parseError(error, "Failed to remove from reading list"),
      });
      return false;
    }
  },

  toggleTodoCompletion: async (id) => {
    try {
      const updatedItem = await readingListService.toggleCompletion(id);

      if (updatedItem) {
        console.log("Updated item:", updatedItem);
        await get().refreshReadingList();
      } else {
        console.log("No updated item");
      }

      return updatedItem;
    } catch (error) {
      console.error("Error toggling completion status:", error);
      set({
        error: parseError(error, "Failed to update item status"),
      });
      return null;
    }
  },

  clearReadingList: async () => {
    if (confirm("Are you sure you want to clear your reading list?")) {
      try {
        await readingListService.clearList();
        set({
          todoList: [],
          status: {
            pendingCount: 0,
            completedCount: 0,
            completionPercentage: 0,
            totalCount: 0,
          },
          error: null,
        });
      } catch (error) {
        console.error("Error clearing reading list:", error);
        set({
          error: parseError(error, "Failed to clear reading list"),
        });
      }
    }
  },

  getCompletionStats: async () => {
    try {
      const stats = await readingListService.getCompletionStats();
      return {
        pendingCount: stats.pending,
        completedCount: stats.completed,
        completionPercentage: stats.completionPercentage,
        totalCount: stats.total,
      };
    } catch (error) {
      console.error("Error getting completion stats:", error);
      set({
        error: parseError(error, "Failed to get completion statistics"),
      });
      return {
        pendingCount: 0,
        completedCount: 0,
        completionPercentage: 0,
        totalCount: 0,
      };
    }
  },

  refreshReadingList: async () => {
    set({ isLoading: true });
    try {
      const items = await readingListService.getAllItems();
      console.log("Items:", items);

      const completedCount = items.filter((item) => item.completed).length;
      const totalCount = items.length;
      const pendingCount = totalCount - completedCount;
      const completionPercentage =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      set({
        todoList: items,
        status: {
          pendingCount,
          completedCount,
          completionPercentage,
          totalCount,
        },
        error: null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error refreshing reading list:", error);
      set({
        error: parseError(error, "Failed to refresh reading list"),
        isLoading: false,
      });
    }
  },

  initialize: async () => {
    console.log("Initializing reading list");
    set({ isLoading: true });
    try {
      await get().refreshReadingList();
    } catch (error) {
      console.error("Error initializing reading list:", error);
      set({
        error: parseError(error, "Failed to initialize reading list"),
        isLoading: false,
      });
    }
  },
}));
