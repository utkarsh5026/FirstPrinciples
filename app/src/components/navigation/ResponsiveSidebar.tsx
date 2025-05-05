import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet";
import { useDocumentList } from "@/hooks";
import SidebarContent from "./SidebarContent";
import { BookOpen } from "lucide-react";
import Header from "./Header";
import useNavigation from "./hooks/use-navigate";

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
  const [showDescriptions, setShowDescriptions] = useState(false);
  const [currentCategoryExpanded, setCurrentCategoryExpanded] = useState(true);

  const { contentIndex, getFileBreadcrumbs } = useDocumentList();
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
  }, [currentFilePath, contentIndex, getFileBreadcrumbs]);

  const handleToggleExpand = (categoryId: string, isExpanded: boolean) => {
    const newExpandedCategories = new Set(expandedCategories);

    if (isExpanded) newExpandedCategories.add(categoryId);
    else newExpandedCategories.delete(categoryId);

    setExpandedCategories(newExpandedCategories);
  };

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
        className="p-0 h-full border-r-0 inset-0 max-w-none w-screen sm:max-w-md"
      >
        <SheetHeader className="p-0">
          <Header
            showDescriptions={showDescriptions}
            setShowDescriptions={setShowDescriptions}
            setSidebarOpen={setSidebarOpen}
          />
        </SheetHeader>
        <SidebarContent
          onFileSelect={handleSelectFile}
          filePaths={{
            read: readFilePaths,
            todo: todo,
            completed: completed,
          }}
          currentFilePath={currentFilePath}
          expandedCategories={expandedCategories}
          handleToggleExpand={handleToggleExpand}
          categories={contentIndex.categories}
          loading={loading}
          showDescriptions={showDescriptions}
          handleHomeClick={handleHomeClick}
          currentCategory={currentOpen}
          currentCategoryExpanded={currentCategoryExpanded}
          setCurrentCategoryExpanded={setCurrentCategoryExpanded}
        />
        <SheetFooter>
          <div className="border-border/50 bg-card/50 flex-shrink-0 font-cascadia-code px-3 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center">
                <BookOpen size={14} className="mr-1.5" />
                {readFilePaths.size}/{documentsCount} read
              </span>
              <span className="text-primary text-xs">Documentation</span>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ResponsiveSidebar;
