import { useCallback, useMemo, useState, ReactNode } from "react";
import { useDocumentManager as useOriginalDocumentManager } from "@/hooks/reading/useDocumentManager";
import { DocumentManagerContext } from "./DocumentContext";

interface DocumentManagerProviderProps {
  children: ReactNode;
  onSelectFile: (path: string) => void;
}

/**
 * DocumentManagerProvider - Provides document management state and functions to the component tree
 *
 * This provider centralizes all document-related operations, including loading documents,
 * tracking reading history, and managing reading lists.
 */
export const DocumentManagerProvider: React.FC<
  DocumentManagerProviderProps
> = ({ children, onSelectFile }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelection = useCallback(
    (path: string) => {
      setSelectedFile(path);
      onSelectFile(path);
    },
    [onSelectFile]
  );

  // Use the original hook inside the provider
  const documentManagerData = useOriginalDocumentManager(handleFileSelection);

  const contextValue = useMemo(
    () => ({
      ...documentManagerData,
      selectedFile,
    }),
    [documentManagerData, selectedFile]
  );

  // Provide the context value
  return (
    <DocumentManagerContext.Provider value={contextValue}>
      {children}
    </DocumentManagerContext.Provider>
  );
};
