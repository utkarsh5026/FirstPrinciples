import { useEffect, useState } from "react";
import { useSectionStore } from "@/stores/sectionStore";
import type { MarkdownSection } from "@/components/card/MarkdownCardView";

/**
 * Hook for tracking section reading with SectionReadingService
 *
 * This hook automatically:
 * - Marks a section as read when opened
 * - Tracks time spent on each section
 * - Connects the UI to SectionReadingService via the store
 *
 * @param documentPath Current document path
 * @param currentSectionId Current section ID
 * @param totalSections Total number of sections in the document
 */
export const useSection = (
  documentPath: string,
  currentSectionId: string | null,
  totalSections: number
) => {
  const {
    startReading,
    endReading,
    isSectionRead,
    getReadSections,
    loadReadSections,
    getDocumentCompletionPercentage,
    isInitialized,
    isLoading,
    initialize,
    error,
  } = useSectionStore();

  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Initialize the store if needed
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Load read sections when document changes
  useEffect(() => {
    if (documentPath && isInitialized) {
      loadReadSections(documentPath).then(() => {
        setInitialized(true);
      });
    }
  }, [documentPath, isInitialized, loadReadSections]);

  // Update completion percentage periodically
  useEffect(() => {
    if (documentPath && initialized) {
      // Initial update
      getDocumentCompletionPercentage(documentPath, totalSections).then(
        (percentage) => setCompletionPercentage(percentage)
      );

      // Update every 30 seconds
      const intervalId = setInterval(() => {
        getDocumentCompletionPercentage(documentPath, totalSections).then(
          (percentage) => setCompletionPercentage(percentage)
        );
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [
    documentPath,
    totalSections,
    initialized,
    getDocumentCompletionPercentage,
  ]);

  // When section changes, start/end tracking
  useEffect(() => {
    if (documentPath && currentSectionId && isInitialized) {
      // Start new reading session
      startReading(documentPath, currentSectionId);

      // End reading when unmounting or changing sections
      return () => {
        endReading();
      };
    }
  }, [documentPath, currentSectionId, isInitialized, startReading, endReading]);

  // Get all read sections
  const readSections = getReadSections();

  return {
    // Is current section marked as read
    isCurrentSectionRead: currentSectionId
      ? isSectionRead(currentSectionId)
      : false,

    // Get all sections that have been read
    readSections,

    // Document completion percentage
    documentCompletionPercentage: completionPercentage,

    // Check if specific section is read
    isSectionRead,

    // Service state
    isInitialized,
    isLoading,
    error,
  };
};

/**
 * Hook for use with an array of sections
 */
export const useSectionArray = (
  documentPath: string,
  sections: MarkdownSection[],
  currentIndex: number
) => {
  const currentSectionId =
    sections.length > 0 && currentIndex >= 0 && currentIndex < sections.length
      ? sections[currentIndex].id
      : null;

  return useSection(documentPath, currentSectionId, sections.length);
};
