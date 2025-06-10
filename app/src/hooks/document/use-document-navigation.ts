import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useDocumentList from "./use-document-list";

/**
 * 🧭 Document Navigation Hook
 *
 * Provides navigation functionality for moving between documents
 * in the order they appear in the document tree.
 */
export const useDocumentNavigation = (currentDocumentPath?: string) => {
  const { documents } = useDocumentList();
  const navigate = useNavigate();

  // Create a flat, ordered list of all document paths
  const orderedDocuments = useMemo(() => {
    return documents
      .filter((doc) => doc.path.endsWith(".md"))
      .sort((a, b) => a.path.localeCompare(b.path))
      .map((doc) => ({
        path: doc.path,
        title: doc.title,
      }));
  }, [documents]);

  // Find current document index
  const currentIndex = useMemo(() => {
    if (!currentDocumentPath) return -1;

    // Try exact match first
    let index = orderedDocuments.findIndex(
      (doc) => doc.path === currentDocumentPath
    );

    // If not found, try with .md extension
    if (index === -1) {
      const pathWithMd = currentDocumentPath.endsWith(".md")
        ? currentDocumentPath
        : `${currentDocumentPath}.md`;
      index = orderedDocuments.findIndex((doc) => doc.path === pathWithMd);
    }

    return index;
  }, [currentDocumentPath, orderedDocuments]);

  // Get previous document
  const previousDocument = useMemo(() => {
    return currentIndex > 0 ? orderedDocuments[currentIndex - 1] : null;
  }, [currentIndex, orderedDocuments]);

  // Get next document
  const nextDocument = useMemo(() => {
    return currentIndex < orderedDocuments.length - 1
      ? orderedDocuments[currentIndex + 1]
      : null;
  }, [currentIndex, orderedDocuments]);

  // Navigation functions
  const navigateToDocument = useCallback(
    (documentPath: string) => {
      const encodedPath = encodeURIComponent(documentPath.replace(".md", ""));
      navigate(`/documents/${encodedPath}`);
    },
    [navigate]
  );

  const navigateToPrevious = useCallback(() => {
    if (previousDocument) {
      navigateToDocument(previousDocument.path);
    }
  }, [previousDocument, navigateToDocument]);

  const navigateToNext = useCallback(() => {
    if (nextDocument) {
      navigateToDocument(nextDocument.path);
    }
  }, [nextDocument, navigateToDocument]);

  return {
    orderedDocuments,
    currentIndex,
    previousDocument,
    nextDocument,
    navigateToDocument,
    navigateToPrevious,
    navigateToNext,
    canNavigatePrevious: previousDocument !== null,
    canNavigateNext: nextDocument !== null,
  };
};
