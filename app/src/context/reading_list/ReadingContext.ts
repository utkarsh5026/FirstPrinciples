import { createContext, useContext } from "react";
import type { ReadingTodoItem } from "@/services/analytics/ReadingListService";

export type ReadingListContextType = {
  todoList: ReadingTodoItem[];
  isLoading: boolean;
  error: string | null;
  addToReadingList: (path: string, title: string) => Promise<boolean>;
  removeFromReadingList: (id: string) => Promise<boolean>;
  toggleTodoCompletion: (id: string) => Promise<ReadingTodoItem | null>;
  clearReadingList: () => Promise<void>;
  getCompletionStats: () => Promise<{
    total: number;
    completed: number;
    pending: number;
    completionPercentage: number;
  }>;
  refreshReadingList: () => Promise<void>;
};

// Create the context with an undefined default value
export const ReadingListContext = createContext<
  ReadingListContextType | undefined
>(undefined);

/**
 * useReadingList - Custom hook to use the reading list context
 *
 * This hook provides access to reading list data and functions.
 * It must be used within a ReadingListProvider.
 */
export const useReadingList = (): ReadingListContextType => {
  const context = useContext(ReadingListContext);

  if (context === undefined) {
    throw new Error("useReadingList must be used within a ReadingListProvider");
  }

  return context;
};
