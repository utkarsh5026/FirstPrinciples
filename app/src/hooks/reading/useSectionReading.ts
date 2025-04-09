import { useState, useEffect, useRef, useCallback } from "react";
import { useServices } from "@/context/ServiceContext";

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
 * A modular hook for tracking reading progress through document sections
 */
export function useSectionReading(
  documentPath: string,
  documentTitle: string,
  sections: SectionData[],
  initialSectionIndex: number = 0
) {
  // Get services from context
  const {
    sectionReadingTracker,
    sectionAnalyticsController,
    analyticsController,
  } = useServices();

  // State for tracking reading progress
  const [readingState, setReadingState] = useState<SectionReadingState>({
    documentPath,
    documentTitle,
    currentSectionIndex: initialSectionIndex,
    sections,
    readSections: new Set<string>(),
    sectionProgress: new Map<string, number>(),
    isTracking: false,
  });

  // Progress tracking timer
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize reading state
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
  }, [
    documentPath,
    documentTitle,
    sections,
    analyticsController,
    sectionReadingTracker,
  ]);

  // Start section tracking
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
  }, [readingState, sectionReadingTracker]);

  // Stop section tracking
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

      // Add current section to read sections if marking complete
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
    [readingState, sectionReadingTracker]
  );

  // Navigate to previous section
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

  // Navigate to next section
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

  // Navigate to specific section
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

  // Mark current section as complete
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
  }, [readingState, stopSectionTracking, sectionAnalyticsController]);

  // Get document statistics
  const getDocumentStats = useCallback(async () => {
    const stats = await sectionAnalyticsController.getDocumentStats();
    return stats.find((stat) => stat.path === readingState.documentPath);
  }, [readingState.documentPath, sectionAnalyticsController]);

  // Check if a section is completed
  const isSectionCompleted = useCallback(
    (sectionId: string) => {
      return readingState.readSections.has(sectionId);
    },
    [readingState.readSections]
  );

  // Get reading progress for a section
  const getSectionProgress = useCallback(
    (sectionId: string) => {
      return readingState.sectionProgress.get(sectionId) || 0;
    },
    [readingState.sectionProgress]
  );

  // Calculate overall document completion percentage
  const getDocumentCompletionPercentage = useCallback(() => {
    if (readingState.sections.length === 0) return 0;

    const completedCount = readingState.readSections.size;
    return (completedCount / readingState.sections.length) * 100;
  }, [readingState.readSections, readingState.sections.length]);

  // Auto-start tracking when the current section changes
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

  // Return all necessary functions and state
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
