import { useCurrentDocument } from "@/hooks";
import { useHistoryStore } from "@/stores";
import { union } from "@/utils/array";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";

const MARKDOWN_EXTENSION = ".md";

/**
 * 📚 useDocument Hook
 *
 * A powerful hook for managing document reading state and progress tracking.
 * Handles loading documents, tracking completed sections, and managing reading history.
 *
 * 🧠 Remembers which sections you've read
 * 📝 Tracks reading progress across sessions
 * 🔄 Syncs with document history store
 * 🚀 Provides utilities for section management
 */
export const useDocument = (documentPath: string) => {
  const { loadedDocumentForUrl, sections, ...currentDocument } =
    useCurrentDocument();

  const [completedSectionIndices, setCompletedSectionIndices] = useState<
    number[]
  >([]);
  const [isLoadingSectionData, setIsLoadingSectionData] = useState(false);
  const newlyCompletedSections = useRef<Set<number>>(new Set());
  const previouslyCompletedSections = useRef<Set<number>>(new Set());

  const getDocumentHistory = useHistoryStore(
    (state) => state.getDocumentHistory
  );
  const markSectionsCompleted = useHistoryStore(
    (state) => state.markSectionsCompleted
  );

  /**
   * 📂 Load document when path changes
   *
   * Ensures the document is loaded with the correct file extension
   */
  useEffect(() => {
    const fullPath = documentPath.endsWith(MARKDOWN_EXTENSION)
      ? documentPath
      : `${documentPath}${MARKDOWN_EXTENSION}`;
    loadedDocumentForUrl(fullPath);
  }, [documentPath, loadedDocumentForUrl]);

  /**
   * 🔍 Fetch previously read sections
   *
   * Retrieves your reading history for this document and restores your progress
   */
  useEffect(() => {
    setIsLoadingSectionData(true);
    const fetchCompletedSections = async () => {
      try {
        const documentHistory = await getDocumentHistory(documentPath);
        console.log(documentHistory, "Document history changed", documentPath);
        setIsLoadingSectionData(false);
        if (!documentHistory) return;

        setCompletedSectionIndices(
          documentHistory.completedSectionIndices || []
        );
        previouslyCompletedSections.current = new Set(
          documentHistory.completedSectionIndices || []
        );
      } catch (error) {
        console.error("Error fetching completed sections:", error);
        setIsLoadingSectionData(false);
      }
    };

    fetchCompletedSections();
  }, [documentPath, getDocumentHistory]);

  /**
   * ✅ Mark section as read
   *
   * Tracks when you finish reading a section and updates your progress
   */
  const markSectionAsCompleted = useCallback(
    async (sectionIndex: number) => {
      if (!documentPath) return false;

      if (sectionIndex < 0 || sectionIndex >= sections.length) return false;

      await markSectionsCompleted(documentPath, [sectionIndex]);
      setCompletedSectionIndices((prev) => union(prev, [sectionIndex]));
      newlyCompletedSections.current.add(sectionIndex);
      return true;
    },
    [documentPath, markSectionsCompleted, sections]
  );

  /**
   * 📖 Retrieve section content
   *
   * Gets the content for a specific section by its index
   */
  const getSection = useCallback(
    (sectionIndex: number) => {
      if (sectionIndex < 0 || sectionIndex >= sections.length) return null;
      return sections[sectionIndex];
    },
    [sections]
  );

  /**
   * 💾 Save your reading progress
   *
   * Persists your completed sections to storage for future sessions
   */
  const saveCompletedSections = useCallback(async () => {
    if (!documentPath) return;
    await markSectionsCompleted(documentPath, completedSectionIndices);
    previouslyCompletedSections.current = new Set(completedSectionIndices);
    newlyCompletedSections.current.clear();
  }, [documentPath, completedSectionIndices, markSectionsCompleted]);

  /**
   * 🏆 Track completed sections
   *
   * Maintains a list of section IDs you've already read
   */
  const completedSectionIds = useMemo(() => {
    return new Set(
      sections
        .filter((_section, index) => completedSectionIndices.includes(index))
        .map(({ id }) => id)
    );
  }, [sections, completedSectionIndices]);

  return {
    markSectionAsCompleted,
    saveCompletedSections,
    getSection,
    isLoadingSectionData,
    sectionData: {
      completedSectionIds,
      newlyCompletedSections: newlyCompletedSections.current,
      previouslyCompletedSections: previouslyCompletedSections.current,
      sectionsContent: sections,
    },
    ...currentDocument,
  };
};
