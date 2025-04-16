import { create } from "zustand";
import { sectionReadingService } from "@/services/section/SectionReadingService";
import type { LoadingWithError } from "./base/base";
import { parseError } from "@/utils/error";
import { useHistoryStore } from "./historyStore";

/**
 * Enhanced SectionReadingData with category and word count
 */
export type EnhancedSectionReadingData = {
  id?: IDBValidKey; // Auto-generated unique ID
  documentPath: string; // Path to the document
  sectionId: string; // ID of the specific section
  sectionTitle: string; // Title of the section
  category: string; // Category of the document
  wordCount: number; // Number of words in the section
  timeSpent: number; // Time spent reading (milliseconds)
  lastReadAt: number; // Timestamp when section was read
  isComplete: boolean; // Whether section was completed
};

// Store current reading state in memory only
type ReadingState = {
  currentSectionId: string | null;
  sectionTitle: string | null;
  documentPath: string | null;
  category: string | null; // Added category
  wordCount: number | null; // Added word count
  startTime: number | null;
  readSections: Set<string>; // Set of section IDs that have been read
};

// Store state
type StoreState = LoadingWithError & {
  readingState: ReadingState;
  categoryStats: Record<string, CategoryStats>;
  isInitialized: boolean;
};

/**
 * Stats for each category
 */
type CategoryStats = {
  totalTimeSpent: number;
  totalWordsRead: number;
  documentCount: number;
  lastReadAt: number;
};

interface StoreActions {
  initialize: () => Promise<void>;

  // Enhanced actions with category and word count
  startReading: (
    documentPath: string,
    sectionId: string,
    category: string,
    wordCount: number,
    sectionTitle?: string
  ) => Promise<void>;

  endReading: () => Promise<void>;
  isSectionRead: (sectionId: string) => boolean;
  getReadSections: () => string[];
  loadReadSections: (documentPath: string) => Promise<void>;

  // Document progress tracking
  getDocumentCompletionPercentage: (
    documentPath: string,
    totalSections: number
  ) => Promise<number>;

  // Word count and time tracking
  getTotalWordsRead: (wordCountMap: Record<string, number>) => Promise<number>;
  getTotalTimeSpent: () => Promise<number>;
  getTimeSpentOnDay: (date: Date) => Promise<number>;

  // Category-based analytics
  getReadingsByCategory: (
    category: string
  ) => Promise<EnhancedSectionReadingData[]>;
  getCategoryStats: () => Promise<Record<string, CategoryStats>>;

  // Reading speed analytics
  getReadingSpeed: () => Promise<number>;

  // Daily reading stats for charts
  getDailyReadingStats: (days: number) => Promise<
    Array<{
      date: string;
      timeSpent: number;
      wordsRead: number;
    }>
  >;
}

/**
 * Enhanced section store that supports category-based tracking and word counts
 */
