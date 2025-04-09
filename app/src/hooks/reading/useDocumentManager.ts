import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/context/ServiceContext";
import { useReadingList } from "./useReadingList";
import { useReadingHistory } from "./useReadingHistory";
import {
  MarkdownLoader,
  type FileMetadata,
  type Category,
} from "@/utils/MarkdownLoader";

/**
 * A composable hook that combines other modular hooks
 * to provide document management functionality
 */
export function useDocumentManager(onSelectFile: (path: string) => void) {
  const readingList = useReadingList();
  const readingHistory = useReadingHistory();

  const [availableDocuments, setAvailableDocuments] = useState<FileMetadata[]>(
    []
  );
  const [filteredDocuments, setFilteredDocuments] = useState<FileMetadata[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { analyticsController } = useServices();

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

        // Set available documents in analytics controller
        analyticsController.setAvailableDocuments(allFiles);
      } catch (error) {
        console.error("Error loading documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [analyticsController]);

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
    (path: string, title: string) => {
      // Add to reading history
      readingHistory.addToReadingHistory(path, title);

      // Mark as completed if in todo list
      const todoItem = readingList.todoList.find(
        (item) => item.path === path && !item.completed
      );
      if (todoItem) {
        readingList.toggleTodoCompletion(todoItem.id);
      }

      // Open the document
      onSelectFile(path);
    },
    [readingHistory, readingList, onSelectFile]
  );

  /**
   * Get a selection of trending documents (random selection for demo purposes)
   */
  const getTrendingDocuments = useCallback(() => {
    if (availableDocuments.length <= 5) return availableDocuments;

    // Shuffle array and take first 5
    return [...availableDocuments].sort(() => 0.5 - Math.random()).slice(0, 5);
  }, [availableDocuments]);

  return {
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
    isLoading: isLoading || readingHistory.isLoading || readingList.isLoading,
    error: readingHistory.error ?? readingList.error,
  };
}
