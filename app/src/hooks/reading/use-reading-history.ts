import { useHistoryStore } from "@/stores";
import { useCallback, useEffect, useState } from "react";
import { readingWorkerManager } from "@/infrastructure/workers";
import { HistoryFilterOptions } from "@/services/reading/reading-history-filter";
import { ReadingHistoryItem } from "@/services/reading/reading-history-service";

/**
 * 📚✨ A hook that manages your reading history!
 * Keeps track of what you've read and lets you play with your history.
 */
const useReadingHistory = () => {
  const [categoryMap, setCategoryMap] = useState<
    Record<string, ReadingHistoryItem[]>
  >({});

  const history = useHistoryStore((state) => state.readingHistory);

  useEffect(() => {
    history.sort((a, b) => b.lastReadAt - a.lastReadAt);
  }, [history]);

  const addToReadingHistory = useHistoryStore(
    (state) => state.addToReadingHistory
  );

  const clearReadingHistory = useHistoryStore(
    (state) => state.clearReadingHistory
  );

  const refreshReadingHistory = useHistoryStore(
    (state) => state.refreshReadingHistory
  );

  /**
   * 📝 Adds a new entry to your reading adventures!
   */
  const addToHistory = useCallback(
    async (path: string, title: string) => {
      return await addToReadingHistory(path, title);
    },
    [addToReadingHistory]
  );

  /**
   * 🧹 Wipes your reading slate clean!
   */
  const clearHistory = useCallback(async () => {
    await clearReadingHistory();
  }, [clearReadingHistory]);

  /**
   * 🔄 Gets the latest scoop on what you've been reading!
   */
  const refreshHistory = useCallback(async () => {
    await refreshReadingHistory();
  }, [refreshReadingHistory]);

  /**
   * 🔍 Helps you find specific reading memories!
   */
  const filterHistory = useCallback(
    async (filter: HistoryFilterOptions) => {
      const filteredHistory = await readingWorkerManager.filterHistory(
        history,
        filter
      );
      return filteredHistory;
    },
    [history]
  );

  /**
   * 📚 Creates a category map for your reading history
   */
  useEffect(() => {
    readingWorkerManager.createCategoryMap(history).then((categoryMap) => {
      setCategoryMap(categoryMap);
    });
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    refreshHistory,
    filterHistory,
    categoryMap,
  };
};

export default useReadingHistory;
