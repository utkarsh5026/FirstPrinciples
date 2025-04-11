import { useCallback, useMemo, useState, ReactNode, useEffect } from "react";
import { DocumentManagerContext } from "./DocumentContext";
import { useServices } from "../services/ServiceContext";
import { FileMetadata, MarkdownLoader, Category } from "@/utils/MarkdownLoader";
import { useReadingHistory } from "../history/HistoryContext";
import { useReadingMetrics } from "../metrics/MetricsContext";
import { useReadingList } from "../reading_list/ReadingContext";

interface DocumentManagerProviderProps {
  children: ReactNode;
  onSelectFile: (path: string) => void;
}

/**
 * DocumentManagerProvider - Provides document management state and functions to the component tree
 *
 * This provider centralizes all document-related operations, including loading documents,
 * tracking reading history, and managing reading lists.
 */
export const DocumentManagerProvider: React.FC<
  DocumentManagerProviderProps
> = ({ children, onSelectFile }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelection = useCallback(
    (path: string) => {
      setSelectedFile(path);
      onSelectFile(path);
    },
    [onSelectFile]
  );

  const readingList = useReadingList();
  const readingHistory = useReadingHistory();
  const { metrics, refreshMetrics } = useReadingMetrics();

  const [availableDocuments, setAvailableDocuments] = useState<FileMetadata[]>(
    []
  );
  const [filteredDocuments, setFilteredDocuments] = useState<FileMetadata[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { analyticsController, sectionAnalyticsController } = useServices();

  /**
   * Load available documents from content index
   */
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        const contentIndex = await MarkdownLoader.loadContentIndex();
        const allFiles: FileMetadata[] = [...contentIndex.files];

        const collectFilesFromCategories = (categories: Category[]) => {
          categories.forEach((category) => {
            if (category.files) {
              allFiles.push(...category.files);
            }

            if (category.subcategories) {
              collectFilesFromCategories(category.subcategories);
            }
          });
        };

        collectFilesFromCategories(contentIndex.categories || []);

        setAvailableDocuments(allFiles);
        setFilteredDocuments(allFiles);

        // Set available documents in analytics controllers
        analyticsController.setAvailableDocuments(allFiles);

        // Refresh metrics with the new document count
        refreshMetrics();
      } catch (error) {
        console.error("Error loading documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [analyticsController, refreshMetrics]);

  /**
   * Filter documents based on search query
   */
  useEffect(() => {
    if (!searchQuery) {
      setFilteredDocuments(availableDocuments);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = availableDocuments.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.path.toLowerCase().includes(query)
    );

    setFilteredDocuments(filtered);
  }, [searchQuery, availableDocuments]);

  /**
   * Handle selecting a document to read
   */
  const handleSelectDocument = useCallback(
    async (path: string, title: string) => {
      try {
        // We'll add to reading history, but not track metrics here
        // since that will be handled by the section analytics system
        await readingHistory.addToReadingHistory(path, title);

        // Mark as completed if in todo list
        const todoItem = readingList.todoList.find(
          (item) => item.path === path && !item.completed
        );
        if (todoItem) {
          await readingList.toggleTodoCompletion(todoItem.id);
        }

        // Start a reading session - analytics controllers will handle
        // synchronizing metrics between systems behind the scenes
        await analyticsController.startReading(path, title);

        // Open the document
        onSelectFile(path);
      } catch (error) {
        console.error("Error selecting document:", error);
      }
    },
    [readingHistory, readingList, analyticsController, onSelectFile]
  );

  const loadMarkdown = useCallback(async (path: string) => {
    const result = await MarkdownLoader.loadMarkdownContent(path);
    return result;
  }, []);

  /**
   * Get a selection of trending documents
   */
  const getTrendingDocuments = useCallback(async () => {
    try {
      // Use section analytics to get the most popular documents
      const documentStats = await sectionAnalyticsController.getDocumentStats();

      // Sort by most recently read first
      const sortedStats = documentStats
        .filter((stat) => stat.lastReadAt)
        .sort((a, b) => b.lastReadAt - a.lastReadAt);

      // Get the corresponding document metadata
      const trendingDocs = sortedStats
        .slice(0, 5)
        .map((stat) => {
          return availableDocuments.find((doc) => doc.path === stat.path);
        })
        .filter(Boolean) as FileMetadata[];

      // If we don't have enough trending docs, add some random ones
      if (trendingDocs.length < 5 && availableDocuments.length > 0) {
        const remainingDocs = availableDocuments
          .filter((doc) => !trendingDocs.some((td) => td.path === doc.path))
          .sort(() => 0.5 - Math.random())
          .slice(0, 5 - trendingDocs.length);

        return [...trendingDocs, ...remainingDocs];
      }

      return trendingDocs;
    } catch (error) {
      console.error("Error getting trending documents:", error);

      // Fallback to random selection
      if (availableDocuments.length <= 5) return availableDocuments;
      return [...availableDocuments]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
    }
  }, [availableDocuments, sectionAnalyticsController]);

  /**
   * Format date for display
   */
  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Otherwise, show date
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      readingHistory: readingHistory.readingHistory,
      addToReadingHistory: readingHistory.addToReadingHistory,
      clearReadingHistory: readingHistory.clearReadingHistory,

      todoList: readingList.todoList,
      addToTodoList: readingList.addToReadingList,
      removeFromTodoList: readingList.removeFromReadingList,
      toggleTodoCompletion: readingList.toggleTodoCompletion,
      clearTodoList: readingList.clearReadingList,

      availableDocuments,
      filteredDocuments,
      searchQuery,
      setSearchQuery,

      handleSelectDocument,
      getTrendingDocuments,
      formatDate,
      isLoading: isLoading || readingHistory.isLoading || readingList.isLoading,
      error: readingHistory.error ?? readingList.error,
      metrics,
      loadMarkdown,
      selectedFile,
      handleFileSelection,
    }),
    [
      readingHistory,
      readingList,
      availableDocuments,
      filteredDocuments,
      searchQuery,
      setSearchQuery,
      handleSelectDocument,
      getTrendingDocuments,
      formatDate,
      isLoading,
      metrics,
      loadMarkdown,
      selectedFile,
      handleFileSelection,
    ]
  );

  // Provide the context value
  return (
    <DocumentManagerContext.Provider value={contextValue}>
      {children}
    </DocumentManagerContext.Provider>
  );
};
