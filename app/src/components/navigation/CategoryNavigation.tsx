// src/components/navigation/CategoryNavigation.tsx
import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FileText,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Category, FileMetadata, MarkdownLoader } from "@/utils/MarkdownLoader";

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

  // Load categories and expand the category of the current file
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);

        // Load the content index
        const contentIndex = await MarkdownLoader.loadContentIndex();
        setCategories(contentIndex.categories || []);
        setRootFiles(contentIndex.files || []);

        // If there is a current file, expand its category path
        if (currentFilePath) {
          const breadcrumbs = await MarkdownLoader.getFileBreadcrumbs(
            currentFilePath
          );
          const newExpandedCategories = new Set(expandedCategories);

          breadcrumbs.forEach((crumb) => {
            newExpandedCategories.add(crumb.id);
          });

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

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpandedCategories = new Set(expandedCategories);

    if (newExpandedCategories.has(categoryId)) {
      newExpandedCategories.delete(categoryId);
    } else {
      newExpandedCategories.add(categoryId);
    }

    setExpandedCategories(newExpandedCategories);
  };

  // Get the appropriate icon component
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return FileText;

    // Try to get the icon from lucide-react
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || FileText; // Fallback to FileText if icon not found
  };

  // Render a file item
  const renderFile = (file: FileMetadata, indent: number = 0) => {
    const isActive = currentFilePath === file.path;

    return (
      <div
        key={file.path}
        className={cn(
          "flex items-center py-1.5 px-2 rounded-md text-sm cursor-pointer transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-gray-300 hover:text-white hover:bg-[#252525]",
          "group"
        )}
        style={{ paddingLeft: `${indent * 12 + 8}px` }}
        onClick={() => onSelectFile(file.path)}
      >
        <File size={16} className="mr-2 flex-shrink-0" />
        <span className="truncate flex-1">{file.title || file.path}</span>
      </div>
    );
  };

  // Recursively render a category and its contents
  const renderCategory = (category: Category, indent: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const IconComponent = getIconComponent(category.icon);

    return (
      <div key={category.id} className="category-item">
        <div
          className={cn(
            "flex items-center py-1.5 px-2 rounded-md text-sm cursor-pointer transition-colors",
            "text-gray-300 hover:text-white hover:bg-[#252525]",
            "group"
          )}
          style={{ paddingLeft: `${indent * 12}px` }}
          onClick={() => toggleCategory(category.id)}
        >
          <div className="mr-1 text-gray-500">
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>

          <div className="mr-2 text-primary">
            {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
          </div>

          <span className="truncate">{category.name}</span>
        </div>

        {isExpanded && (
          <div className="pl-2">
            {/* Render subcategories */}
            {category.subcategories?.map((subcategory) =>
              renderCategory(subcategory, indent + 1)
            )}

            {/* Render files */}
            {category.files?.map((file) => renderFile(file, indent + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn("p-4", className)}>
        <div className="animate-pulse space-y-2">
          <div className="h-5 bg-gray-700 rounded w-3/4"></div>
          <div className="h-5 bg-gray-700 rounded w-1/2"></div>
          <div className="h-5 bg-gray-700 rounded w-4/5"></div>
          <div className="h-5 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4", className)}>
        <div className="text-red-400 text-sm p-2 border border-red-800 bg-red-900/20 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("navigation-container", className)}>
      <nav className="space-y-0.5">
        {/* Render root-level files */}
        {rootFiles.length > 0 && (
          <div className="mb-2">
            {rootFiles.map((file) => renderFile(file))}
          </div>
        )}

        {/* Divider if both root files and categories exist */}
        {rootFiles.length > 0 && categories.length > 0 && (
          <div className="border-t border-[#303030] my-3"></div>
        )}

        {/* Render categories */}
        {categories.map((category) => renderCategory(category))}
      </nav>
    </div>
  );
};

export default CategoryNavigation;
