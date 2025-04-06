import { useState, useEffect, useCallback } from "react";
import { MarkdownLoader, FileMetadata } from "@/utils/MarkdownLoader";

/**
 * A type representing a reading history item
 */
export interface ReadingHistoryItem {
  path: string;
  title: string;
  lastReadAt: number; // timestamp
  readCount: number;
}

/**
 * A type representing a reading todo item
 */
export interface ReadingTodoItem {
  id: string;
  path: string;
  title: string;
  addedAt: number; // timestamp
  completed: boolean;
}

/**
 * Interface defining the return type of the useDocumentManager hook
 */
interface DocumentManagerReturn {
  // Reading history
  readingHistory: ReadingHistoryItem[];
  addToReadingHistory: (path: string, title: string) => void;
  clearReadingHistory: () => void;

  // Todo list
  todoList: ReadingTodoItem[];
  addToTodoList: (path: string, title: string) => void;
  removeFromTodoList: (id: string) => void;
  toggleTodoCompletion: (id: string) => void;
  clearTodoList: () => void;

  // Available documents
  availableDocuments: FileMetadata[];
  filteredDocuments: FileMetadata[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Document selection
  handleSelectDocument: (path: string, title: string) => void;

  // Date formatting helper
  formatDate: (timestamp: number) => string;

  // Trending documents
  getTrendingDocuments: () => FileMetadata[];

  // Loading states
  isLoading: boolean;
}

/**
 * Custom hook to manage all document-related functionality including reading history,
 * todo list, document search, and document selection.
 *
 * @param onSelectFile - Callback function to handle document selection
 * @returns Object containing all document management state and functions
 */
export function useDocumentManager(
  onSelectFile: (path: string) => void
): DocumentManagerReturn {
  // State for reading history
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>(
    []
  );

  // State for todo list
  const [todoList, setTodoList] = useState<ReadingTodoItem[]>([]);

  // State for available documents
  const [availableDocuments, setAvailableDocuments] = useState<FileMetadata[]>(
    []
  );

  // State for filtered documents when searching
  const [filteredDocuments, setFilteredDocuments] = useState<FileMetadata[]>(
    []
  );

  // State for search query
  const [searchQuery, setSearchQuery] = useState("");

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load reading history and todo list from localStorage
   */
  useEffect(() => {
    // Load reading history
    const storedHistory = localStorage.getItem("readingHistory");
    if (storedHistory) {
      try {
        setReadingHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error("Error parsing reading history:", error);
      }
    }

    // Load todo list
    const storedTodoList = localStorage.getItem("readingTodoList");
    if (storedTodoList) {
      try {
        setTodoList(JSON.parse(storedTodoList));
      } catch (error) {
        console.error("Error parsing todo list:", error);
      }
    }
  }, []);

  /**
   * Load available documents from content index
   */
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        // Load the content index to get all available files
        const contentIndex = await MarkdownLoader.loadContentIndex();

        // Collect all files from root and categories
        const allFiles: FileMetadata[] = [...contentIndex.files];

        // Function to recursively collect files from categories
        const collectFilesFromCategories = (categories: any[]) => {
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
      } catch (error) {
        console.error("Error loading documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  /**
   * Save reading history to localStorage whenever it changes
   */
  useEffect(() => {
    localStorage.setItem("readingHistory", JSON.stringify(readingHistory));
  }, [readingHistory]);

  /**
   * Save todo list to localStorage whenever it changes
   */
  useEffect(() => {
    localStorage.setItem("readingTodoList", JSON.stringify(todoList));
  }, [todoList]);

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
   * Add a document to reading history
   */
  const addToReadingHistory = useCallback((path: string, title: string) => {
    const now = Date.now();

    setReadingHistory((prevHistory) => {
      // Check if already in history
      const existingIndex = prevHistory.findIndex((item) => item.path === path);

      if (existingIndex >= 0) {
        // Update existing entry
        const updatedHistory = [...prevHistory];
        updatedHistory[existingIndex] = {
          ...updatedHistory[existingIndex],
          lastReadAt: now,
          readCount: updatedHistory[existingIndex].readCount + 1,
        };

        // Move to top of history
        const [updated] = updatedHistory.splice(existingIndex, 1);
        return [updated, ...updatedHistory];
      } else {
        // Add new entry
        return [
          {
            path,
            title,
            lastReadAt: now,
            readCount: 1,
          },
          ...prevHistory.slice(0, 9), // Keep only the 10 most recent
        ];
      }
    });
  }, []);

  /**
   * Clear all reading history
   */
  const clearReadingHistory = useCallback(() => {
    if (confirm("Are you sure you want to clear your reading history?")) {
      setReadingHistory([]);
    }
  }, []);

  /**
   * Add a document to the todo list
   */
  const addToTodoList = useCallback(
    (path: string, title: string) => {
      // Check if already in todo list
      const isAlreadyInList = todoList.some((item) => item.path === path);

      if (!isAlreadyInList) {
        setTodoList((prevList) => [
          ...prevList,
          {
            id: crypto.randomUUID(),
            path,
            title,
            addedAt: Date.now(),
            completed: false,
          },
        ]);
        return true;
      }

      return false;
    },
    [todoList]
  );

  /**
   * Remove a document from the todo list
   */
  const removeFromTodoList = useCallback((id: string) => {
    setTodoList((prevList) => prevList.filter((item) => item.id !== id));
  }, []);

  /**
   * Toggle completion status of a todo item
   */
  const toggleTodoCompletion = useCallback((id: string) => {
    setTodoList((prevList) =>
      prevList.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }, []);

  /**
   * Clear the entire todo list
   */
  const clearTodoList = useCallback(() => {
    if (confirm("Are you sure you want to clear your reading list?")) {
      setTodoList([]);
    }
  }, []);

  /**
   * Handle selecting a document to read
   */
  const handleSelectDocument = useCallback(
    (path: string, title: string) => {
      // Add to reading history
      addToReadingHistory(path, title);

      // Mark as completed if in todo list
      setTodoList((prevList) =>
        prevList.map((item) =>
          item.path === path ? { ...item, completed: true } : item
        )
      );

      // Open the document
      onSelectFile(path);
    },
    [addToReadingHistory, onSelectFile]
  );

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

  /**
   * Get a selection of trending documents (random selection for demo purposes)
   */
  const getTrendingDocuments = useCallback(() => {
    if (availableDocuments.length <= 5) return availableDocuments;

    // Shuffle array and take first 5
    return [...availableDocuments].sort(() => 0.5 - Math.random()).slice(0, 5);
  }, [availableDocuments]);

  // Return all document management state and functions
  return {
    readingHistory,
    addToReadingHistory,
    clearReadingHistory,

    todoList,
    addToTodoList,
    removeFromTodoList,
    toggleTodoCompletion,
    clearTodoList,

    availableDocuments,
    filteredDocuments,
    searchQuery,
    setSearchQuery,

    handleSelectDocument,
    formatDate,
    getTrendingDocuments,

    isLoading,
  };
}

export default useDocumentManager;
