import React, { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocumentList } from "@/hooks";
import SidebarContent from "./SidebarContent";
import { BookOpen, Trash2, ArrowLeftCircle } from "lucide-react";
import Header from "./Header";
import useNavigation from "./hooks/use-navigate";
import { databaseService } from "@/infrastructure/storage";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
        className="p-0 h-full border-r-0 inset-0 max-w-none w-screen sm:max-w-md bg-gradient-to-b from-card to-background shadow-xl flex flex-col"
      >
        <SheetHeader className="p-0">
          <Header
            setSidebarOpen={setSidebarOpen}
            handleHomeClick={handleHomeClick}
          />
        </SheetHeader>

        <AnimatePresence>
          <ScrollArea className="flex-1 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <SidebarContent
                onFileSelect={handleSelectFile}
                filePaths={{
                  read: readFilePaths,
                  todo: todo,
                  completed: completed,
                }}
                currentFilePath={currentFilePath}
                handleToggleExpand={handleToggleExpand}
                loading={loading}
                categoryData={{
                  tree: contentIndex.categories,
                  expanded: expandedCategories,
                  current: currentOpen,
                }}
              />
            </motion.div>
          </ScrollArea>
        </AnimatePresence>

        <div className="w-full flex-shrink-0">
          <SheetFooter className="px-2">
            <div className="w-full border-t border-border/50 bg-card/70 backdrop-blur-sm flex-shrink-0 font-cascadia-code p-3 rounded-2xl">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center bg-secondary/30 px-2 py-1 rounded-full">
                    <BookOpen size={14} className="mr-1.5" />
                    <span className="font-medium">{readFilePaths.size}</span>
                    <span className="mx-1 text-muted-foreground">/</span>
                    <span>{documentsCount}</span>
                    <span className="ml-1 text-muted-foreground">read</span>
                  </span>

                  <Button
                    variant="ghost"
                    onClick={() => setSidebarOpen(false)}
                    className="h-8 px-3 text-xs rounded-full flex items-center bg-secondary/20 hover:bg-secondary/40 transition-all"
                  >
                    <ArrowLeftCircle size={14} className="mr-1" />
                    Close
                  </Button>
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
                  className="text-xs text-red-600 hover:bg-red-600/10 hover:text-red-600 transition-colors flex items-center cursor-pointer justify-center py-1"
                >
                  <Trash2 size={12} className="mr-1" />
                  Clear all reading data
                </Button>
              </div>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ResponsiveSidebar;
