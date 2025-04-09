import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/context/ServiceContext";
import type { ReadingTodoItem } from "@/services/analytics/ReadingListService";

/**
 * 📚 useReadingList - A delightful hook that manages your reading list!
 *
 * This hook provides a complete solution for managing a reading to-do list
 * with features like adding, removing, and tracking completion status. ✨
 *
 * It handles all the complex state management and service interactions
 * behind the scenes, giving you a clean and simple interface to work with. 🧩
 *
 * The hook automatically loads your reading list when mounted and provides
 * helpful loading states and error handling to create a smooth user experience. 🌈
 *
 * Perfect for building reading trackers, book lists, or any feature
 * that needs to manage a collection of reading materials! 📖
 */
export function useReadingList() {
  const { readingListService } = useServices();
  const [todoList, setTodoList] = useState<ReadingTodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
    Load to-do list from service🌟.
    This effect fetches your reading list when the hook is used, ensuring you have the latest items! 📚
    It shows a loading state while fetching, updates the list on success, and handles any errors gracefully.
   😊
   */
  useEffect(() => {
    const loadTodoList = async () => {
      setIsLoading(true);
      try {
        const items = await readingListService.getAllItems();
        setTodoList(items);
        setError(null);
      } catch (err) {
        console.error("Error loading reading list:", err);
        setError("Failed to load reading list");
      } finally {
        setIsLoading(false);
      }
    };

    loadTodoList();
  }, [readingListService]);

  /**
   * 🌟 Adds a new item to your reading list
   * Automatically refreshes the list when successful!
   */
  const addToReadingList = useCallback(
    async (path: string, title: string): Promise<boolean> => {
      try {
        const success = await readingListService.addToReadingList(path, title);

        if (success) {
          const items = await readingListService.getAllItems();
          setTodoList(items);
        }
        return success;
      } catch (err) {
        console.error("Error adding to reading list:", err);
        setError("Failed to add to reading list");
        return false;
      }
    },
    [readingListService]
  );

  /**
   * 🗑️ Removes an item from your reading list
   * Keeps your list tidy by removing unwanted items!
   */
  const removeFromReadingList = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const success = await readingListService.removeItem(id);

        if (success) {
          // Update local state
          const items = await readingListService.getAllItems();
          setTodoList(items);
        }

        return success;
      } catch (err) {
        console.error("Error removing from reading list:", err);
        setError("Failed to remove from reading list");
        return false;
      }
    },
    [readingListService]
  );

  /**
   * ✅ Toggles the completion status of a reading item
   * Mark items as read or unread with a simple function call!
   */
  const toggleTodoCompletion = useCallback(
    async (id: string) => {
      try {
        const updatedItem = await readingListService.toggleCompletion(id);

        if (updatedItem) {
          // Update local state
          const items = await readingListService.getAllItems();
          setTodoList(items);
        }

        return updatedItem;
      } catch (err) {
        console.error("Error toggling completion status:", err);
        setError("Failed to update item status");
        return null;
      }
    },
    [readingListService]
  );

  /**
   * 🧹 Clears your entire reading list
   * Start fresh with a clean slate! Includes a confirmation prompt.
   */
  const clearReadingList = useCallback(async () => {
    if (confirm("Are you sure you want to clear your reading list?")) {
      try {
        await readingListService.clearList();
        setTodoList([]);
      } catch (err) {
        console.error("Error clearing reading list:", err);
        setError("Failed to clear reading list");
      }
    }
  }, [readingListService]);

  /**
   * 📊 Gets statistics about your reading progress
   * Track how many items you've completed and what's still pending!
   */
  const getCompletionStats = useCallback(async () => {
    try {
      return await readingListService.getCompletionStats();
    } catch (err) {
      console.error("Error getting completion stats:", err);
      setError("Failed to get completion statistics");
      return {
        total: 0,
        completed: 0,
        pending: 0,
        completionPercentage: 0,
      };
    }
  }, [readingListService]);

  /**
   * 🔄 Refreshes your reading list
   * Get the latest data whenever you need it!
   */
  const refreshReadingList = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await readingListService.getAllItems();
      setTodoList(items);
      setError(null);
    } catch (err) {
      console.error("Error refreshing reading list:", err);
      setError("Failed to refresh reading list");
    } finally {
      setIsLoading(false);
    }
  }, [readingListService]);

  return {
    todoList,
    isLoading,
    error,
    addToReadingList,
    removeFromReadingList,
    toggleTodoCompletion,
    clearReadingList,
    getCompletionStats,
    refreshReadingList,
  };
}
