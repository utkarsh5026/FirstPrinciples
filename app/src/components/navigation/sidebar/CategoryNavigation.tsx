import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  Search,
  Filter,
  X,
  BookOpen,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Category, FileMetadata, MarkdownLoader } from "@/utils/MarkdownLoader";
import { getIconForTech } from "@/components/navigation/sidebar/iconMap";

interface EnhancedSidebarProps {
  onSelectFile: (filepath: string) => void;
  currentFilePath?: string;
  className?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  onSelectFile,
  currentFilePath,
  className,
  onClose,
  isMobile = false,
}) => {
  const { currentTheme } = useTheme();
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
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load categories and expand parent of the current file
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
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
    if (!searchQuery && activeFilters.length === 0) {
      setFilteredCategories(categories);
      setFilteredRootFiles(rootFiles);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();

    // Filter root files
    const matchedRootFiles = rootFiles.filter((file) => {
      const titleMatch = file.title.toLowerCase().includes(lowercaseQuery);
      const pathMatch = file.path.toLowerCase().includes(lowercaseQuery);

      // If we have active filters, check if the file matches any filter
      if (activeFilters.length > 0) {
        const fileCategory = file.path.split("/")[0];
        return (
          (titleMatch || pathMatch) && activeFilters.includes(fileCategory)
        );
      }

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

            if (activeFilters.length > 0) {
              const fileCategory = category.name.toLowerCase();
              return (
                (titleMatch || pathMatch) &&
                (activeFilters.includes(fileCategory) ||
                  activeFilters.includes(category.id))
              );
            }

            return titleMatch || pathMatch;
          })
        : [];

      // If this category or any of its children match, return the filtered version
      if (
        nameMatches ||
        matchingSubcategories.length > 0 ||
        matchingFiles.length > 0
      ) {
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

    // Auto-expand matching categories when searching
    if (searchQuery) {
      const newExpandedCategories = new Set(expandedCategories);

      const addMatchingCategories = (cats: Category[]) => {
        cats.forEach((cat) => {
          if (cat.name.toLowerCase().includes(lowercaseQuery)) {
            newExpandedCategories.add(cat.id);
          }

          if (
            cat.files?.some(
              (file) =>
                file.title.toLowerCase().includes(lowercaseQuery) ||
                file.path.toLowerCase().includes(lowercaseQuery)
            )
          ) {
            newExpandedCategories.add(cat.id);
          }

          if (cat.subcategories) {
            addMatchingCategories(cat.subcategories);
          }
        });
      };

      addMatchingCategories(filteredCats);
      setExpandedCategories(newExpandedCategories);
    }
  }, [searchQuery, categories, rootFiles, activeFilters]);

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
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Toggle a filter
  const toggleFilter = (categoryId: string) => {
    if (activeFilters.includes(categoryId)) {
      setActiveFilters(activeFilters.filter((id) => id !== categoryId));
    } else {
      setActiveFilters([...activeFilters, categoryId]);
    }
  };

  // Render a category item
  const renderCategoryItem = (category: Category, depth = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasContent = category.files?.length || category.subcategories?.length;
    const isFilterActive = activeFilters.includes(category.id);

    if (!hasContent) return null;

    const CategoryIcon = getIconForTech(category.name);

    return (
      <div key={category.id} className="mb-1">
        <div
          className={cn(
            "group flex items-center w-full rounded-md text-sm transition-colors",
            "hover:bg-primary/10 dark:hover:text-primary-foreground my-1",
            isFilterActive && "bg-primary/20 text-primary font-medium"
          )}
          style={{ paddingLeft: `${depth * 12}px` }}
        >
          <button
            onClick={() => handleToggleExpand(category.id, !isExpanded)}
            className="flex items-center py-2 px-2 flex-1 text-left focus:outline-none focus:ring-1 focus:ring-primary/30 rounded-md"
          >
            <div className="mr-1 text-muted-foreground">
              {isExpanded ? (
                <ChevronDown size={16} className="text-primary/70" />
              ) : (
                <ChevronRight size={16} />
              )}
            </div>

            <div className="flex-shrink-0 mr-2 text-primary">
              <CategoryIcon size={16} />
            </div>

            <span className="truncate">{category.name}</span>

            {/* File count badge */}
            {category.files && category.files.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-auto text-xs px-1.5 bg-secondary/30"
              >
                {category.files.length}
              </Badge>
            )}
          </button>

          {/* Filter button - only shown when filters are active */}
          {showFilters && (
            <Button
              variant={isFilterActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-7 w-7 p-0 mr-1",
                isFilterActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => toggleFilter(category.id)}
            >
              <Filter size={14} />
            </Button>
          )}
        </div>

        {/* Subcategories and files */}
        {isExpanded && (
          <div
            className={cn(
              "pl-4 overflow-hidden transition-all duration-200",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
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

  // Loading state
  if (loading) {
    return (
      <div className={cn("px-3 py-4", className)}>
        <div className="space-y-2">
          <div className="h-9 bg-secondary/40 rounded-md animate-pulse"></div>
          <div className="space-y-3 mt-4">
            <div className="h-7 bg-secondary/40 rounded-md w-3/4 animate-pulse"></div>
            <div className="h-7 bg-secondary/40 rounded-md w-full animate-pulse"></div>
            <div className="h-7 bg-secondary/40 rounded-md w-5/6 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Search and filter header */}
      <div className="px-3 py-3 sticky top-0 bg-card z-10 border-b border-border/50">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center text-foreground">
            <BookOpen size={16} className="mr-2 text-primary" />
            Documentation
          </h3>

          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
            >
              <X size={16} />
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-7 px-2 text-xs",
                showFilters && "bg-primary/10 text-primary"
              )}
            >
              <Filter size={12} className="mr-1" />
              Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
            </Button>

            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilters([])}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>

          <Badge
            variant="outline"
            className="text-xs bg-primary/5 border-primary/20 text-primary"
          >
            {filteredRootFiles.length +
              filteredCategories.reduce(
                (acc, cat) => acc + countFiles(cat),
                0
              )}{" "}
            files
          </Badge>
        </div>
      </div>

      {/* Main scrollable content */}
      <ScrollArea className="flex-1 px-2">
        <div className="pb-4 pt-2">
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
                  Try adjusting your search or filters
                </p>
                {(searchQuery || activeFilters.length > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilters([]);
                    }}
                    className="mt-3"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
        </div>
      </ScrollArea>

      {/* Footer with info/status */}
      <div className="px-3 py-2 border-t border-border/50 bg-card/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {totalFileCount(filteredCategories, filteredRootFiles)} items
          </span>
          <span className="text-primary text-xs">{currentTheme.name}</span>
        </div>
      </div>
    </div>
  );
};

// Helper function to count all files in a category and its subcategories
const countFiles = (category: Category): number => {
  let count = category.files?.length || 0;

  if (category.subcategories) {
    category.subcategories.forEach((subCat) => {
      count += countFiles(subCat);
    });
  }

  return count;
};

// Helper function to count total files across categories and root files
const totalFileCount = (
  categories: Category[],
  rootFiles: FileMetadata[]
): number => {
  return (
    rootFiles.length + categories.reduce((acc, cat) => acc + countFiles(cat), 0)
  );
};

export default EnhancedSidebar;
