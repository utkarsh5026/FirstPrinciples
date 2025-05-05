import { ScrollArea } from "@/components/ui/scroll-area";
import { Category } from "@/services/document/document-loader";
import FileTree from "./FileTree";
import CurrentlyReading from "./CurrentlyReading";
import type { CurrentCategory } from "./hooks/use-navigate";

interface SidebarContentProps {
  categories: Category[];
  loading: boolean;
  onFileSelect: (filePath: string) => void;
  filePaths: {
    read: Set<string>;
    todo: Set<string>;
    completed: Set<string>;
  };
  currentFilePath?: string;
  expandedCategories: Set<string>;
  handleToggleExpand: (categoryId: string, isExpanded: boolean) => void;
  showDescriptions: boolean;
  currentCategory: CurrentCategory | null;
  currentCategoryExpanded: boolean;
  setCurrentCategoryExpanded: (expanded: boolean) => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  categories,
  loading,
  onFileSelect,
  filePaths,
  currentFilePath,
  expandedCategories,
  handleToggleExpand,
  showDescriptions,
  // New props
  currentCategory,
  currentCategoryExpanded,
  setCurrentCategoryExpanded,
}) => {
  return (
    <div className="h-full flex flex-col overflow-auto font-cascadia-code text-xs">
      {/* Main scrollable content */}
      <ScrollArea className="flex-1 px-2 overflow-auto text-xs">
        <div className="pb-4 pt-2">
          {/* Currently Reading Section - Add this */}
          {!loading && currentCategory && (
            <CurrentlyReading
              currentCategory={currentCategory}
              currentFilePath={currentFilePath ?? ""}
              onSelectFile={onFileSelect}
              showDescriptions={showDescriptions}
              expanded={currentCategoryExpanded}
              setExpanded={setCurrentCategoryExpanded}
            />
          )}

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
              {categories.length > 0 && (
                <div>
                  <div>
                    {categories.map((category) => (
                      <FileTree
                        key={category.id}
                        category={category}
                        handleSelectFile={onFileSelect}
                        filePaths={filePaths}
                        currentFilePath={currentFilePath ?? ""}
                        showDescriptions={showDescriptions}
                        expandedCategories={expandedCategories}
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
};

export default SidebarContent;
