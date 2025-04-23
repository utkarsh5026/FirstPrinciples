import { useHistoryStore } from "@/stores";
import { withErrorHandling } from "@/utils/functions/error";
import { useCallback } from "react";
import { readingWorkerManager } from "@/infrastructure/workers";
import { HistoryFilterOptions } from "@/services/reading/reading-history-filter";

/**
 * 📚✨ A hook that manages your reading history!
 * Keeps track of what you've read and lets you play with your history.
 */
const useReadingHistory = () => {
  const history = useHistoryStore((state) => state.readingHistory);
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
      withErrorHandling(async () => await addToReadingHistory(path, title), {
        errorPrefix: "Failed to add to reading history",
      });
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

  return { history, addToHistory, clearHistory, refreshHistory, filterHistory };
};

export default useReadingHistory;
