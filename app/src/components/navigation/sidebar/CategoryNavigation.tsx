import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  X,
  BookOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  LayoutDashboard,
  Clock,
  BookMarked,
  CheckCircle,
  CircleDot,
  Info,
} from "lucide-react";
import { type Category, type FileMetadata } from "@/services/document";
import { getIconForTech } from "@/components/icons/iconMap";
import { useDocumentStore } from "@/stores/document/document-store";
import { useHistoryStore } from "@/stores/reading/history-store";
import { useReadingStore } from "@/stores/readingStore";

// Types for our component props
interface ResponsiveSidebarProps {
  onSelectFile: (filepath: string) => void;
  currentFilePath?: string;
  className?: string;
  onNavigateHome: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  onSelectFile,
  currentFilePath,
  className,
  onNavigateHome,
  sidebarOpen,
  setSidebarOpen,
}) => {
  // State variables
  const [categories, setCategories] = useState<Category[]>([]);
  const [rootFiles, setRootFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLegend, setShowLegend] = useState(false);
  const [showDescriptions, setShowDescriptions] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Store hooks for document, history, and todo list
  const contentIndex = useDocumentStore((state) => state.contentIndex);
  const getFileBreadcrumbs = useDocumentStore(
    (state) => state.getFileBreadcrumbs
  );
  const readingHistory = useHistoryStore((state) => state.readingHistory);
  const todoList = useReadingStore((state) => state.todoList);

  // Keep track of read files and todo items
  const [readFilePaths, setReadFilePaths] = useState<Set<string>>(new Set());
  const [todoFilePaths, setTodoFilePaths] = useState<Set<string>>(new Set());
  const [todoCompletedPaths, setTodoCompletedPaths] = useState<Set<string>>(
    new Set()
  );

  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create file maps for read status and todo status
  useEffect(() => {
    // Create set of read file paths
    const readPaths = new Set<string>();
    readingHistory.forEach((item) => {
      readPaths.add(item.path);
    });
    setReadFilePaths(readPaths);

    // Create sets for todo items (pending and completed)
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

  // Toggle category expansion
  const handleToggleExpand = (categoryId: string, isExpanded: boolean) => {
    const newExpandedCategories = new Set(expandedCategories);
    if (isExpanded) {
      newExpandedCategories.add(categoryId);
    } else {
      newExpandedCategories.delete(categoryId);
    }
    setExpandedCategories(newExpandedCategories);
  };

  // Handle file selection
  const handleSelectFile = (filepath: string) => {
    onSelectFile(filepath);
    // Close sidebar after selection on mobile
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Handle Home navigation
  const handleHomeClick = () => {
    onNavigateHome();
    setSidebarOpen(false);
  };

  // Get file status icon
  const getFileStatusIcon = (filePath: string) => {
    // File is in todo list and not completed
    if (todoFilePaths.has(filePath)) {
      return <BookMarked size={12} className="text-primary flex-shrink-0" />;
    }
    // File is completed in todo list
    else if (todoCompletedPaths.has(filePath)) {
      return <CheckCircle size={12} className="text-green-500 flex-shrink-0" />;
    }
    // File has been read
    else if (readFilePaths.has(filePath)) {
      return <Clock size={12} className="text-blue-400 flex-shrink-0" />;
    }

    // No special status
    return (
      <CircleDot size={12} className="text-muted-foreground/40 flex-shrink-0" />
    );
  };

  // Get file status text
  const getFileStatusText = (filePath: string) => {
    if (todoFilePaths.has(filePath)) {
      return "In reading list";
    } else if (todoCompletedPaths.has(filePath)) {
      return "Completed";
    } else if (readFilePaths.has(filePath)) {
      return "Previously read";
    }
    return "Unread";
  };

  // Render a category item
  const renderCategoryItem = (category: Category, depth = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasContent =
      (category.files && category.files.length > 0) ||
      (category.subcategories && category.subcategories.length > 0);

    if (!hasContent) return null;

    // Get the appropriate icon for the category based on its name/type
    const CategoryIcon = getIconForTech(category.name);

    // Count read and todo files
    let totalFiles = 0;
    let readFiles = 0;
    let todoFiles = 0;

    const countFiles = (cat: Category) => {
      if (cat.files) {
        totalFiles += cat.files.length;
        cat.files.forEach((file) => {
          if (readFilePaths.has(file.path)) readFiles++;
          if (todoFilePaths.has(file.path) || todoCompletedPaths.has(file.path))
            todoFiles++;
        });
      }

      if (cat.subcategories) {
        cat.subcategories.forEach(countFiles);
      }
    };

    countFiles(category);

    return (
      <div key={category.id} className="mb-1">
        <button
          onClick={() => handleToggleExpand(category.id, !isExpanded)}
          className={cn(
            "group flex items-center w-full rounded-md text-sm transition-colors py-2 px-2",
            "hover:bg-primary/10 hover:text-foreground",
            "focus:outline-none focus:ring-1 focus:ring-primary/30",
            isExpanded ? "bg-primary/5" : ""
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <div className="mr-1.5 text-muted-foreground flex-shrink-0">
            {isExpanded ? (
              <ChevronDown size={16} className="text-primary" />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>

          <div className="flex-shrink-0 mr-2 text-primary">
            {isExpanded ? <FolderOpen size={16} /> : <CategoryIcon size={16} />}
          </div>

          <span className="truncate">{category.name}</span>

          {/* File stats badges */}
          <div className="ml-auto flex items-center gap-1.5">
            {readFiles > 0 && (
              <div className="flex items-center">
                <Clock size={12} className="text-blue-400 mr-1" />
                <span className="text-xs text-muted-foreground">
                  {readFiles}
                </span>
              </div>
            )}

            {todoFiles > 0 && (
              <div className="flex items-center">
                <BookMarked size={12} className="text-primary mr-1" />
                <span className="text-xs text-muted-foreground">
                  {todoFiles}
                </span>
              </div>
            )}

            {/* Total files counter */}
            <Badge
              variant="secondary"
              className="ml-auto text-xs bg-secondary/30"
            >
              {totalFiles}
            </Badge>
          </div>
        </button>

        {/* Subcategories and files - only shown when expanded */}
        {isExpanded && (
          <div className="pl-4 overflow-hidden">
            {/* Render subcategories */}
            {category.subcategories?.map((subcategory) =>
              renderCategoryItem(subcategory, depth + 1)
            )}

            {/* Render files with status indicators */}
            {category.files?.map((file) => {
              const fileStatusIcon = getFileStatusIcon(file.path);
              const statusText = getFileStatusText(file.path);
              const isCurrentFile = file.path === currentFilePath;

              return (
                <button
                  key={file.path}
                  className={cn(
                    "flex items-center w-full rounded-md text-sm cursor-pointer transition-colors py-2 px-2 my-1",
                    "text-left focus:outline-none focus:ring-1 focus:ring-primary/30",
                    isCurrentFile
                      ? "bg-primary/15 text-primary font-medium"
                      : "hover:bg-secondary/20 text-muted-foreground hover:text-foreground",
                    todoFilePaths.has(file.path) &&
                      "border-l-2 border-primary/30 pl-1.5",
                    todoCompletedPaths.has(file.path) &&
                      "border-l-2 border-green-500/30 pl-1.5",
                    readFilePaths.has(file.path) &&
                      !todoFilePaths.has(file.path) &&
                      !todoCompletedPaths.has(file.path) &&
                      "text-muted-foreground"
                  )}
                  style={{ paddingLeft: `${(depth + 1) * 16}px` }}
                  onClick={() => handleSelectFile(file.path)}
                >
                  <FileText
                    size={14}
                    className={cn(
                      "mr-2 flex-shrink-0",
                      isCurrentFile ? "text-primary" : "text-primary/60"
                    )}
                  />

                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{file.title}</span>

                    {/* Show description if enabled */}
                    {showDescriptions && (
                      <span className="text-xs text-muted-foreground truncate">
                        {statusText}
                      </span>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div className="ml-auto">{fileStatusIcon}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Get total count of files (including nested ones)
  const getTotalFiles = () => {
    const countFiles = (category: Category): number => {
      let count = category.files?.length ?? 0;
      if (category.subcategories) {
        category.subcategories.forEach((sub) => {
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

  // Get read file count
  const getReadFileCount = () => {
    return readFilePaths.size;
  };

  // Sidebar inner content
  const SidebarContent = () => (
    <div className="h-full flex flex-col overflow-hidden font-cascadia-code text-xs">
      {/* Header with title and close button */}
      <div className="sticky top-0 z-20 bg-card border-b border-border flex-shrink-0">
        <div className="px-3 py-3 flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center text-foreground">
            <BookOpen size={16} className="mr-2 text-primary" />
            Documentation
          </h3>

          <div className="flex items-center gap-2">
            {/* Description toggle switch */}
            <div className="flex items-center mr-2">
              <span className="text-xs mr-2 text-muted-foreground">
                Details
              </span>
              <Switch
                checked={showDescriptions}
                onCheckedChange={setShowDescriptions}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Legend button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground"
              onClick={() => setShowLegend(!showLegend)}
              title="Legend"
            >
              <Info size={16} />
            </Button>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Legend section */}
        {showLegend && (
          <div className="px-4 py-2 border-t border-border bg-secondary/5 text-xs">
            <div className="font-medium mb-1 text-foreground">Legend:</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex items-center">
                <Clock size={12} className="text-blue-400 mr-1.5" />
                <span>Previously read</span>
              </div>
              <div className="flex items-center">
                <BookMarked size={12} className="text-primary mr-1.5" />
                <span>In reading list</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={12} className="text-green-500 mr-1.5" />
                <span>Completed</span>
              </div>
              <div className="flex items-center">
                <CircleDot
                  size={12}
                  className="text-muted-foreground/40 mr-1.5"
                />
                <span>Unread</span>
              </div>
            </div>
            <div className="pt-1 border-t border-border/50">
              <div className="flex items-center mb-1">
                <div className="w-4 h-4 border-l-2 border-primary/30 mr-1.5"></div>
                <span>In reading list</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 border-l-2 border-green-500/30 mr-1.5"></div>
                <span>Completed</span>
              </div>
            </div>
          </div>
        )}
      </div>

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
              {/* Root files section */}
              {rootFiles.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground px-2">
                      Root Documents
                    </h3>
                  </div>

                  <div className="space-y-1">
                    {rootFiles.map((file) => {
                      const fileStatusIcon = getFileStatusIcon(file.path);
                      const statusText = getFileStatusText(file.path);
                      const isCurrentFile = file.path === currentFilePath;

                      return (
                        <button
                          key={file.path}
                          className={cn(
                            "flex items-center w-full rounded-md text-sm cursor-pointer transition-colors py-2 px-2",
                            "text-left focus:outline-none focus:ring-1 focus:ring-primary/30",
                            isCurrentFile
                              ? "bg-primary/15 text-primary font-medium"
                              : "hover:bg-secondary/20 text-muted-foreground hover:text-foreground",
                            todoFilePaths.has(file.path) &&
                              "border-l-2 border-primary/30 pl-1.5",
                            todoCompletedPaths.has(file.path) &&
                              "border-l-2 border-green-500/30 pl-1.5",
                            readFilePaths.has(file.path) &&
                              !todoFilePaths.has(file.path) &&
                              !todoCompletedPaths.has(file.path) &&
                              "text-muted-foreground"
                          )}
                          onClick={() => handleSelectFile(file.path)}
                        >
                          <FileText
                            size={14}
                            className={cn(
                              "mr-2 flex-shrink-0",
                              isCurrentFile ? "text-primary" : "text-primary/60"
                            )}
                          />

                          <div className="flex flex-col min-w-0">
                            <span className="truncate">{file.title}</span>

                            {/* Show description if enabled */}
                            {showDescriptions && (
                              <span className="text-xs text-muted-foreground truncate">
                                {statusText}
                              </span>
                            )}
                          </div>

                          {/* Status indicator */}
                          <div className="ml-auto">{fileStatusIcon}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Categories section */}
              {categories.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground px-2">
                      Categories
                    </h3>
                  </div>

                  <div>
                    {categories.map((category) => renderCategoryItem(category))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer with info/status */}
      <div className="px-3 py-2 border-t border-border/50 bg-card/50 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center">
            <BookOpen size={14} className="mr-1.5" />
            {getReadFileCount()}/{getTotalFiles()} read
          </span>
          <span className="text-primary text-xs">Documentation</span>
        </div>
      </div>
    </div>
  );

  // For mobile: render in a Sheet that takes the full screen
  if (isMobile) {
    return (
      <div className={className}>
        {/* Full screen sheet for mobile */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className="p-0 w-full h-full border-r-0 inset-0 max-w-none"
          >
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // For desktop: render as a normal sidebar
  return (
    <>
      {/* Desktop sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "h-full border-r border-border bg-card w-72 overflow-hidden fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <SidebarContent />
      </div>

      {/* Backdrop overlay for desktop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default ResponsiveSidebar;
