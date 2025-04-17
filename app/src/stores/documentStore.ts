import { create } from "zustand";
import {
  MarkdownLoader,
  type FileMetadata,
  type ParsedMarkdown,
} from "@/utils/MarkdownLoader";
import { useHistoryStore } from "@/stores/historyStore";
import { useReadingStore } from "@/stores/readingStore";
import { analyticsController } from "@/services/analytics/AnalyticsController";
import { sectionAnalyticsController } from "@/services/analytics/SectionAnalyticsController";
import { Category } from "@/utils/MarkdownLoader";
import { DocumentCache } from "@/services/cache/DocumentCache";

type State = {
  availableDocuments: FileMetadata[];
  filteredDocuments: FileMetadata[];
  selectedFile: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
};

type Actions = {
  setSearchQuery: (query: string) => void;
  selectFile: (path: string) => void;
  handleSelectDocument: (path: string, title: string) => Promise<void>;
  loadMarkdown: (path: string) => Promise<ParsedMarkdown | null>;
  getTrendingDocuments: () => Promise<FileMetadata[]>;
  initialize: () => Promise<void>;
};

/**
 * 📚 Document Store
 *
 * A central store for managing document-related state and actions.
 *
 * ✨ Features:
 * - Loads and filters available documents
 * - Handles document selection and navigation
 * - Tracks reading history and analytics
 * - Provides trending document recommendations
 *
 * 🔍 Use this store when you need to interact with documents,
 * search through available content, or track reading progress!
 */
export const useDocumentStore = create<State & Actions>((set, get) => ({
  /**
   * 📋 All documents available in the system
   */
  availableDocuments: [],

  /**
   * 🔎 Documents filtered by search query
   */
  filteredDocuments: [],

  /**
   * 📄 Currently selected document path
   */
  selectedFile: null,

  /**
   * 🔍 Current search query for filtering documents
   */
  searchQuery: "",

  /**
   * ⏳ Loading state indicator
   */
  isLoading: true,

  /**
   * ❌ Error message if something goes wrong
   */
  error: null,

  /**
   * 🔍 Filter documents based on search query
   * Makes finding the right document a breeze!
   */
  setSearchQuery: (query) => {
    set({ searchQuery: query });

    const { availableDocuments } = get();
    if (!query) {
      set({ filteredDocuments: availableDocuments });
      return;
    }

    const normalizedQuery = query.toLowerCase();
    const filtered = availableDocuments.filter(
      (doc) =>
        doc.title.toLowerCase().includes(normalizedQuery) ||
        doc.path.toLowerCase().includes(normalizedQuery)
    );

    set({ filteredDocuments: filtered });
  },

  /**
   * 📌 Select a document and update the URL
   * Makes navigation and bookmarking easy!
   */
  selectFile: (path) => {
    set({ selectedFile: path });

    if (typeof window !== "undefined") {
      const slug = path.endsWith(".md") ? path.slice(0, -3) : path;
      window.location.hash = slug;
    }
  },

  /**
   * 📖 Handle document selection with all side effects
   * Updates history, reading list, and analytics in one go!
   */
  handleSelectDocument: async (path, title) => {
    try {
      set({ isLoading: true });

      const historyStore = useHistoryStore.getState();
      await historyStore.addToReadingHistory(path, title);

      const readingStore = useReadingStore.getState();
      const todoItem = readingStore.todoList.find(
        (item) => item.path === path && !item.completed
      );

      if (todoItem) {
        await readingStore.toggleTodoCompletion(todoItem.id);
      }

      // Start a reading session
      await analyticsController.startReading(path, title);

      // Set the selected file
      get().selectFile(path);

      set({ isLoading: false, error: null });
    } catch (error) {
      console.error("Error selecting document:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Error selecting document",
      });
    }
  },

  /**
   * 📝 Load markdown content from a file
   * Fetches and parses documents for reading!
   */
  loadMarkdown: async (path) => {
    try {
      const documentCache = DocumentCache.getInstance();
      return documentCache.getDocument(path);
    } catch (error) {
      console.error(`Error loading markdown: ${path}`, error);
      set({
        error:
          error instanceof Error ? error.message : "Error loading markdown",
      });
      return null;
    }
  },

  /**
   * 🔥 Get trending documents based on reading history
   * Helps discover popular content!
   */
  getTrendingDocuments: async () => {
    try {
      const documentStats = await sectionAnalyticsController.getDocumentStats();

      // Sort by most recently read first
      const sortedStats = documentStats
        .filter((stat) => stat.lastReadAt)
        .sort((a, b) => b.lastReadAt - a.lastReadAt);

      // Get the corresponding document metadata
      const { availableDocuments } = get();
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
      const { availableDocuments } = get();
      if (availableDocuments.length <= 5) return availableDocuments;

      return [...availableDocuments]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
    }
  },

  /**
   * 🚀 Initialize the document store
   * Loads all documents and sets up initial state!
   */
  initialize: async () => {
    try {
      set({ isLoading: true });

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

      set({
        availableDocuments: allFiles,
        filteredDocuments: allFiles,
        isLoading: false,
        error: null,
      });

      // Set available documents in analytics controllers
      analyticsController.setAvailableDocuments(allFiles);

      // Check URL hash for initial document selection
      if (typeof window !== "undefined") {
        const hashParams = window.location.hash.substring(1);

        if (hashParams) {
          const matchingFile = allFiles.find((file) => {
            return (
              file.path === hashParams ||
              file.path === `${hashParams}.md` ||
              file.path.split("/").pop()?.replace(".md", "") === hashParams
            );
          });

          if (matchingFile) {
            set({ selectedFile: matchingFile.path });
          }
        }
      }
    } catch (error) {
      console.error("Error initializing document store:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Error loading documents",
      });
    }
  },
}));