export const useSectionStore = create<StoreState & StoreActions>((set, get) => {
  return {
    // Initial state
    readingState: {
      currentSectionId: null,
      sectionTitle: null,
      documentPath: null,
      category: null,
      wordCount: null,
      startTime: null,
      readSections: new Set<string>(),
    },
    categoryStats: {},
    isInitialized: false,
    loading: false,
    error: null,

    /**
     * Initialize the store and database
     */
    initialize: async () => {
      try {
        set({ loading: true });
        await sectionReadingService.initialize();

        // Load category stats
        const categoryStats = await get().getCategoryStats();

        set({
          isInitialized: true,
          categoryStats,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error initializing section store:", error);
        set({
          loading: false,
          error: parseError(error, "Failed to initialize section store"),
        });
      }
    },

    /**
     * Start reading a section with category and word count
     */
    startReading: async (
      documentPath,
      sectionId,
      category,
      wordCount,
      sectionTitle = "Untitled Section"
    ) => {
      try {
        const currentState = get().readingState;
        const addToHistory = useHistoryStore.getState().addToReadingHistory;

        // End previous reading session if one exists
        if (currentState.currentSectionId && currentState.startTime) {
          const timeSpent = Date.now() - currentState.startTime;

          // Record the previous reading session
          if (
            currentState.documentPath &&
            currentState.category !== null &&
            currentState.wordCount !== null &&
            currentState.sectionTitle !== null
          ) {
            await sectionReadingService.recordSectionReading(
              currentState.documentPath,
              currentState.currentSectionId,
              currentState.sectionTitle,
              currentState.category,
              currentState.wordCount,
              timeSpent,
              true
            );

            await addToHistory(documentPath, sectionTitle);
          }
        }

        // Start new reading session
        set((state) => {
          const newReadSections = new Set(state.readingState.readSections);
          newReadSections.add(sectionId);

          return {
            readingState: {
              currentSectionId: sectionId,
              sectionTitle: sectionTitle,
              documentPath,
              category,
              wordCount,
              startTime: Date.now(),
              readSections: newReadSections,
            },
            error: null,
          };
        });

        // Update category stats
        await get().getCategoryStats();
      } catch (error) {
        console.error("Error starting section reading:", error);
        set({ error: parseError(error, "Failed to start reading section") });
      }
    },

    /**
     * End the current reading session
     */
    endReading: async () => {
      try {
        const {
          currentSectionId,
          documentPath,
          category,
          wordCount,
          sectionTitle,
          startTime,
        } = get().readingState;

        if (
          currentSectionId &&
          documentPath &&
          category &&
          wordCount !== null &&
          sectionTitle &&
          startTime
        ) {
          // Calculate time spent
          const timeSpent = Date.now() - startTime;

          // Record to the database if significant time was spent
          await sectionReadingService.recordSectionReading(
            documentPath,
            currentSectionId,
            sectionTitle,
            category,
            wordCount,
            timeSpent,
            true // Mark as complete
          );

          // Reset current reading state
          set((state) => ({
            readingState: {
              ...state.readingState,
              currentSectionId: null,
              sectionTitle: null,
              documentPath: null,
              category: null,
              wordCount: null,
              startTime: null,
            },
          }));

          // Update category stats
          await get().getCategoryStats();
        }
      } catch (error) {
        console.error("Error ending section reading:", error);
        set({
          error: parseError(error, "Failed to end reading section"),
        });
      }
    },

    /**
     * Check if a section has been read
     */
    isSectionRead: (sectionId) => {
      return get().readingState.readSections.has(sectionId);
    },

    /**
     * Get all read sections
     */
    getReadSections: () => {
      return Array.from(get().readingState.readSections);
    },

    /**
     * Load read sections for a document
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
     * Get document completion percentage
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

    /**
     * Calculate total words read across all documents
     */
    getTotalWordsRead: async (wordCountMap) => {
      try {
        const allReadings = await sectionReadingService.getAllReadings();

        // Extract unique section IDs that have been read and marked complete
        const readSectionIds = new Set<string>();
        allReadings
          .filter((reading) => reading.isComplete)
          .forEach((reading) => readSectionIds.add(reading.sectionId));

        // Sum up word counts for all read sections
        let totalWords = 0;

        // If wordCountMap is provided, use it for sections in the map
        if (wordCountMap) {
          for (const sectionId of readSectionIds) {
            if (wordCountMap[sectionId]) {
              totalWords += wordCountMap[sectionId];
            } else {
              // For sections not in the map, use the word count from the reading data
              const sectionReadings = allReadings.filter(
                (r) => r.sectionId === sectionId && r.isComplete
              );
              if (sectionReadings.length > 0) {
                totalWords += sectionReadings[0].wordCount || 0;
              }
            }
          }
        } else {
          // If no map provided, use the word counts from the reading data
          for (const reading of allReadings.filter((r) => r.isComplete)) {
            totalWords += reading.wordCount || 0;
          }
        }

        return totalWords;
      } catch (error) {
        console.error("Error calculating total words read:", error);
        set({
          error: parseError(error, "Failed to calculate total words read"),
        });
        return 0;
      }
    },

    /**
     * Calculate total time spent reading
     */
    getTotalTimeSpent: async () => {
      try {
        const allReadings = await sectionReadingService.getAllReadings();
        return allReadings.reduce(
          (total, reading) => total + reading.timeSpent,
          0
        );
      } catch (error) {
        console.error("Error calculating total time spent:", error);
        set({
          error: parseError(error, "Failed to calculate total time spent"),
        });
        return 0;
      }
    },

    /**
     * Calculate time spent reading on a specific day
     */
    getTimeSpentOnDay: async (date) => {
      try {
        // Create date range for the specified day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Get all readings and filter by date
        const allReadings = await sectionReadingService.getAllReadings();

        return allReadings
          .filter((reading) => {
            const readDate = new Date(reading.lastReadAt);
            return readDate >= startOfDay && readDate <= endOfDay;
          })
          .reduce((total, reading) => total + reading.timeSpent, 0);
      } catch (error) {
        console.error("Error calculating time spent on day:", error);
        set({
          error: parseError(error, "Failed to calculate time spent on day"),
        });
        return 0;
      }
    },

    /**
     * Get readings by category
     */
    getReadingsByCategory: async (category) => {
      try {
        const allReadings = await sectionReadingService.getAllReadings();
        return allReadings.filter((reading) => reading.category === category);
      } catch (error) {
        console.error("Error getting readings by category:", error);
        set({
          error: parseError(error, "Failed to get readings by category"),
        });
        return [];
      }
    },

    /**
     * Get stats for all categories
     */
    getCategoryStats: async () => {
      try {
        const allReadings = await sectionReadingService.getAllReadings();

        // Create map of category stats
        const categoryMap: Record<string, CategoryStats> = {};

        // Process each reading
        allReadings.forEach((reading) => {
          const { category, timeSpent, wordCount, isComplete, lastReadAt } =
            reading;

          if (!category) return;

          if (!categoryMap[category]) {
            categoryMap[category] = {
              totalTimeSpent: 0,
              totalWordsRead: 0,
              documentCount: 0,
              lastReadAt: 0,
            };
          }

          const stats = categoryMap[category];
          stats.totalTimeSpent += timeSpent;
          stats.lastReadAt = Math.max(stats.lastReadAt, lastReadAt);

          if (isComplete) {
            stats.totalWordsRead += wordCount || 0;
          }

          // Count unique documents per category (using a Set internally)
          const docSet = new Set<string>();
          allReadings
            .filter((r) => r.category === category)
            .forEach((r) => docSet.add(r.documentPath));

          stats.documentCount = docSet.size;
        });

        // Update state with category stats
        set({ categoryStats: categoryMap });

        return categoryMap;
      } catch (error) {
        console.error("Error getting category stats:", error);
        set({
          error: parseError(error, "Failed to get category stats"),
        });
        return {};
      }
    },

    /**
     * Calculate average reading speed (words per minute)
     */
    getReadingSpeed: async () => {
      try {
        const allReadings = await sectionReadingService.getAllReadings();

        // Sum up words and time
        let totalWords = 0;
        let totalTime = 0; // In milliseconds

        allReadings
          .filter((reading) => reading.isComplete && reading.wordCount)
          .forEach((reading) => {
            totalWords += reading.wordCount || 0;
            totalTime += reading.timeSpent;
          });

        // Calculate WPM
        const minutes = totalTime / (1000 * 60);
        return minutes > 0 ? Math.round(totalWords / minutes) : 0;
      } catch (error) {
        console.error("Error calculating reading speed:", error);
        set({
          error: parseError(error, "Failed to calculate reading speed"),
        });
        return 0;
      }
    },

    /**
     * Get daily reading stats for charts
     */
    getDailyReadingStats: async (days = 7) => {
      try {
        // Create date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days - 1));

        // Initialize daily stats
        const dailyStats: Record<
          string,
          { timeSpent: number; wordsRead: number }
        > = {};

        // Fill with zero values for all days in the range
        for (let i = 0; i < days; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const dateKey = date.toISOString().split("T")[0];
          dailyStats[dateKey] = { timeSpent: 0, wordsRead: 0 };
        }

        // Get all readings
        const allReadings = await sectionReadingService.getAllReadings();

        // Group by day
        allReadings.forEach((reading) => {
          const readDate = new Date(reading.lastReadAt);
          // Only include readings within our date range
          if (readDate >= startDate && readDate <= endDate) {
            const dateKey = readDate.toISOString().split("T")[0];

            // Initialize if needed
            if (!dailyStats[dateKey]) {
              dailyStats[dateKey] = { timeSpent: 0, wordsRead: 0 };
            }

            // Add time spent
            dailyStats[dateKey].timeSpent += reading.timeSpent;

            // Add words read (only for completed sections)
            if (reading.isComplete) {
              dailyStats[dateKey].wordsRead += reading.wordCount || 0;
            }
          }
        });

        // Convert to array format
        return Object.entries(dailyStats)
          .map(([date, stats]) => ({
            date,
            timeSpent: stats.timeSpent,
            wordsRead: stats.wordsRead,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
      } catch (error) {
        console.error("Error getting daily reading stats:", error);
        set({
          error: parseError(error, "Failed to get daily reading stats"),
        });
        return [];
      }
    },
  };
});
