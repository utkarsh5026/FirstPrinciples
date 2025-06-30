import React, { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { useDocumentList } from "@/hooks";
import { BookOpen, Trash2 } from "lucide-react";
import Header from "./sidebar-header";
import useNavigation from "./hooks/use-navigate";
import { databaseService } from "@/infrastructure/storage";
import { Button } from "@/components/ui/button";
import TabbedNavigation from "./tabbed-navigation";

interface ResponsiveSidebarProps {
  onSelectFile: (filepath: string) => void;
  currentFilePath?: string;
  onNavigateHome: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  onSelectFile,
  currentFilePath,
  onNavigateHome,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const { getFileBreadcrumbs, docs } = useDocumentList();
  const { readFilePaths, todo, completed, documentsCount, currentOpen } =
    useNavigation(currentFilePath);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);

        if (currentFilePath) {
          const breadcrumbs = await getFileBreadcrumbs(currentFilePath);
          const newExpandedCategories = new Set<string>();

          // Add only the direct parent category to expanded set
          if (breadcrumbs.length > 0) {
            // Find the immediate parent (usually the last one in breadcrumbs)
            for (let i = breadcrumbs.length - 1; i >= 0; i--) {
              newExpandedCategories.add(breadcrumbs[i].id);
              // Only add the most immediate parent category
              break;
            }
          }

          setExpandedCategories(newExpandedCategories);
        } else {
          // No current file, don't expand any categories
          setExpandedCategories(new Set());
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setLoading(false);
      }
    };

    loadCategories();
  }, [currentFilePath, getFileBreadcrumbs]);

  const handleToggleExpand = useCallback(
    (categoryId: string, isExpanded: boolean) => {
      const newExpandedCategories = new Set(expandedCategories);

      if (isExpanded) newExpandedCategories.add(categoryId);
      else newExpandedCategories.delete(categoryId);

      setExpandedCategories(newExpandedCategories);
    },
    [expandedCategories]
  );

  const handleSelectFile = (filepath: string) => {
    onSelectFile(filepath);
    setSidebarOpen(false);
  };

  const handleHomeClick = () => {
    onNavigateHome();
    setSidebarOpen(false);
  };

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent
        side="left"
        className="p-0 h-full border-r-0 inset-0 max-w-none w-screen sm:max-w-2xl bg-gradient-to-b from-card to-background shadow-xl flex flex-col"
      >
        <SheetHeader className="p-0">
          <Header
            setSidebarOpen={setSidebarOpen}
            handleHomeClick={handleHomeClick}
          />
        </SheetHeader>

        <div className="flex-1 flex flex-col overflow-auto">
          <TabbedNavigation
            currentCategory={currentOpen}
            currentFilePath={currentFilePath ?? ""}
            onFileSelect={handleSelectFile}
            filePaths={{
              read: readFilePaths,
              todo: todo,
              completed: completed,
            }}
            handleToggleExpand={handleToggleExpand}
            loading={loading}
            categoryData={{
              tree: docs,
              expanded: expandedCategories,
              current: currentOpen,
            }}
          />
        </div>

        <div className="w-full flex-shrink-0 font-type-mono p-6">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-card px-3 py-1.5 rounded-full shadow-sm border border-border/20">
                <BookOpen size={14} className="mr-2 text-primary" />
                <span className="font-medium text-sm">
                  {readFilePaths.size}
                </span>
                <span className="mx-1 text-muted-foreground text-sm">/</span>
                <span className="text-sm">{documentsCount}</span>
                <span className="ml-1 text-muted-foreground text-sm">read</span>
              </div>
              <Button
                variant="ghost"
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to clear all reading data? This cannot be undone."
                    )
                  ) {
                    await databaseService.deleteDatabase();
                    window.location.reload();
                  }
                }}
                className="h-8 text-xs rounded-2xl text-red-500 hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center justify-center bg-red-500/10"
              >
                <Trash2 size={12} className="mr-1.5" />
                Clear all reading data
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ResponsiveSidebar;
