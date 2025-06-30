import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FileTree from "./file-tree";
import FlatDirectoryView from "./flat-directory-view";
import { FolderTree, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BreadcrumbView from "./breadcrumb-view";
import { useLocalStorage, useMobile, useDocumentList } from "@/hooks";
import { useSwipeable } from "react-swipeable";
import type { Document } from "@/stores/document/document-store";
interface TabbedDocumentNavigationProps {
  categoryData: {
    tree: Document[];
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
/**
 * 🎯 A versatile document navigation component that lets users browse their files in two ways:
 * - Tree View: Classic folder structure with expandable directories 🌳
 * - Flat View: Modern Google Drive-style navigation with breadcrumbs 📱
 *
 * 🔄 Features smooth transitions and animations when switching between views or navigating directories
 * 📱 Mobile-friendly with swipe gestures for easy navigation
 * 🗂️ Keeps track of file states (read, to-do, completed) and current selections
 */
const TabbedDocumentNavigation: React.FC<TabbedDocumentNavigationProps> = ({
  categoryData,
  loading,
  onFileSelect,
  filePaths,
  currentFilePath,
  handleToggleExpand,
}) => {
  /**
   * 💾 Persists user's preferred view type (tree/flat) across sessions
   */
  const { storedValue: viewType, setValue: setViewType } = useLocalStorage(
    "viewType",
    "tree"
  );

  /**
   * 📍 Tracks current location in the directory structure
   */
  const [currentPathSegments, setCurrentPathSegments] = useState<string[]>([]);

  /**
   * 📂 Maintains reference to current directory for flat view
   */
  const [currentCategory, setCurrentCategory] = useState<Document | null>(null);

  /**
   * 📚 Provides access to the full document structure
   */
  const { docs } = useDocumentList();

  /**
   * 📱 Detects if user is on mobile for responsive features
   */
  const { isPhone } = useMobile();

  /**
   * 👆 Enables swipe navigation for mobile users
   */
  const handlers = useSwipeable({
    onSwipedRight: () => {
      if (viewType === "flat" && currentPathSegments.length > 0) {
        navigateUp();
      }
    },
    trackTouch: true,
    trackMouse: true,
  });

  /**
   * 🧭 Updates current location when navigating to a specific path
   */
  const navigateToPath = useCallback(
    (pathSegments: string[]) => {
      setCurrentPathSegments(pathSegments);

      const findCategory = (
        segments: string[],
        categories: Document[]
      ): Document | null => {
        if (segments.length === 0) return null;

        const segment = segments[0];
        const found = categories.find((cat) => cat.id === segment);

        if (!found) return null;
        if (segments.length === 1) return found;

        return findCategory(segments.slice(1), found.documents || []);
      };

      const category = findCategory(pathSegments, docs);
      setCurrentCategory(category);
    },
    [docs]
  );

  /**
   * 🔄 Syncs flat view location with current file path
   */
  useEffect(() => {
    if (viewType === "flat" && currentFilePath) {
      const pathParts = currentFilePath.split("/");
      const dirPath = pathParts.slice(0, -1);
      navigateToPath(dirPath);
    }
  }, [currentFilePath, viewType, docs, navigateToPath]);

  /**
   * 📂 Handles navigation into a directory
   */
  const navigateToDirectory = useCallback(
    (categoryId: string) => {
      const newPath = [...currentPathSegments, categoryId];
      navigateToPath(newPath);
    },
    [currentPathSegments, navigateToPath]
  );

  /**
   * ⬆️ Handles navigation to parent directory
   */
  const navigateUp = useCallback(() => {
    if (currentPathSegments.length > 0) {
      const newPath = currentPathSegments.slice(0, -1);
      navigateToPath(newPath);
    }
  }, [currentPathSegments, navigateToPath]);

  /**
   * 🔗 Handles navigation via breadcrumb clicks
   */
  const navigateToBreadcrumb = useCallback(
    (index: number) => {
      if (index === -1) {
        navigateToPath([]);
        return;
      }

      const newPath = currentPathSegments.slice(0, index + 1);
      navigateToPath(newPath);
    },
    [currentPathSegments, navigateToPath]
  );

  /**
   * 📑 Provides current directory contents
   */
  const { categories, files } = useMemo(() => {
    if (!currentCategory && currentPathSegments.length === 0) {
      return {
        categories: docs || [],
        files: [],
      };
    } else if (currentCategory) {
      return {
        categories: currentCategory.documents || [],
        files: currentCategory.files || [],
      };
    }
    return { categories: [], files: [] };
  }, [currentCategory, currentPathSegments, docs]);

  /**
   * 🗺️ Generates breadcrumb trail for current location
   */
  const breadcrumbs = useMemo(() => {
    const result: { id: string; name: string; path: string }[] = [];

    let currentCategories = docs;

    for (const segment of currentPathSegments) {
      const category = currentCategories.find((cat) => cat.id === segment);
      if (category) {
        result.push({ id: segment, name: category.name, path: category.path });
        currentCategories = category.documents || [];
      } else result.push({ id: segment, name: segment, path: segment });
    }

    return result;
  }, [currentPathSegments, docs]);

  return (
    <div className="h-full flex flex-col overflow-hidden" {...handlers}>
      {/* View toggle tabs */}
      <div className="mb-4">
        <Tabs
          value={viewType}
          onValueChange={(value) => setViewType(value as "tree" | "flat")}
          className="w-full"
        >
          <div className="flex items-center justify-end w-full">
            <TabsList className="grid grid-cols-2 mb-3">
              <TabsTrigger value="tree" className="flex items-center">
                <FolderTree size={14} className="mr-2" />
              </TabsTrigger>
              <TabsTrigger value="flat" className="flex items-center">
                <LayoutGrid size={14} className="mr-2" />
              </TabsTrigger>
            </TabsList>
          </div>

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
