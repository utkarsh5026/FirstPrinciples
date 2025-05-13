import { ScrollArea } from "@/components/ui/scroll-area";
import { Category } from "@/services/document/document-loader";
import FileTree from "./FileTree";
import CurrentlyReading from "./CurrentlyReading";
import type { CurrentCategory } from "./hooks/use-navigate";
import { memo, useState } from "react";

interface SidebarContentProps {
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
  showDescriptions: boolean;
}

const SidebarContent: React.FC<SidebarContentProps> = memo(
  ({
    categoryData,
    loading,
    onFileSelect,
    filePaths,
    currentFilePath,
    handleToggleExpand,
    showDescriptions,
  }) => {
    const [currentCategoryExpanded, setCurrentCategoryExpanded] =
      useState(false);

    return (
      <div className="h-full flex flex-col overflow-auto font-cascadia-code text-xs">
        {/* Main scrollable content */}
        <ScrollArea className="flex-1 px-2 overflow-auto text-xs">
          <div className="pb-4 pt-2">
            <div className="flex flex-col justify-center">
              <span className="text-xs font-medium ml-4 text-primary/80">
                Currently Reading
              </span>
              {!loading && categoryData.current && (
                <CurrentlyReading
                  currentCategory={categoryData.current}
                  currentFilePath={currentFilePath ?? ""}
                  onSelectFile={onFileSelect}
                  showDescriptions={showDescriptions}
                  expanded={currentCategoryExpanded}
                  setExpanded={setCurrentCategoryExpanded}
                />
              )}
            </div>

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
                          showDescriptions={showDescriptions}
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

export default SidebarContent;
