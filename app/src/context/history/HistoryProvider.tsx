import React, {
  ReactNode,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ReadingHistoryContext } from "./HistoryContext";
import { useServices } from "@/context/services/ServiceContext";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
interface ReadingHistoryProviderProps {
  children: ReactNode;
}

/**
 * ReadingHistoryProvider - Provides reading history state and functions to the component tree
 *
 * This provider centralizes all reading history management, making it available to any
 * component in the tree without prop drilling.
 */
export const ReadingHistoryProvider: React.FC<ReadingHistoryProviderProps> = ({
  children,
}) => {
  const { readingHistoryService, sectionAnalyticsController } = useServices();

  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🔍 Fetches your reading history when the hook initializes
   *
   * Like a librarian pulling your reading record from the archives!
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
   * 📝 Records a document you've just read
   *
   * Like adding a new entry to your reading journal! This function
   * remembers what you read and when you read it, while the analytics
   * system tracks the details like time spent and progress.
   */
  const addToReadingHistory = useCallback(
    async (path: string, title: string) => {
      try {
        // We're still recording reading history but not tracking
        // words or time here anymore - that comes from section analytics
        const updatedItem = await readingHistoryService.addToReadingHistory(
          path,
          title
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
   * 🧹 Wipes your reading history clean
   *
   * Like starting a fresh chapter in your reading journey! This gives
   * you a clean slate if you want to reset your reading metrics.
   */
  const clearReadingHistory = useCallback(async () => {
    if (confirm("Are you sure you want to clear your reading history?")) {
      try {
        await readingHistoryService.clearHistory();
        setReadingHistory([]);
        await sectionAnalyticsController.resetSectionAnalytics();
      } catch (err) {
        console.error("Error clearing reading history:", err);
        setError("Failed to clear reading history");
      }
    }
  }, [readingHistoryService, sectionAnalyticsController]);

  /**
   * 🔎 Retrieves detailed history for a specific document
   *
   * Like finding a specific book in your reading journal and seeing
   * all your notes about it! This combines basic history with rich
   * analytics data to show your progress and time spent.
   */
  const getDocumentHistory = useCallback(
    async (path: string) => {
      try {
        const historyItem = await readingHistoryService.getDocumentHistory(
          path
        );

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
      } catch (err) {
        console.error("Error getting document history:", err);
        setError("Failed to get document history");
        return null;
      }
    },
    [readingHistoryService, sectionAnalyticsController]
  );

  /**
   * 🔄 Refreshes your reading history and metrics
   *
   * Like updating your reading journal with the latest entries!
   * This ensures you always see the most current information.
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

  const readingHistoryData = useMemo(
    () => ({
      readingHistory,
      isLoading,
      error,
      addToReadingHistory,
      clearReadingHistory,
      getDocumentHistory,
      refreshReadingHistory,
    }),
    [
      readingHistory,
      isLoading,
      error,
      addToReadingHistory,
      clearReadingHistory,
      getDocumentHistory,
      refreshReadingHistory,
    ]
  );

  return (
    <ReadingHistoryContext.Provider value={readingHistoryData}>
      {children}
    </ReadingHistoryContext.Provider>
  );
};

export default ReadingHistoryProvider;
