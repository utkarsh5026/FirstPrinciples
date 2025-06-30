import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { memo } from "react";
import Category from "./document-category";
import CategoryFile from "./category-file";
import type { Document } from "@/stores/document/document-store";
interface FileTreeProps {
  category: Document;
  depth?: number;
  expandedCategories: Set<string>;
  handleToggleExpand: (categoryId: string, isExpanded: boolean) => void;
  handleSelectFile: (filePath: string) => void;
  filePaths: {
    todo: Set<string>;
    completed: Set<string>;
    read: Set<string>;
  };
  currentFilePath: string;
}

const FileTree: React.FC<FileTreeProps> = memo(
  ({
    category,
    depth = 0,
    expandedCategories,
    handleToggleExpand,
    handleSelectFile,
    filePaths,
    currentFilePath,
  }) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasContent =
      (category.files && category.files.length > 0) ||
      (category.documents && category.documents.length > 0);

    if (!hasContent) return null;

    return (
      <Collapsible key={category.id} open={isExpanded}>
        <CollapsibleTrigger asChild>
          <Category
            category={category}
            isExpanded={isExpanded}
            handleToggleExpand={handleToggleExpand}
            depth={depth}
            showExpandIcon={true}
          />
        </CollapsibleTrigger>

        <CollapsibleContent asChild>
          {isExpanded || category.documents === undefined ? (
            <div className="overflow-hidden pl-4">
              {category.documents?.map((subcategory) => (
                <FileTree
                  key={subcategory.id}
                  category={subcategory}
                  depth={depth + 1}
                  expandedCategories={expandedCategories}
                  handleToggleExpand={handleToggleExpand}
                  handleSelectFile={handleSelectFile}
                  filePaths={filePaths}
                  currentFilePath={currentFilePath}
                />
              ))}

              {/* Render files with status indicators */}
              {category.files?.map((file, index) => {
                const isCurrentFile = file.path === currentFilePath;

                return (
                  <CategoryFile
                    key={file.path}
                    file={{
                      ...file,
                      isTodo: filePaths.todo.has(file.path),
                      isCompleted: filePaths.completed.has(file.path),
                      isRead: filePaths.read.has(file.path),
                    }}
                    depth={depth + 1}
                    isCurrentFile={isCurrentFile}
                    fileNumber={index + 1}
                    handleSelectFile={handleSelectFile}
                  />
                );
              })}
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

export default FileTree;
