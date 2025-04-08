import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Search,
  X,
  BookOpen,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  LayoutDashboard,
} from "lucide-react";
import { Category, FileMetadata, MarkdownLoader } from "@/utils/MarkdownLoader";
import { getIconForTech } from "@/components/icons/iconMap";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [filteredRootFiles, setFilteredRootFiles] = useState<FileMetadata[]>(
    []
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load categories and expand parent of the current file
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        // Load real data from MarkdownLoader
        const contentIndex = await MarkdownLoader.loadContentIndex();
        setCategories(contentIndex.categories || []);
        setRootFiles(contentIndex.files || []);
        setFilteredCategories(contentIndex.categories || []);
        setFilteredRootFiles(contentIndex.files || []);

        // If there is a current file, expand its parent categories
        if (currentFilePath) {
          const breadcrumbs = await MarkdownLoader.getFileBreadcrumbs(
            currentFilePath
          );
          const newExpandedCategories = new Set<string>();

          // Add all parent categories to expanded set
          breadcrumbs.forEach((crumb) => {
            newExpandedCategories.add(crumb.id);
          });

          setExpandedCategories(newExpandedCategories);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setLoading(false);
      }
    };

    loadCategories();
  }, [currentFilePath]);

  // Handle search and filtering
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCategories(categories);
      setFilteredRootFiles(rootFiles);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();

    // Filter root files
    const matchedRootFiles = rootFiles.filter((file) => {
      const titleMatch = file.title.toLowerCase().includes(lowercaseQuery);
      const pathMatch = file.path.toLowerCase().includes(lowercaseQuery);
      return titleMatch || pathMatch;
    });

    setFilteredRootFiles(matchedRootFiles);

    // Deep filter categories
    const filterCategory = (category: Category): Category | null => {
      // Check if category name matches search query
      const nameMatches = category.name.toLowerCase().includes(lowercaseQuery);

      // Filter subcategories recursively
      const matchingSubcategories = category.subcategories
        ? category.subcategories
            .map(filterCategory)
            .filter((cat): cat is Category => cat !== null)
        : [];

      // Filter files
      const matchingFiles = category.files
        ? category.files.filter((file) => {
            const titleMatch = file.title
              .toLowerCase()
              .includes(lowercaseQuery);
            const pathMatch = file.path.toLowerCase().includes(lowercaseQuery);
            return titleMatch || pathMatch;
          })
        : [];

      // If this category or any of its children match, return the filtered version
      if (
        nameMatches ||
        matchingSubcategories.length > 0 ||
        matchingFiles.length > 0
      ) {
        // Auto-expand categories with matches when searching
        if (searchQuery) {
          setExpandedCategories((prev) => {
            const newExpanded = new Set(prev);
            if (nameMatches || matchingFiles.length > 0) {
              newExpanded.add(category.id);
            }
            return newExpanded;
          });
        }

        return {
          ...category,
          subcategories:
            matchingSubcategories.length > 0
              ? matchingSubcategories
              : undefined,
          files: matchingFiles.length > 0 ? matchingFiles : undefined,
        };
      }

      return null;
    };

    const filteredCats = categories
      .map(filterCategory)
      .filter((cat): cat is Category => cat !== null);

    setFilteredCategories(filteredCats);
  }, [searchQuery, categories, rootFiles]);

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
    // Close sidebar after selection
    setSidebarOpen(false);
  };

  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle Home navigation
  const handleHomeClick = () => {
    onNavigateHome();
    setSidebarOpen(false);
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

    return (
      <div key={category.id} className="mb-1">
        <button
          onClick={() => handleToggleExpand(category.id, !isExpanded)}
          className={cn(
            "group flex items-center w-full rounded-md text-sm transition-colors py-2 px-2",
            "hover:bg-primary/10 hover:text-foreground",
            "focus:outline-none focus:ring-1 focus:ring-primary/30 focus:bg-primary/5",
            { "bg-primary/5": isExpanded }
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

          {/* File count badge */}
          {category.files && category.files.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-auto text-xs bg-secondary/30"
            >
              {category.files.length}
            </Badge>
          )}
        </button>

        {/* Subcategories and files */}
        {isExpanded && (
          <div
            className={cn(
              "pl-4 overflow-hidden",
              "transition-all duration-200 ease-in-out"
            )}
          >
            {/* Render subcategories */}
            {category.subcategories?.map((subcategory) =>
              renderCategoryItem(subcategory, depth + 1)
            )}

            {/* Render files */}
            {category.files?.map((file) => (
              <button
                key={file.path}
                className={cn(
                  "flex items-center w-full rounded-md text-sm cursor-pointer transition-colors py-2 px-2 my-1",
                  "text-left focus:outline-none focus:ring-1 focus:ring-primary/30",
                  file.path === currentFilePath
                    ? "bg-primary/15 text-primary font-medium"
                    : "hover:bg-secondary/20 text-muted-foreground hover:text-foreground"
                )}
                style={{ paddingLeft: `${(depth + 1) * 16}px` }}
                onClick={() => handleSelectFile(file.path)}
              >
                <FileText
                  size={14}
                  className="mr-2 flex-shrink-0 text-primary/70"
                />
                <span className="truncate">{file.title}</span>
              </button>
            ))}
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

  // Sidebar inner content
  const SidebarContent = () => (
    <div className="h-full flex flex-col overflow-hidden font-cascadia-code">
      {/* Header with title and close button */}
      <div className="sticky top-0 z-20 bg-card border-b border-border flex-shrink-0">
        <div className="px-3 py-3 flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center text-foreground">
            <BookOpen size={16} className="mr-2 text-primary" />
            Documentation
          </h3>

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

        {/* Search input */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 py-1.5 h-9 bg-background/50 border-border/50 focus-visible:ring-primary/20 text-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main scrollable content */}
      <ScrollArea className="flex-1 px-2 overflow-auto">
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
              {filteredRootFiles.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground px-2">
                      Root Documents
                    </h3>
                  </div>

                  <div className="space-y-1">
                    {filteredRootFiles.map((file) => (
                      <button
                        key={file.path}
                        className={cn(
                          "flex items-center w-full rounded-md text-sm cursor-pointer transition-colors py-2 px-2",
                          "text-left focus:outline-none focus:ring-1 focus:ring-primary/30",
                          file.path === currentFilePath
                            ? "bg-primary/15 text-primary font-medium"
                            : "hover:bg-secondary/20 text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => handleSelectFile(file.path)}
                      >
                        <FileText
                          size={14}
                          className="mr-2 flex-shrink-0 text-primary/70"
                        />
                        <span className="truncate">{file.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories section */}
              {filteredCategories.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground px-2">
                      Categories
                    </h3>
                  </div>

                  <div>
                    {filteredCategories.map((category) =>
                      renderCategoryItem(category)
                    )}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filteredRootFiles.length === 0 &&
                filteredCategories.length === 0 && (
                  <div className="text-center py-10">
                    <Folder className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                    <p className="text-muted-foreground font-medium">
                      No matching documents
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Try a different search term
                    </p>
                    {searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearSearch}
                        className="mt-3"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer with info/status */}
      <div className="px-3 py-2 border-t border-border/50 bg-card/50 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{getTotalFiles()} documents</span>
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

  // For desktop: render as a normal sidebar with toggle button
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
