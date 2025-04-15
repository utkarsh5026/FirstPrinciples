import { create } from "zustand";
import { sectionReadingService } from "../services/section/SectionReadingService";

// Store current reading state in memory only
interface ReadingState {
  currentSectionId: string | null;
  documentPath: string | null;
  startTime: number | null;
  readSections: Set<string>; // Set of section IDs that have been read
}

// Store state
interface StoreState {
  readingState: ReadingState;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

// Store actions
interface StoreActions {
  // Initialize the store
  initialize: () => Promise<void>;
  // Start tracking when a section is opened
  startReading: (documentPath: string, sectionId: string) => Promise<void>;
  // End tracking when user navigates away
  endReading: () => Promise<void>;
  // Check if a section has been read
  isSectionRead: (sectionId: string) => boolean;
  // Get all read sections
  getReadSections: () => string[];
  // Load read sections for a document
  loadReadSections: (documentPath: string) => Promise<void>;
  // Get document completion percentage
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
    isLoading: false,
    error: null,

    /**
     * Initialize the store and the service
     */
    initialize: async () => {
      try {
        set({ isLoading: true });

        // Initialize the section reading service
        await sectionReadingService.initialize();

        set({ isInitialized: true, isLoading: false, error: null });
      } catch (error) {
        console.error("Error initializing section store:", error);
        set({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to initialize section store",
        });
      }
    },

    /**
     * Start reading a section
     * - Mark it as read immediately
     * - Store the start time
     */
    startReading: async (documentPath, sectionId) => {
      try {
        // First, end any current reading session
        const currentState = get().readingState;
        if (currentState.currentSectionId && currentState.startTime) {
          // Calculate time spent
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
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to start reading section",
        });
      }
    },

    /**
     * End the current reading session
     * - Calculate time spent
     * - Record to database via service
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
          error:
            error instanceof Error
              ? error.message
              : "Failed to end reading section",
        });
      }
    },

    /**
     * Check if a section has been read locally
     * - Only checks the in-memory state, not the database
     */
    isSectionRead: (sectionId) => {
      return get().readingState.readSections.has(sectionId);
    },

    /**
     * Get all read sections from memory
     */
    getReadSections: () => {
      return Array.from(get().readingState.readSections);
    },

    /**
     * Load read sections for a document from the database
     */
    loadReadSections: async (documentPath) => {
      try {
        set({ isLoading: true });

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
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        console.error("Error loading read sections:", error);
        set({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load read sections",
        });
      }
    },

    /**
     * Get document completion percentage from the service
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
          error:
            error instanceof Error
              ? error.message
              : "Failed to calculate completion",
        });
        return 0;
      }
    },
  };
});
