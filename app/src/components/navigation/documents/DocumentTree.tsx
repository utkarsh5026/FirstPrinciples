import { ScrollArea } from "@/components/ui/scroll-area";
import { Category } from "@/services/document/document-loader";
import FileTree from "./FileTree";
import type { CurrentCategory } from "../hooks/use-navigate";
import { memo } from "react";

interface DocumentTreeProps {
  categoryData: {
    tree: Category[];
    expanded: Set<string>;
    current: CurrentCategory | null;
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
        <ScrollArea className="flex-1 px-2 overflow-auto text-xs">
          <div className="pb-4 pt-2">
            {loading ? (
              // Loading skeleton
              <div className="space-y-2 px-2">
                <div className="h-9 bg-secondary/20 rounded-md animate-pulse"></div>
                <div className="space-y-3 mt-4">
                  <div className="h-7 bg-secondary/20 rounded-md w-3/4 animate-pulse"></div>
                  <div className="h-7 bg-secondary/20 rounded-md w-full animate-pulse"></div>
                  <div className="h-7 bg-secondary/20 rounded-md w-5/6 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <>
                {/* Categories section */}
                {categoryData.tree.length > 0 && (
                  <div>
                    <div>
                      {categoryData.tree.map((category) => (
                        <FileTree
                          key={category.id}
                          category={category}
                          handleSelectFile={onFileSelect}
                          filePaths={filePaths}
                          currentFilePath={currentFilePath ?? ""}
                          expandedCategories={categoryData.expanded}
                          handleToggleExpand={handleToggleExpand}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
);

export default DocumentTree;
