import React, { ReactNode } from "react";
import { useReadingHistory as useOriginalReadingHistory } from "@/hooks/reading/useReadingHistory";
import { ReadingHistoryContext } from "./HistoryContext";

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
  // Use the original hook inside the provider
  const readingHistoryData = useOriginalReadingHistory();

  // Provide the hook's return value as context
  return (
    <ReadingHistoryContext.Provider value={readingHistoryData}>
      {children}
    </ReadingHistoryContext.Provider>
  );
};

export default ReadingHistoryProvider;
