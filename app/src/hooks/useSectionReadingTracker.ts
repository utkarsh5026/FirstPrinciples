import { useState, useEffect, useRef, useCallback } from "react";
import { sectionReadingTracker } from "@/services/analytics/SectionReadingTracker";
import { sectionAnalyticsController } from "@/services/analytics/SectionAnalyticsController";
import { analyticsController } from "../services/analytics/AnalyticsController";

export interface SectionData {
  id: string;
  title: string;
  content: string;
  level?: number;
}

interface SectionReadingState {
  documentPath: string;
  documentTitle: string;
  currentSectionIndex: number;
  sections: SectionData[];
  readSections: Set<string>;
  sectionProgress: Map<string, number>;
  isTracking: boolean;
}

/**
 * 📚 Section Reading Tracker Hook
 *
 * This smart hook helps track a user's reading progress through document sections!
 *
 * ✨ What it does:
 * - Tracks which sections a user has read in a document
 * - Remembers where they left off between sessions
 * - Calculates reading progress for each section
 * - Provides navigation between sections
 * - Stores reading data for analytics
 *
 * 🧠 Perfect for building interactive reading experiences with progress tracking,
 * "mark as read" functionality, and seamless navigation between document sections.
 *
 * 💾 Automatically saves progress to localStorage and the analytics database
 * so users never lose their place!
 */
