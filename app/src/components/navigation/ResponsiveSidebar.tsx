import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet";
import { type Category, type FileMetadata } from "@/services/document";
import { useDocumentStore } from "@/stores/document/document-store";
import { useHistoryStore } from "@/stores/reading/history-store";
import { useReadingStore } from "@/stores/readingStore";
import SidebarContent from "./SidebarContent";
import { BookOpen } from "lucide-react";
import Header from "./Header";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [rootFiles, setRootFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [showDescriptions, setShowDescriptions] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const contentIndex = useDocumentStore((state) => state.contentIndex);
  const getFileBreadcrumbs = useDocumentStore(
    (state) => state.getFileBreadcrumbs
  );
  const readingHistory = useHistoryStore((state) => state.readingHistory);
  const todoList = useReadingStore((state) => state.todoList);

  const [readFilePaths, setReadFilePaths] = useState<Set<string>>(new Set());
  const [todoFilePaths, setTodoFilePaths] = useState<Set<string>>(new Set());
  const [todoCompletedPaths, setTodoCompletedPaths] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const readPaths = new Set<string>();
    readingHistory.forEach(({ path }) => {
      const withMdPath = path.endsWith(".md") ? path : `${path}.md`;
      readPaths.add(withMdPath);
    });
    setReadFilePaths(readPaths);

    const todoPaths = new Set<string>();
    const completedPaths = new Set<string>();

    todoList.forEach((item) => {
      if (item.completed) {
        completedPaths.add(item.path);
      } else {
        todoPaths.add(item.path);
      }
    });

    setTodoFilePaths(todoPaths);
    setTodoCompletedPaths(completedPaths);
  }, [readingHistory, todoList]);

  // Load categories and expand parent of the current file only (not all folders)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setCategories(contentIndex.categories || []);
        setRootFiles(contentIndex.files || []);

        // If there is a current file, expand only its direct parent categories
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
    if (isExpanded) {
      newExpandedCategories.add(categoryId);
    } else {
      newExpandedCategories.delete(categoryId);
    }
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

  const getTotalFiles = () => {
    const countFiles = (category: Category): number => {
      let count = category.files?.length ?? 0;
      if (category.categories) {
        category.categories.forEach((sub) => {
          count += countFiles(sub);
        });
      }
      return count;
    };

    return (
      rootFiles.length +
      categories.reduce((acc, category) => acc + countFiles(category), 0)
    );
  };

  console.log(readFilePaths, categories);
  const getReadFileCount = () => {
    return readFilePaths.size;
  };

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent
        side="left"
        className="p-0 h-full border-r-0 inset-0 max-w-none w-screen"
      >
        <SheetHeader className="p-0">
          <Header
            showDescriptions={showDescriptions}
            setShowDescriptions={setShowDescriptions}
            showLegend={showLegend}
            setShowLegend={setShowLegend}
            setSidebarOpen={setSidebarOpen}
          />
        </SheetHeader>
        <SidebarContent
          onFileSelect={handleSelectFile}
          readFilePaths={readFilePaths}
          todoFilePaths={todoFilePaths}
          todoCompletedPaths={todoCompletedPaths}
          currentFilePath={currentFilePath}
          expandedCategories={expandedCategories}
          handleToggleExpand={handleToggleExpand}
          categories={categories}
          loading={loading}
          showDescriptions={showDescriptions}
          handleHomeClick={handleHomeClick}
        />
        <SheetFooter>
          <div className="border-border/50 bg-card/50 flex-shrink-0 font-cascadia-code px-3 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center">
                <BookOpen size={14} className="mr-1.5" />
                {getReadFileCount()}/{getTotalFiles()} read
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
