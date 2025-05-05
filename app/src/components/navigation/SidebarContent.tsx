import { LayoutDashboard } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Category } from "@/services/document/document-loader";
import FileTree from "./FileTree";

interface SidebarContentProps {
  handleHomeClick: () => void;
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
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  handleHomeClick,
  categories,
  loading,
  onFileSelect,
  filePaths,
  currentFilePath,
  expandedCategories,
  handleToggleExpand,
  showDescriptions,
}) => {
  return (
    <div className="h-full flex flex-col overflow-auto font-cascadia-code text-xs">
      {/* Main scrollable content */}
      <ScrollArea className="flex-1 px-2 overflow-auto text-xs">
        <div className="pb-4 pt-2">
          {/* Home navigation button */}
          <button
            className={cn(
              "flex items-center w-full rounded-md text-sm transition-colors py-2 px-2 mb-3",
              "hover:bg-primary/10 hover:text-foreground",
              "bg-primary/5 font-medium"
            )}
            onClick={handleHomeClick}
          >
            <div className="flex-shrink-0 mr-2 text-primary">
              <LayoutDashboard size={16} />
            </div>
            <span>Home</span>
          </button>

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
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground px-2">
                      Categories
                    </h3>
                  </div>

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
