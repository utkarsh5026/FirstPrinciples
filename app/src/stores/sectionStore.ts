import { create } from "zustand";
import { sectionReadingService } from "@/services/section/SectionReadingService";
import type { LoadingWithError } from "./base/base";
import { parseError } from "@/utils/error";

// Store current reading state in memory only
type ReadingState = {
  currentSectionId: string | null;
  documentPath: string | null;
  startTime: number | null;
  readSections: Set<string>; // Set of section IDs that have been read
};

// Store state
type StoreState = LoadingWithError & {
  readingState: ReadingState;
  isInitialized: boolean;
};

interface StoreActions {
  initialize: () => Promise<void>;
  startReading: (documentPath: string, sectionId: string) => Promise<void>;
  endReading: () => Promise<void>;
  isSectionRead: (sectionId: string) => boolean;
  getReadSections: () => string[];
  loadReadSections: (documentPath: string) => Promise<void>;
  getDocumentCompletionPercentage: (
    documentPath: string,
    totalSections: number
  ) => Promise<number>;
}

/**
 * Section store that uses SectionReadingService for persistence
 *
 * This store:
 * - Marks sections as read immediately when opened
 * - Records time spent on each section
 * - Uses SectionReadingService to interact with IndexedDB
 */
/**
 * 📚 Section Store
 *
 * Your friendly reading tracker! ✨
 *
 * This store is like your personal reading assistant that remembers:
 * - Which sections you've already read 👀
 * - How much time you've spent on each section ⏱️
 * - Your overall progress through documents 📊
 *
 * It quietly works in the background, storing your reading progress
 * so you can pick up right where you left off!
 */
export const useSectionStore = create<StoreState & StoreActions>((set, get) => {
  return {
    // Initial state
    readingState: {
      currentSectionId: null,
      documentPath: null,
      startTime: null,
      readSections: new Set<string>(),
    },
    isInitialized: false,
    loading: false,
    error: null,

    /**
     * 🚀 Initialize the store
     *
     * Gets everything ready to track your reading journey!
     */
    initialize: async () => {
      try {
        set({ loading: true });
        await sectionReadingService.initialize();

        set({ isInitialized: true, loading: false, error: null });
      } catch (error) {
        console.error("Error initializing section store:", error);
        set({
          loading: false,
          error: parseError(error, "Failed to initialize section store"),
        });
      }
    },

    /**
     * 📖 Start reading a section
     *
     * Marks the beginning of your adventure in a new section!
     * Remembers where you are and when you started reading.
     */
    startReading: async (documentPath, sectionId) => {
      try {
        const currentState = get().readingState;
        if (currentState.currentSectionId && currentState.startTime) {
          const timeSpent = Date.now() - currentState.startTime;

          // Record the reading session
          if (currentState.documentPath) {
            await sectionReadingService.recordSectionReading(
              currentState.documentPath,
              currentState.currentSectionId,
              timeSpent
            );
          }
        }

        // Start new reading session
        set((state) => {
          const newReadSections = new Set(state.readingState.readSections);
          newReadSections.add(sectionId);

          return {
            readingState: {
              currentSectionId: sectionId,
              documentPath,
              startTime: Date.now(),
              readSections: newReadSections,
            },
            error: null,
          };
        });
      } catch (error) {
        console.error("Error starting section reading:", error);
        set({ error: parseError(error, "Failed to start reading section") });
      }
    },

    /**
     * 🏁 End the reading session
     *
     * Wraps up your current reading adventure and saves your progress!
     * Like placing a bookmark before closing a book. ✨
     */
    endReading: async () => {
      try {
        const { currentSectionId, documentPath, startTime } =
          get().readingState;

        if (currentSectionId && documentPath && startTime) {
          // Calculate time spent
          const timeSpent = Date.now() - startTime;

          // Record to the database if significant time was spent
          await sectionReadingService.recordSectionReading(
            documentPath,
            currentSectionId,
            timeSpent
          );

          // Reset current reading state
          set((state) => ({
            readingState: {
              ...state.readingState,
              currentSectionId: null,
              documentPath: null,
              startTime: null,
            },
          }));
        }
      } catch (error) {
        console.error("Error ending section reading:", error);
        set({
          error: parseError(error, "Failed to end reading section"),
        });
      }
    },

    /**
     * 👀 Check if a section has been read
     *
     * A quick peek to see if you've already visited this section!
     * Like checking if you've already seen that episode. 🍿
     */
    isSectionRead: (sectionId) => {
      return get().readingState.readSections.has(sectionId);
    },

    /**
     * 📋 Get all read sections
     *
     * Gives you a list of all the sections you've already explored!
     * Like checking your travel history. 🗺️
     */
    getReadSections: () => {
      return Array.from(get().readingState.readSections);
    },

    /**
     * 🔄 Load read sections
     *
     * Fetches your reading history for a document from the database!
     * Like finding all your old bookmarks. 📚
     */
    loadReadSections: async (documentPath) => {
      try {
        set({ loading: true });

        // Get read sections from the service
        const readSections = await sectionReadingService.getReadSections(
          documentPath
        );

        // Update state with read sections
        set((state) => ({
          readingState: {
            ...state.readingState,
            readSections,
          },
          loading: false,
          error: null,
        }));
      } catch (error) {
        console.error("Error loading read sections:", error);
        set({
          loading: false,
          error: parseError(error, "Failed to load read sections"),
        });
      }
    },

    /**
     * 📊 Get completion percentage
     *
     * Shows how much of the document you've already read!
     * Like a progress bar for your reading journey. 🏆
     */
    getDocumentCompletionPercentage: async (documentPath, totalSections) => {
      try {
        return await sectionReadingService.getCompletionPercentage(
          documentPath,
          totalSections
        );
      } catch (error) {
        console.error("Error calculating completion percentage:", error);
        set({
          error: parseError(error, "Failed to calculate completion"),
        });
        return 0;
      }
    },
  };
});