export function useSectionReadingTracker(
  documentPath: string,
  documentTitle: string,
  sections: SectionData[],
  initialSectionIndex: number = 0
) {
  // State for tracking reading progress
  /**
   * 📚 Reading State Management
   * Tracks the user's progress through document sections with smart persistence
   */
  const [readingState, setReadingState] = useState<SectionReadingState>({
    documentPath,
    documentTitle,
    currentSectionIndex: initialSectionIndex,
    sections,
    readSections: new Set<string>(),
    sectionProgress: new Map<string, number>(),
    isTracking: false,
  });

  /**
   * ⏱️ Progress Tracking Timer
   * Keeps track of the interval that updates reading progress
   */
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 🔄 Initialize Reading State
   * Loads saved progress from localStorage and sets up analytics tracking
   * when the component mounts. Handles cleanup when unmounting.
   */
  useEffect(() => {
    try {
      const storedReadSections = localStorage.getItem(
        `readSections_${documentPath}`
      );
      if (storedReadSections) {
        const parsedSections = JSON.parse(storedReadSections);
        setReadingState((prev) => ({
          ...prev,
          readSections: new Set(parsedSections),
        }));
      }

      // Load last read position
      const storedPosition = localStorage.getItem(
        `lastReadPosition_${documentPath}`
      );
      if (storedPosition) {
        const position = parseInt(storedPosition, 10);
        if (!isNaN(position) && position >= 0 && position < sections.length) {
          setReadingState((prev) => ({
            ...prev,
            currentSectionIndex: position,
          }));
        }
      }
    } catch (error) {
      console.error("Error loading section reading state:", error);
    }
    analyticsController.startReading(documentPath, documentTitle);

    // Clean up on unmount
    return () => {
      // End document reading session
      analyticsController.endReading(documentPath, documentTitle);

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // End any active section tracking
      sectionReadingTracker.endSectionReading();
    };
  }, [documentPath, documentTitle, sections]);

  /**
   * 🚀 Begin Section Tracking
   * Starts monitoring user's reading progress for the current section.
   * Sets up periodic checks to update progress and mark sections as read.
   */
  const startSectionTracking = useCallback(() => {
    if (readingState.isTracking) return;

    const { currentSectionIndex, sections, documentPath } = readingState;
    const currentSection = sections[currentSectionIndex];

    if (!currentSection) return;

    sectionReadingTracker.startSectionReading(
      documentPath,
      currentSection.id,
      currentSection.title,
      currentSectionIndex,
      currentSection.content
    );

    // Set up interval to update progress
    progressIntervalRef.current = setInterval(() => {
      const progress = sectionReadingTracker.checkSectionProgress();

      // Update progress map
      setReadingState((prev) => {
        const newProgress = new Map(prev.sectionProgress);
        newProgress.set(currentSection.id, progress);

        // If progress reaches 100%, mark section as read
        let newReadSections = prev.readSections;
        if (progress >= 100 && !prev.readSections.has(currentSection.id)) {
          newReadSections = new Set(prev.readSections);
          newReadSections.add(currentSection.id);

          // Save to localStorage
          localStorage.setItem(
            `readSections_${documentPath}`,
            JSON.stringify([...newReadSections])
          );
        }

        return {
          ...prev,
          sectionProgress: newProgress,
          readSections: newReadSections,
        };
      });
    }, 3000);

    setReadingState((prev) => ({
      ...prev,
      isTracking: true,
    }));
  }, [readingState]);

  /**
   * 🛑 End Section Tracking
   * Stops monitoring the current section and optionally marks it as complete.
   * Cleans up timers and updates the reading state.
   */
  const stopSectionTracking = useCallback(
    (markComplete = false) => {
      sectionReadingTracker.endSectionReading(markComplete);

      // Clear interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setReadingState((prev) => ({
        ...prev,
        isTracking: false,
      }));

      /**
       * 🎉 Adds the currently read section to the list of completed sections!
       *
       * This function checks which section the user is currently on and updates the reading state accordingly.
       * If the section exists, it adds it to the read sections and saves this information in localStorage
       * so that the user's progress is remembered even if they refresh the page. 📚✨
       */
      const addToReadSections = () => {
        const { currentSectionIndex, sections } = readingState;
        const currentSection = sections[currentSectionIndex];

        if (!currentSection) return;
        setReadingState((prev) => {
          const newReadSections = new Set(prev.readSections);
          newReadSections.add(currentSection.id);

          // Save to localStorage
          localStorage.setItem(
            `readSections_${readingState.documentPath}`,
            JSON.stringify([...newReadSections])
          );

          return {
            ...prev,
            readSections: newReadSections,
          };
        });
      };

      if (markComplete) addToReadSections();
    },
    [readingState]
  );

  /**
   * ⬅️ Go to Previous Section
   * Navigates to the previous section in the document and saves the position.
   * Stops tracking the current section before moving.
   */
  const navigateToPrevSection = useCallback(() => {
    const { currentSectionIndex } = readingState;

    if (currentSectionIndex > 0) {
      stopSectionTracking();
      setReadingState((prev) => {
        const newIndex = prev.currentSectionIndex - 1;

        localStorage.setItem(
          `lastReadPosition_${prev.documentPath}`,
          newIndex.toString()
        );

        return {
          ...prev,
          currentSectionIndex: newIndex,
        };
      });
      return currentSectionIndex - 1;
    }

    return currentSectionIndex;
  }, [readingState, stopSectionTracking]);

  /**
   * ➡️ Go to Next Section
   * Navigates to the next section in the document and saves the position.
   * Marks the current section as complete before moving forward.
   */
  const navigateToNextSection = useCallback(() => {
    const { currentSectionIndex, sections } = readingState;

    if (currentSectionIndex < sections.length - 1) {
      // Stop tracking current section and mark as complete
      stopSectionTracking(true);

      // Update state with new index
      setReadingState((prev) => {
        const newIndex = prev.currentSectionIndex + 1;

        // Save position to localStorage
        localStorage.setItem(
          `lastReadPosition_${prev.documentPath}`,
          newIndex.toString()
        );

        return {
          ...prev,
          currentSectionIndex: newIndex,
        };
      });

      // Return the new index
      return currentSectionIndex + 1;
    }

    return currentSectionIndex;
  }, [readingState, stopSectionTracking]);

  /**
   * 🔍 Jump to Specific Section
   * Allows direct navigation to any section by index.
   * Validates the target section and updates tracking accordingly.
   */
  const navigateToSection = useCallback(
    (sectionIndex: number) => {
      if (
        sectionIndex >= 0 &&
        sectionIndex < readingState.sections.length &&
        sectionIndex !== readingState.currentSectionIndex
      ) {
        // Stop tracking current section
        stopSectionTracking();

        // Update state with new index
        setReadingState((prev) => {
          // Save position to localStorage
          localStorage.setItem(
            `lastReadPosition_${prev.documentPath}`,
            sectionIndex.toString()
          );

          return {
            ...prev,
            currentSectionIndex: sectionIndex,
          };
        });

        return sectionIndex;
      }

      return readingState.currentSectionIndex;
    },
    [readingState, stopSectionTracking]
  );

  /**
   * ✅ Mark Section as Read
   * Explicitly marks the current section as complete in both
   * the local state and the analytics database.
   */
  const markCurrentSectionComplete = useCallback(() => {
    const { currentSectionIndex, sections } = readingState;
    const currentSection = sections[currentSectionIndex];

    if (currentSection) {
      // Mark as complete in the tracker
      stopSectionTracking(true);

      // Also explicitly mark as read in the database
      sectionAnalyticsController.markSectionAsRead(
        readingState.documentPath,
        currentSection.id
      );
    }
  }, [readingState, stopSectionTracking]);

  /**
   * 📊 Fetch Document Statistics
   * Retrieves detailed reading statistics for the current document
   * from the analytics database.
   */
  const getDocumentStats = useCallback(async () => {
    const stats = await sectionAnalyticsController.getDocumentStats();
    return stats.find((stat) => stat.path === readingState.documentPath);
  }, [readingState.documentPath]);

  /**
   * 🔎 Check Section Completion
   * Determines if a specific section has been marked as read.
   */
  const isSectionCompleted = useCallback(
    (sectionId: string) => {
      return readingState.readSections.has(sectionId);
    },
    [readingState.readSections]
  );

  /**
   * 📏 Get Reading Progress
   * Returns the current reading progress percentage for a specific section.
   */
  const getSectionProgress = useCallback(
    (sectionId: string) => {
      return readingState.sectionProgress.get(sectionId) || 0;
    },
    [readingState.sectionProgress]
  );

  /**
   * 📈 Calculate Overall Completion
   * Determines what percentage of the entire document has been read.
   */
  const getDocumentCompletionPercentage = useCallback(() => {
    if (readingState.sections.length === 0) return 0;

    const completedCount = readingState.readSections.size;
    return (completedCount / readingState.sections.length) * 100;
  }, [readingState.readSections, readingState.sections.length]);

  /**
   * 🔄 Auto-Start Tracking
   * Automatically begins tracking when the current section changes
   * or when tracking is not active.
   */
  useEffect(() => {
    // Start tracking the current section if not already tracking
    if (!readingState.isTracking) {
      startSectionTracking();
    }
  }, [
    readingState.currentSectionIndex,
    readingState.isTracking,
    startSectionTracking,
  ]);

  // Expose the needed state and functions
  return {
    // Current state
    currentSectionIndex: readingState.currentSectionIndex,
    sections: readingState.sections,
    readSections: readingState.readSections,
    sectionProgress: readingState.sectionProgress,
    currentSection: readingState.sections[readingState.currentSectionIndex],
    isLastSection:
      readingState.currentSectionIndex === readingState.sections.length - 1,
    isFirstSection: readingState.currentSectionIndex === 0,

    // Navigation
    navigateToPrevSection,
    navigateToNextSection,
    navigateToSection,

    // Tracking controls
    startSectionTracking,
    stopSectionTracking,
    markCurrentSectionComplete,

    // Helpers
    isSectionCompleted,
    getSectionProgress,
    getDocumentCompletionPercentage,
    getDocumentStats,
  };
}

export default useSectionReadingTracker;
