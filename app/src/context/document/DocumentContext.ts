import { createContext, useContext } from "react";
import type { FileMetadata, ParsedMarkdown } from "@/utils/MarkdownLoader";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import type { ReadingTodoItem } from "@/services/analytics/ReadingListService";
import type { ReadingMetrics } from "@/context/metrics/MetricsContext";

interface DocumentManagerContextType {
  // Reading history
  readingHistory: ReadingHistoryItem[];
  addToReadingHistory: (
    path: string,
    title: string
  ) => Promise<ReadingHistoryItem | null>;
  clearReadingHistory: () => Promise<void>;

  // Reading list
  todoList: ReadingTodoItem[];
  addToTodoList: (path: string, title: string) => Promise<boolean>;
  removeFromTodoList: (id: string) => Promise<boolean>;
  toggleTodoCompletion: (id: string) => Promise<ReadingTodoItem | null>;
  clearTodoList: () => Promise<void>;

  // Documents
  availableDocuments: FileMetadata[];
  filteredDocuments: FileMetadata[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Document selection
  selectedFile: string | null;
  handleSelectDocument: (path: string, title: string) => Promise<void>;
  getTrendingDocuments: () => Promise<FileMetadata[]>;

  // Utilities
  formatDate: (timestamp: number) => string;
  isLoading: boolean;
  error: string | null;
  metrics: ReadingMetrics;
  loadMarkdown: (path: string) => Promise<ParsedMarkdown | null>;
}

// Create the context with an undefined default value
export const DocumentManagerContext = createContext<
  DocumentManagerContextType | undefined
>(undefined);

/**
 * useDocumentManager - Custom hook to use the document manager context
 *
 * This hook provides access to document management functions and data.
 * It must be used within a DocumentManagerProvider.
 */
export const useDocumentManager = (): DocumentManagerContextType => {
  const context = useContext(DocumentManagerContext);

  if (context === undefined) {
    throw new Error(
      "useDocumentManager must be used within a DocumentManagerProvider"
    );
  }

  return context;
};
