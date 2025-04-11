import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckSquare,
  Square,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  FileText,
  Plus,
} from "lucide-react";
import { Category, FileMetadata } from "@/utils/MarkdownLoader";
import { cn } from "@/lib/utils";
import getIconForTech from "@/components/icons/iconMap";

interface FileSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableDocuments: FileMetadata[];
  categories: Category[];
  todoList: FileMetadata[];
  onAddToTodoList: (filesToAdd: FileMetadata[]) => void;
}

/**
 * FileSelectionDialog Component
 *
 * A dialog component that displays files and categories in a tree view with checkboxes,
 * allowing users to select multiple files to add to their reading list.
 *
 * Features:
 * - Directory/tree view of categories and files
 * - Checkboxes for multi-selection
 * - Ability to expand/collapse categories
 * - Shows which files are already in the reading list
 */
const FileSelectionDialog: React.FC<FileSelectionDialogProps> = ({
  open,
  onOpenChange,
  availableDocuments,
  categories,
  todoList,
  onAddToTodoList,
}) => {
  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // State for selected files
  const [selectedFiles, setSelectedFiles] = useState<FileMetadata[]>([]);

  // State to track which files are already in the todo list
  const [existingFiles, setExistingFiles] = useState<Set<string>>(new Set());

  // Update existing files whenever todoList changes
  useEffect(() => {
    const fileSet = new Set(todoList.map((item) => item.path));
    setExistingFiles(fileSet);
  }, [todoList]);

  // Reset selected files when dialog is opened
  useEffect(() => {
    if (open) {
      setSelectedFiles([]);
    }
  }, [open]);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Toggle file selection
  const toggleFileSelection = (file: FileMetadata) => {
    setSelectedFiles((prev) => {
      const isSelected = prev.some((f) => f.path === file.path);
      if (isSelected) {
        return prev.filter((f) => f.path !== file.path);
      } else {
        return [...prev, file];
      }
    });
  };

  // Toggle selection for all files in a category
  const toggleCategorySelection = (category: Category) => {
    // Collect all files from this category and its subcategories
    const collectFiles = (cat: Category): FileMetadata[] => {
      const files = [...(cat.files || [])];
      if (cat.subcategories) {
        cat.subcategories.forEach((subcat) => {
          files.push(...collectFiles(subcat));
        });
      }
      return files;
    };

    const categoryFiles = collectFiles(category);

    // Check if all files in the category are already selected
    const allSelected = categoryFiles.every(
      (file) =>
        selectedFiles.some((f) => f.path === file.path) ||
        existingFiles.has(file.path)
    );

    if (allSelected) {
      // Deselect all files from this category
      setSelectedFiles((prev) =>
        prev.filter((f) => !categoryFiles.some((cf) => cf.path === f.path))
      );
    } else {
      // Select all files that aren't already in the todo list
      const filesToAdd = categoryFiles.filter(
        (file) =>
          !existingFiles.has(file.path) &&
          !selectedFiles.some((f) => f.path === file.path)
      );

      setSelectedFiles((prev) => [...prev, ...filesToAdd]);
    }
  };

  // Calculate if all files in a category are selected
  const isCategorySelected = (category: Category): boolean | "partial" => {
    const collectFiles = (cat: Category): FileMetadata[] => {
      const files = [...(cat.files || [])];
      if (cat.subcategories) {
        cat.subcategories.forEach((subcat) => {
          files.push(...collectFiles(subcat));
        });
      }
      return files;
    };

    const categoryFiles = collectFiles(category);

    // Skip files that are already in the todo list
    const availableFiles = categoryFiles.filter(
      (file) => !existingFiles.has(file.path)
    );

    if (availableFiles.length === 0) return false;

    const selectedCount = availableFiles.filter((file) =>
      selectedFiles.some((f) => f.path === file.path)
    ).length;

    if (selectedCount === 0) return false;
    if (selectedCount === availableFiles.length) return true;
    return "partial";
  };

  // Add selected files to the todo list
  const handleAddSelectedFiles = () => {
    onAddToTodoList(selectedFiles);
    onOpenChange(false);
  };

  // Render a category and its subcategories recursively
  const renderCategory = (category: Category, depth = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const selectionState = isCategorySelected(category);
    const hasContent =
      (category.files && category.files.length > 0) ||
      (category.subcategories && category.subcategories.length > 0);

    if (!hasContent) return null;

    const CategoryIcon = getIconForTech(category.name);

    return (
      <div key={category.id} className="mb-1">
        <div
          className={cn(
            "flex items-center rounded-md text-sm transition-colors py-2",
            "hover:bg-primary/5 hover:text-foreground",
            "focus:outline-none focus:ring-1 focus:ring-primary/30",
            { "bg-primary/5": isExpanded }
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {/* Checkbox for the category */}
          <button
            onClick={() => toggleCategorySelection(category)}
            className="mr-1.5 text-primary/70 flex-shrink-0 h-5 w-5 flex items-center justify-center"
          >
            {selectionState === true && <CheckSquare className="h-4 w-4" />}
            {selectionState === false && <Square className="h-4 w-4" />}
            {selectionState === "partial" && (
              <div className="h-4 w-4 border border-primary/70 rounded-sm flex items-center justify-center">
                <div className="h-2 w-2 bg-primary/70 rounded-sm"></div>
              </div>
            )}
          </button>

          {/* Expand/collapse button */}
          <button
            onClick={() => toggleCategory(category.id)}
            className="mr-1.5 text-muted-foreground flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown size={16} className="text-primary" />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {/* Category icon */}
          <div className="flex-shrink-0 mr-2 text-primary">
            {isExpanded ? <FolderOpen size={16} /> : <CategoryIcon size={16} />}
          </div>

          {/* Category name */}
          <span className="truncate">{category.name}</span>
        </div>

        {/* Subcategories and files */}
        {isExpanded && (
          <div className="pl-4 overflow-hidden">
            {/* Render subcategories */}
            {category.subcategories?.map((subcategory) =>
              renderCategory(subcategory, depth + 1)
            )}

            {/* Render files */}
            {category.files?.map((file) => {
              const isInTodoList = existingFiles.has(file.path);
              const isSelected = selectedFiles.some(
                (f) => f.path === file.path
              );

              return (
                <div
                  key={file.path}
                  className={cn(
                    "flex items-center rounded-md text-sm py-2",
                    "hover:bg-secondary/20 text-muted-foreground hover:text-foreground",
                    isSelected ? "bg-primary/10 text-primary" : "",
                    isInTodoList ? "opacity-50" : ""
                  )}
                  style={{ paddingLeft: `${(depth + 1) * 16}px` }}
                >
                  {/* File checkbox */}
                  <button
                    onClick={() => !isInTodoList && toggleFileSelection(file)}
                    className="mr-1.5 text-primary/70 flex-shrink-0 h-5 w-5 flex items-center justify-center"
                    disabled={isInTodoList}
                  >
                    {isInTodoList ? (
                      <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    ) : isSelected ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>

                  {/* File icon */}
                  <FileText
                    size={14}
                    className="mr-2 flex-shrink-0 text-primary/70"
                  />

                  {/* File title */}
                  <span className="truncate">{file.title}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md font-cascadia-code max-h-[85vh] flex flex-col rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-primary" />
            Add to Reading List
          </DialogTitle>
          <DialogDescription>
            Select multiple files and categories to add to your reading list
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto mt-4 max-h-[50vh]">
          <div className="px-1">
            {/* Root files section */}

            {/* Categories section */}
            {categories.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground px-2">
                    Categories
                  </h3>
                </div>

                <div>
                  {categories.map((category) => renderCategory(category))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {categories.length === 0 && availableDocuments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No documents available</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col gap-3 sm:flex-row mt-4">
          <div className="text-xs text-muted-foreground">
            Selected: {selectedFiles.length} document
            {selectedFiles.length !== 1 ? "s" : ""}
          </div>
          <Button
            onClick={handleAddSelectedFiles}
            disabled={selectedFiles.length === 0}
            className="bg-primary/90 hover:bg-primary rounded-2xl"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileSelectionDialog;
