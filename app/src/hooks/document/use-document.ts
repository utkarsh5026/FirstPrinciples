import { useCurrentDocument } from "@/hooks";
import { useEffect } from "react";

const MARKDOWN_EXTENSION = ".md";

export const useDocument = (documentPath: string) => {
  const { loadedDocumentForUrl, ...currentDocument } = useCurrentDocument();
  /**
   * 📂 Load document when path changes
   */
  useEffect(() => {
    const fullPath = documentPath.endsWith(MARKDOWN_EXTENSION)
      ? documentPath
      : `${documentPath}${MARKDOWN_EXTENSION}`;
    loadedDocumentForUrl(fullPath);
  }, [documentPath, loadedDocumentForUrl]);

  return {
    ...currentDocument,
  };
};
