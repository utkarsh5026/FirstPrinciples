import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Category, FileMetadata, MarkdownLoader } from "@/utils/MarkdownLoader";
import { FiSearch } from "react-icons/fi";
import { GoFileDirectory } from "react-icons/go";
import { BsFileEarmarkText } from "react-icons/bs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import FileItem from "./FileItem";
import CategoryItem from "./CategoryItem";

interface CategoryNavigationProps {
  onSelectFile: (filepath: string) => void;
  currentFilePath?: string;
  className?: string;
}

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  onSelectFile,
  currentFilePath,
  className,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rootFiles, setRootFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [filteredRootFiles, setFilteredRootFiles] = useState<FileMetadata[]>(
    []
  );

  // Load categories and expand only the category containing the current file
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);

        // Load the content index
        const contentIndex = await MarkdownLoader.loadContentIndex();
        setCategories(contentIndex.categories || []);
        setRootFiles(contentIndex.files || []);
        setFilteredCategories(contentIndex.categories || []);
        setFilteredRootFiles(contentIndex.files || []);

        // If there is a current file, expand only its direct parent
        if (currentFilePath) {
          const breadcrumbs = await MarkdownLoader.getFileBreadcrumbs(
            currentFilePath
          );
          const newExpandedCategories = new Set<string>();

          // Add only the immediate parent category
          if (breadcrumbs.length > 0) {
            newExpandedCategories.add(breadcrumbs[breadcrumbs.length - 1].id);
          }

          setExpandedCategories(newExpandedCategories);
        }

        setError(null);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Failed to load navigation");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [currentFilePath]);

  const findParentCategories = (
    allCategories: Category[],
    targetId: string
  ): string[] => {
    const result: string[] = [];

    const searchInCategory = (
      category: Category,
      parentIds: string[] = []
    ): boolean => {
      if (category.id === targetId) {
        result.push(...parentIds);
        return true;
      }

      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          const found = searchInCategory(subcategory, [
            ...parentIds,
            category.id,
          ]);
          if (found) return true;
        }
      }

      return false;
    };

    allCategories.forEach((category) => searchInCategory(category));
    return result;
  };

  // Filter categories and files based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCategories(categories);
      setFilteredRootFiles(rootFiles);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();

    // Filter root files
    const filteredRoots = rootFiles.filter(
      (file) =>
        file.title.toLowerCase().includes(lowercaseQuery) ||
        file.path.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredRootFiles(filteredRoots);

    // Track categories that contain matching files
    const categoriesWithMatches = new Set<string>();

    // Helper function to filter categories recursively
    const filterCategory = (category: Category): Category | null => {
      // Check if category name matches
      const nameMatches = category.name.toLowerCase().includes(lowercaseQuery);

      // Filter subcategories
      let matchingSubcategories: Category[] = [];
      if (category.subcategories) {
        matchingSubcategories = category.subcategories
          .map(filterCategory)
          .filter((cat): cat is Category => cat !== null);
      }

      // Filter files in this category
      let matchingFiles: FileMetadata[] = [];
      if (category.files) {
        matchingFiles = category.files.filter(
          (file) =>
            file.title.toLowerCase().includes(lowercaseQuery) ||
            file.path.toLowerCase().includes(lowercaseQuery)
        );

        // If this category has matching files, track it
        if (matchingFiles.length > 0) {
          categoriesWithMatches.add(category.id);
        }
      }

      // If category name matches or it has matching subcategories or files, include it
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

    // Apply filter to all categories
    const filtered = categories
      .map(filterCategory)
      .filter((cat): cat is Category => cat !== null);

    setFilteredCategories(filtered);

    // If searching, expand categories that contain matches
    if (searchQuery) {
      const newExpandedCategories = new Set<string>();

      // Add all categories that contain matches
      categoriesWithMatches.forEach((id) => {
        newExpandedCategories.add(id);

        // Also add parent categories to ensure the matching categories are visible
        const parents = findParentCategories(categories, id);
        parents.forEach((parentId) => newExpandedCategories.add(parentId));
      });

      // Add categories that match by name
      const addMatchingCategories = (cats: Category[]) => {
        cats.forEach((cat) => {
          if (cat.name.toLowerCase().includes(lowercaseQuery)) {
            newExpandedCategories.add(cat.id);

            // Add parent categories
            const parents = findParentCategories(categories, cat.id);
            parents.forEach((parentId) => newExpandedCategories.add(parentId));
          }

          if (cat.subcategories) {
            addMatchingCategories(cat.subcategories);
          }
        });
      };

      addMatchingCategories(filtered);
      setExpandedCategories(newExpandedCategories);
    }
  }, [searchQuery, categories, rootFiles]);

  // Handle toggling category expansion
  const handleToggleExpand = (categoryId: string, isExpanded: boolean) => {
    const newExpandedCategories = new Set(expandedCategories);
    if (isExpanded) {
      newExpandedCategories.add(categoryId);
    } else {
      newExpandedCategories.delete(categoryId);
    }
    setExpandedCategories(newExpandedCategories);
  };

  if (loading) {
    return (
      <div className={cn("p-4", className)}>
        <div className="space-y-2">
          <div className="h-9 bg-[#252836]/40 rounded-md animate-pulse"></div>
          <div className="space-y-3 mt-4">
            <div className="h-7 bg-[#252836]/40 rounded-md w-3/4 animate-pulse"></div>
            <div className="h-7 bg-[#252836]/40 rounded-md w-full animate-pulse"></div>
            <div className="h-7 bg-[#252836]/40 rounded-md w-5/6 animate-pulse"></div>
            <div className="h-7 bg-[#252836]/40 rounded-md w-4/5 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4", className)}>
        <div className="text-red-400 text-sm p-3 border border-red-800/40 bg-red-900/10 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  // When there are no categories or files
  if (categories.length === 0 && rootFiles.length === 0) {
    return (
      <div className={cn("p-4", className)}>
        <div className="text-center p-6 border border-[#252836] rounded-md bg-[#1a1d2d]/50">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#252836] mb-3">
            <GoFileDirectory size={24} className="text-purple-400" />
          </div>
          <p className="text-gray-400">No documents available</p>
          <p className="text-sm text-gray-500 mt-2">
            Try switching to the Files tab to browse all documents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("navigation-container", className)}>
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#1a1d2d] border-[#252836] focus-visible:ring-purple-500/20 focus-visible:border-purple-500/30"
          />
        </div>
      </div>

      {/* Quick navigation for mobile */}
      <div className="md:hidden mb-4">
        {currentFilePath && (
          <div className="bg-[#1a1d2d] rounded-md p-3 mb-4 border border-[#252836]">
            <p className="text-sm text-gray-400 mb-1">Current document:</p>
            <div className="flex items-center">
              <BsFileEarmarkText className="text-indigo-400 mr-2" />
              <span className="text-primary font-medium truncate">
                {currentFilePath.split("/").pop() || currentFilePath}
              </span>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-13rem)]">
        <nav className="pr-3">
          {/* Section title for root documents */}
          {filteredRootFiles.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 px-2 py-1">
                  Root Documents
                </h3>
                <Badge
                  variant="outline"
                  className="bg-[#1a1d2d] text-xs border-[#252836]"
                >
                  {filteredRootFiles.length}
                </Badge>
              </div>

              <div className="mb-4 space-y-1">
                {filteredRootFiles.map((file) => (
                  <FileItem
                    key={file.path}
                    file={file}
                    indent={0}
                    isActive={currentFilePath === file.path}
                    onSelectFile={onSelectFile}
                  />
                ))}
              </div>
            </>
          )}

          {/* Divider if both root files and categories exist */}
          {filteredRootFiles.length > 0 && filteredCategories.length > 0 && (
            <div className="border-t border-[#252836] my-4"></div>
          )}

          {/* Section title for categories */}
          {filteredCategories.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 px-2 py-1">
                Categories
              </h3>
              <Badge
                variant="outline"
                className="bg-[#1a1d2d] text-xs border-[#252836]"
              >
                {filteredCategories.length}
              </Badge>
            </div>
          )}

          {/* Render categories */}
          <div className="space-y-1">
            {filteredCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                indent={0}
                isExpanded={expandedCategories.has(category.id)}
                currentFilePath={currentFilePath}
                onToggleExpand={handleToggleExpand}
                onSelectFile={onSelectFile}
                expandedCategories={expandedCategories} // Pass the entire set to check subcategory expansion
              />
            ))}
          </div>

          {/* No results message */}
          {searchQuery &&
            filteredCategories.length === 0 &&
            filteredRootFiles.length === 0 && (
              <div className="text-center py-8">
                <FiSearch className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                <p className="text-gray-400">No matching documents found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try a different search term
                </p>
              </div>
            )}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default CategoryNavigation;
