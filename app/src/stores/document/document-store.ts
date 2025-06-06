import { create } from "zustand";
import { useHistoryStore } from "@/stores/reading/history-store";
import { useReadingStore } from "@/stores/reading/reading-store";
import {
  loadContentIndex,
  getFileBreadcrumbs,
  type ContentIndex,
  type Category,
  type FileMetadata,
  type ParsedMarkdown,
  DocumentCache,
} from "@/services/document";
import { LoadingWithError } from "@/stores/base/base";
import { parseError } from "@/utils/error";

export type Document = Omit<Category, "categories"> & {
  readFiles: Array<string>;
  todoFiles: Array<string>;
  documents: Array<Document>;
};

type State = LoadingWithError & {
  fileMap: Record<string, FileMetadata>;
  contentIndex: ContentIndex;
  selectedFile: string | null;
  docs: Document[];
};

type Actions = {
  selectFile: (path: string) => void;
  handleSelectDocument: (path: string, title: string) => Promise<void>;
  loadMarkdown: (path: string) => Promise<ParsedMarkdown | null>;
  initialize: () => Promise<void>;
  loadContentIndex: () => Promise<ContentIndex>;
  getFileBreadcrumbs: (
    path: string
  ) => Promise<{ id: string; name: string; icon?: string }[]>;
  updateDocs: () => void;
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
export const useDocumentStore = create<State & Actions>((set, get) => {
  useHistoryStore.subscribe(async () => {
    try {
      get().updateDocs();
    } catch (error) {
      set({ error: parseError(error) });
    }
  });

  useReadingStore.subscribe(async () => {
    try {
      get().updateDocs();
    } catch (error) {
      set({ error: parseError(error) });
    }
  });

  return {
    fileMap: {},
    selectedFile: null,
    loading: true,
    error: null,
    contentIndex: {
      categories: [],
      files: [],
    },
    docs: [],

    /**
     * 🔄 Update docs when reading history or to-do list changes
     * Keeps document list in sync with user's reading progress!
     */
    updateDocs: () => {
      const { contentIndex } = get();
      if (!contentIndex.categories) return;

      const todoFiles = useReadingStore
        .getState()
        .todoList.map(({ path }) => path);
      const readFiles = useHistoryStore
        .getState()
        .readingHistory.map(({ path }) => path);

      set({
        docs: contentIndex.categories.map((category) =>
          createDocument(category, todoFiles, readFiles)
        ),
      });
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
        set({ loading: true });

        const historyStore = useHistoryStore.getState();
        await historyStore.addToReadingHistory(path, title);

        const readingStore = useReadingStore.getState();
        const todoItem = readingStore.todoList.find(
          (item) => item.path === path && !item.completed
        );

        if (todoItem) {
          await readingStore.toggleTodoCompletion(todoItem.id);
        }

        // Set the selected file
        get().selectFile(path);

        set({ loading: false, error: null });
      } catch (error) {
        console.error("Error selecting document:", error);
        set({
          loading: false,
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
     * 🚀 Initialize the document store
     * Loads all documents and sets up initial state!
     */
    initialize: async () => {
      try {
        set({ loading: true });

        const contentIndex = await loadContentIndex();
        const allFiles: FileMetadata[] = [...contentIndex.files];

        const collectFilesFromCategories = (categories: Category[]) => {
          categories.forEach((category) => {
            if (category.files) {
              allFiles.push(...category.files);
            }

            if (category.categories) {
              collectFilesFromCategories(category.categories);
            }
          });
        };

        collectFilesFromCategories(contentIndex.categories || []);

        const fileMap = allFiles.reduce((acc, file) => {
          acc[file.path] = file;
          return acc;
        }, {} as Record<string, FileMetadata>);

        const todoFiles = useReadingStore
          .getState()
          .todoList.map(({ path }) => path);
        const readFiles = useHistoryStore
          .getState()
          .readingHistory.map(({ path }) => path);

        set({
          loading: false,
          error: null,
          contentIndex,
          fileMap,
          docs: contentIndex.categories.map((category) =>
            createDocument(category, todoFiles, readFiles)
          ),
        });

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
        set({
          loading: false,
          error: parseError(error),
        });
      }
    },

    /**
     * 📄 Load the content index
     * Fetches and parses the content index for all documents
     */
    loadContentIndex: async () => {
      return await loadContentIndex();
    },

    /**
     * 📚 Get breadcrumbs for a file
     * Returns the breadcrumbs for a given file path
     */
    getFileBreadcrumbs: async (path) => {
      return await getFileBreadcrumbs(path, get().contentIndex);
    },
  };
});

const createDocument = (
  category: Category,
  allTodoFiles: string[],
  allReadFiles: string[]
) => {
  const todoFiles = allTodoFiles.filter((path) =>
    path.startsWith(category.path)
  );

  const readFiles = allReadFiles.filter((path) =>
    path.startsWith(category.path)
  );

  const document: Document = {
    ...category,
    todoFiles,
    readFiles,
    documents: [],
  };

  category.categories?.forEach((subCategory) => {
    const subDocument = createDocument(subCategory, todoFiles, readFiles);
    document.documents.push(subDocument);
  });

  return document;
};
