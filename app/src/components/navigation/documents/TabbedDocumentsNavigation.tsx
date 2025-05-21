import React, { useState, useEffect, RefObject, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Category } from "@/services/document";
import FileTree from "./FileTree";
import FlatDirectoryView from "./FlatDirectoryView";
import { FolderTree, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeGesture } from "@/hooks/device/use-swipe-gesture";
import BreadcrumbView from "./BreadcrumbView";
import { useLocalStorage, useMobile, useDocumentList } from "@/hooks";

interface TabbedDocumentNavigationProps {
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
 * TabbedDocumentNavigation Component
 *
 * A navigation component that provides two ways to browse documents:
 * 1. Traditional tree view with expandable folders
 * 2. Flat view navigation similar to Google Drive
 *
 * Users can switch between these views using tabs.
 */
const TabbedDocumentNavigation: React.FC<TabbedDocumentNavigationProps> = ({
  categoryData,
  loading,
  onFileSelect,
  filePaths,
  currentFilePath,
  handleToggleExpand,
}) => {
  const { storedValue: viewType, setValue: setViewType } = useLocalStorage(
    "viewType",
    "tree"
  );
  const [currentPathSegments, setCurrentPathSegments] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const { contentIndex } = useDocumentList();
  const { isPhone } = useMobile();

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Use swipe gesture for navigation in flat view on mobile
  useSwipeGesture({
    onSwipeRight: () => {
      if (viewType === "flat" && currentPathSegments.length > 0) {
        navigateUp();
      }
    },
    targetRef: containerRef as RefObject<HTMLElement>,
  });

  const navigateToPath = useCallback(
    (pathSegments: string[]) => {
      setCurrentPathSegments(pathSegments);

      let category: Category | null = null;
      let currentCategories = contentIndex.categories || [];

      for (const segment of pathSegments) {
        const found = currentCategories.find((cat) => cat.id === segment);
        if (found) {
          category = found;
          currentCategories = found.categories || [];
        } else {
          category = null;
          break;
        }
      }

      setCurrentCategory(category);
    },
    [contentIndex.categories]
  );

  useEffect(() => {
    if (viewType === "flat" && currentFilePath) {
      const pathParts = currentFilePath.split("/");
      const dirPath = pathParts.slice(0, -1);
      navigateToPath(dirPath);
    }
  }, [currentFilePath, viewType, contentIndex, navigateToPath]);

  const navigateToDirectory = (categoryId: string) => {
    const newPath = [...currentPathSegments, categoryId];
    navigateToPath(newPath);
  };

  // Navigate up one level in flat view
  const navigateUp = () => {
    if (currentPathSegments.length > 0) {
      const newPath = currentPathSegments.slice(0, -1);
      navigateToPath(newPath);
    }
  };

  // Navigate to a specific breadcrumb segment in flat view
  const navigateToBreadcrumb = (index: number) => {
    // If index is -1, navigate to root
    if (index === -1) {
      navigateToPath([]);
      return;
    }

    const newPath = currentPathSegments.slice(0, index + 1);
    navigateToPath(newPath);
  };

  // Get current level items for flat view (both categories and files)
  const getCurrentLevelItems = () => {
    if (!currentCategory && currentPathSegments.length === 0) {
      // At root level
      return {
        categories: contentIndex.categories || [],
        files: [],
      };
    } else if (currentCategory) {
      // Inside a category
      return {
        categories: currentCategory.categories || [],
        files: currentCategory.files || [],
      };
    }

    return { categories: [], files: [] };
  };

  const { categories, files } = getCurrentLevelItems();

  // Resolve category names from IDs for breadcrumbs
  const breadcrumbs = React.useMemo(() => {
    const result: { id: string; name: string }[] = [];

    let currentCategories = contentIndex.categories || [];

    for (const segment of currentPathSegments) {
      const category = currentCategories.find((cat) => cat.id === segment);
      if (category) {
        result.push({ id: segment, name: category.name });
        currentCategories = category.categories || [];
      } else {
        // If we can't find the category, use the ID as the name
        result.push({ id: segment, name: segment });
      }
    }

    return result;
  }, [currentPathSegments, contentIndex]);

  console.log(breadcrumbs);

  return (
    <div className="h-full flex flex-col overflow-hidden" ref={containerRef}>
      {/* View toggle tabs */}
      <div className="mb-4">
        <Tabs
          value={viewType}
          onValueChange={(value) => setViewType(value as "tree" | "flat")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full mb-3">
            <TabsTrigger value="tree" className="flex items-center">
              <FolderTree size={14} className="mr-2" />
              Tree View
            </TabsTrigger>
            <TabsTrigger value="flat" className="flex items-center">
              <LayoutGrid size={14} className="mr-2" />
              Flat View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tree" className="mt-0 h-full">
            {/* Traditional tree view */}
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
          </TabsContent>

          <TabsContent value="flat" className="mt-0 h-full flex flex-col">
            {/* Flat view navigation with breadcrumbs */}
            <div className="mb-3">
              <BreadcrumbView
                onBreadCrubClick={navigateToBreadcrumb}
                breadcrumbs={breadcrumbs}
              />
            </div>

            {/* Flat directory content */}
            <ScrollArea className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPathSegments.join("/")}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-2"
                >
                  <FlatDirectoryView
                    parentCategory={
                      breadcrumbs.length > 0
                        ? breadcrumbs[breadcrumbs.length - 1].id
                        : undefined
                    }
                    categories={categories}
                    files={files}
                    onSelectCategory={navigateToDirectory}
                    onSelectFile={onFileSelect}
                    filePaths={filePaths}
                    currentFilePath={currentFilePath}
                  />
                </motion.div>
              </AnimatePresence>
            </ScrollArea>

            {/* Mobile swipe hint */}
            {isPhone &&
              viewType === "flat" &&
              currentPathSegments.length > 0 && (
                <div className="px-4 py-2 text-xs text-muted-foreground text-center italic">
                  Swipe right to go back
                </div>
              )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TabbedDocumentNavigation;
