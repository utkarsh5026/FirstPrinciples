import { ReactNode } from "react";
import { useReadingList as useOriginalReadingList } from "@/hooks/reading/useReadingList";
import { ReadingListContext } from "./ReadingContext";

interface ReadingListProviderProps {
  children: ReactNode;
}

/**
 * ReadingListProvider - Provides reading list state and functions to the component tree
 *
 * This provider centralizes all reading list management, making it available to any
 * component in the tree without prop drilling.
 */
export const ReadingListProvider: React.FC<ReadingListProviderProps> = ({
  children,
}) => {
  // Use the original hook inside the provider
  const readingListData = useOriginalReadingList();

  // Provide the hook's return value as context
  return (
    <ReadingListContext.Provider value={readingListData}>
      {children}
    </ReadingListContext.Provider>
  );
};
