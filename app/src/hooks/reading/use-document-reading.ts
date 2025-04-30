import { useSectionStore } from "@/stores";
import { useCurrentDocument } from "@/hooks/document/use-current-document";
import { useState } from "react";
import { useCallback, useEffect, useMemo } from "react";

const useDocumentReading = () => {
  const { sections, documentPath, category } = useCurrentDocument();

  const startReading = useSectionStore((state) => state.startReading);
  const endReading = useSectionStore((state) => state.endReading);
  const loadReadSections = useSectionStore((state) => state.loadReadSections);
  const readingState = useSectionStore((state) => state.readingState);
  const [loading, setLoading] = useState(false);

  /**
   * 📚 Load read sections when document changes
   */
  useEffect(() => {
    const fetchReadSections = async () => {
      setLoading(true);
      if (documentPath) await loadReadSections(documentPath);
      setLoading(false);
    };

    fetchReadSections();
  }, [documentPath, loadReadSections]);

  /**
   * 📚 Start reading a section
   */
  const startSectionReading = useCallback(
    async (sectionIndex: number) => {
      if (!documentPath) return false;

      if (sectionIndex < 0 || sectionIndex >= sections.length) return false;

      const section = sections[sectionIndex];
      const readSections = readingState.readSections;

      if (readSections.has(section.id)) return false;

      const { id, wordCount, title } = section;
      await startReading(documentPath, id, category, wordCount, title, true);
      return true;
    },
    [documentPath, category, readingState, startReading, sections]
  );

  /**
   * 📚 Get a section
   */
  const getSection = useCallback(
    (sectionIndex: number) => {
      if (sectionIndex < 0 || sectionIndex >= sections.length) return null;
      return sections[sectionIndex];
    },
    [sections]
  );

  const { readSections } = useMemo(() => {
    return {
      readSections: readingState.readSections,
    };
  }, [readingState.readSections]);

  return {
    readSections,
    startSectionReading,
    endReading,
    getSection,
    sections,
    loading,
  };
};

export default useDocumentReading;
