import React, { memo } from "react";
import TabbedDocumentNavigation from "./TabbedDocumentsNavigation";
import { Category } from "@/services/document/document-loader";

interface DocumentTreeProps {
  categoryData: {
    tree: Category[];
    expanded: Set<string>;
  };
  loading: boolean;
  onFileSelect: (filePath: string) => void;
  filePaths: {
    read: Set<string>;
    todo: Set<string>;
    completed: Set<string>;
  };
  currentFilePath?: string;
  handleToggleExpand: (categoryId: string, isExpanded: boolean) => void;
}

/**
 * DocumentTree Component
 *
 * A container component that provides navigation for documents.
 * Now includes a tabbed interface that lets users switch between:
 * 1. Traditional tree view with expandable folders
 * 2. Flat view navigation similar to Google Drive
 */
const DocumentTree: React.FC<DocumentTreeProps> = memo(
  ({
    categoryData,
    loading,
    onFileSelect,
    filePaths,
    currentFilePath,
    handleToggleExpand,
  }) => {
    return (
      <div className="h-full flex flex-col overflow-auto font-cascadia-code text-xs">
        <TabbedDocumentNavigation
          categoryData={categoryData}
          loading={loading}
          onFileSelect={onFileSelect}
          filePaths={filePaths}
          currentFilePath={currentFilePath}
          handleToggleExpand={handleToggleExpand}
        />
      </div>
    );
  }
);

export default DocumentTree;
