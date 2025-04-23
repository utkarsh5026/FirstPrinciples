import { useHistoryStore } from "@/stores";
import { withErrorHandling } from "@/utils/functions/error";
import { useCallback } from "react";

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

  const addToHistory = useCallback(
    async (path: string, title: string) => {
      withErrorHandling(async () => await addToReadingHistory(path, title), {
        errorPrefix: "Failed to add to reading history",
      });
    },
    [addToReadingHistory]
  );

  const clearHistory = useCallback(async () => {
    await clearReadingHistory();
  }, [clearReadingHistory]);

  const refreshHistory = useCallback(async () => {
    await refreshReadingHistory();
  }, [refreshReadingHistory]);

  return { history, addToHistory, clearHistory, refreshHistory };
};

export default useReadingHistory;
