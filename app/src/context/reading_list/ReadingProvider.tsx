import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ReadingListContext } from "./ReadingContext";
import { useServices } from "../services/ServiceContext";
import type { ReadingTodoItem } from "@/services/analytics/ReadingListService";

interface ReadingListProviderProps {
  children: ReactNode;
}

/**
 * 📚 ReadingListProvider
 *
 * Your friendly reading list manager! This component takes care of everything
 * related to your reading list so you don't have to worry about it. 😊
 *
 * It manages:
 * - Loading your reading items from storage 🔄
 * - Adding new interesting things to read later ➕
 * - Removing items you no longer want 🗑️
 * - Marking items as complete when you're done ✅
 * - Tracking your reading progress with stats 📊
 *
 * Just wrap your app with this provider and all these features become
 * available throughout your component tree! No more prop drilling! 🎉
 */
export const ReadingListProvider: React.FC<ReadingListProviderProps> = ({
  children,
}) => {
  const { readingListService } = useServices();
  const [todoList, setTodoList] = useState<ReadingTodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 📚 Loads your reading list items
   *
   * Fetches all your saved reading items when the component mounts.
   * Shows a friendly loading state while working and handles any
   * errors that might occur. Your reading list is always up-to-date! 😄
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
   * ➕ Adds a new item to your reading list
   *
   * Found something interesting? Save it for later with this function!
   * It automatically refreshes your list so you see the new item right away. 🤩
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
   *
   * Changed your mind? No problem! This function helps you keep your
   * list tidy by removing items you no longer want to read. 👍
   */
  const removeFromReadingList = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const success = await readingListService.removeItem(id);

        if (success) {
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
   * ✅ Marks items as read or unread
   *
   * Finished reading something? Mark it as complete!
   * Changed your mind? Toggle it back to unread!
   * Track your progress with this simple toggle function. 🎯
   */
  const toggleTodoCompletion = useCallback(
    async (id: string) => {
      try {
        const updatedItem = await readingListService.toggleCompletion(id);

        if (updatedItem) {
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
   *
   * Want a fresh start? This function helps you clear everything!
   * Don't worry - it asks for confirmation before deleting. 😌
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
   * 📊 Shows your reading progress
   *
   * Curious about how you're doing? This function gives you stats
   * about your reading journey! See how many items you've completed
   * and what's still waiting for you. 🏆
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
   *
   * Need the latest data? This function fetches the most up-to-date
   * version of your reading list whenever you need it! 💫
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

  /**
   * 📊 Reading Statistics
   *
   * Calculates all the fun statistics about your reading progress!
   * Tracks how many items are pending, completed, and your overall
   * completion percentage to keep you motivated! 🎯
   */
  const { pendingCount, completedCount, completionPercentage, totalCount } =
    useMemo(() => {
      const completedCount = todoList.filter((item) => item.completed).length;
      const totalCount = todoList.length;

      return {
        pendingCount: todoList.filter((item) => !item.completed).length,
        completedCount,
        totalCount,
        completionPercentage:
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      };
    }, [todoList]) as {
      pendingCount: number;
      completedCount: number;
      completionPercentage: number;
      totalCount: number;
    };

  const readingListData = useMemo(
    () => ({
      todoList,
      isLoading,
      error,
      addToReadingList,
      removeFromReadingList,
      toggleTodoCompletion,
      clearReadingList,
      getCompletionStats,
      refreshReadingList,
      pendingCount,
      completedCount,
      completionPercentage,
      totalCount,
    }),
    [
      todoList,
      isLoading,
      error,
      addToReadingList,
      removeFromReadingList,
      toggleTodoCompletion,
      clearReadingList,
      getCompletionStats,
      refreshReadingList,
      pendingCount,
      completedCount,
      completionPercentage,
      totalCount,
    ]
  );

  return (
    <ReadingListContext.Provider value={readingListData}>
      {children}
    </ReadingListContext.Provider>
  );
};
