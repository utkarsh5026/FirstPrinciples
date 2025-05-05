import { useHistoryStore } from "@/stores";
import { useCurrentDocument } from "@/hooks/document/use-current-document";
import { useCallback, useEffect, useMemo, useState } from "react";
import { union } from "@/utils/array";

const useDocumentReading = () => {
  const { sections, documentPath } = useCurrentDocument();
  const [sectionsReadSoFar, setSectionsReadSoFar] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const getDocumentHistory = useHistoryStore(
    (state) => state.getDocumentHistory
  );
  const markSectionsCompleted = useHistoryStore(
    (state) => state.markSectionsCompleted
  );

  /**
   * 📚 Load read sections when document changes
   */
  useEffect(() => {
    setLoading(true);
    const fetchReadSections = async () => {
      try {
        const documentHistory = await getDocumentHistory(documentPath);
        console.log(documentHistory, "Document history changed", documentPath);
        setLoading(false);
        if (!documentHistory) return;

        setSectionsReadSoFar(documentHistory.completedSectionIndices || []);
      } catch (error) {
        console.error("Error fetching read sections:", error);
        setLoading(false);
      }
    };

    fetchReadSections();
  }, [documentPath, getDocumentHistory]);

  /**
   * 📚 Start reading a section
   */
  const startSectionReading = useCallback(
    async (sectionIndex: number) => {
      console.log(
        documentPath,
        sectionIndex,
        sections,
        "Start section reading"
      );
      if (!documentPath) return false;

      if (sectionIndex < 0 || sectionIndex >= sections.length) return false;

      await markSectionsCompleted(documentPath, [sectionIndex]);
      console.log(sectionIndex);
      setSectionsReadSoFar((prev) => {
        console.log(prev);
        return union(prev, [sectionIndex]);
      });
      return true;
    },
    [documentPath, markSectionsCompleted, sections]
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

  // useEffect(() => {
  //   const addCompletedSections = async () => {
  //     if (!documentPath) return;
  //     await markSectionsCompleted(documentPath, sectionsReadSoFar);
  //   };

  //   return () => {
  //     addCompletedSections();
  //   };
  // }, [documentPath, sectionsReadSoFar, markSectionsCompleted]);

  const endReading = useCallback(async () => {
    if (!documentPath) return;
    await markSectionsCompleted(documentPath, sectionsReadSoFar);
  }, [documentPath, sectionsReadSoFar, markSectionsCompleted]);

  useEffect(() => {
    console.log(sectionsReadSoFar, "Sections read so far changed");
  }, [sectionsReadSoFar]);

  useEffect(() => {
    console.log(sections, "Sections changed");
  }, [sections]);

  useEffect(() => {
    console.log(documentPath, "Document path changed");
  }, [documentPath]);

  useEffect(() => {
    console.log(sectionsReadSoFar, "Sections read so far changed");
  }, [sectionsReadSoFar]);

  const readSections = useMemo(() => {
    return new Set(
      sections
        .filter((_section, index) => sectionsReadSoFar.includes(index))
        .map(({ id }) => id)
    );
  }, [sections, sectionsReadSoFar]);

  return {
    startSectionReading,
    endReading,
    getSection,
    sections,
    loading,
    readSections,
  };
};

export default useDocumentReading;
