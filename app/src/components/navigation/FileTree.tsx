import { Category } from "@/services/document/document-loader";
import getIconForTech from "@/components/icons/";
import {
  ChevronRight,
  ChevronDown,
  BookMarked,
  Clock,
  CheckCircle,
  CircleDot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  category: Category;
  depth?: number;
  expandedCategories: Set<string>;
  handleToggleExpand: (categoryId: string, isExpanded: boolean) => void;
  handleSelectFile: (filePath: string) => void;
  readFilePaths: Set<string>;
  todoFilePaths: Set<string>;
  todoCompletedPaths: Set<string>;
  currentFilePath: string;
  showDescriptions: boolean;
}

const getFileStatusIcon = (
  filePath: string,
  todoFilePaths: Set<string>,
  todoCompletedPaths: Set<string>,
  readFilePaths: Set<string>
) => {
  if (todoFilePaths.has(filePath)) {
    return <BookMarked size={12} className="text-primary flex-shrink-0" />;
  } else if (todoCompletedPaths.has(filePath)) {
    return <CheckCircle size={12} className="text-green-500 flex-shrink-0" />;
  } else if (readFilePaths.has(filePath)) {
    return <Clock size={12} className="text-blue-400 flex-shrink-0" />;
  }

  return (
    <CircleDot size={12} className="text-muted-foreground/40 flex-shrink-0" />
  );
};

// Get file status text
const getFileStatusText = (
  filePath: string,
  todoFilePaths: Set<string>,
  todoCompletedPaths: Set<string>,
  readFilePaths: Set<string>
) => {
  if (todoFilePaths.has(filePath)) {
    return "In reading list";
  } else if (todoCompletedPaths.has(filePath)) {
    return "Completed";
  } else if (readFilePaths.has(filePath)) {
    return "Previously read";
  }
  return "Unread";
};

const FileTree: React.FC<FileTreeProps> = ({
  category,
  depth = 0,
  expandedCategories,
  handleToggleExpand,
  handleSelectFile,
  readFilePaths,
  todoFilePaths,
  todoCompletedPaths,
  currentFilePath,
  showDescriptions,
}) => {
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

        {depth === 0 && (
          <div className="flex-shrink-0 mr-2 text-primary">
            <CategoryIcon size={16} />
          </div>
        )}

        <span className="truncate">{category.name}</span>

        {/* File stats badges */}
        <div className="ml-auto flex items-center gap-1.5">
          {readFiles > 0 && (
            <div className="flex items-center">
              <Clock size={12} className="text-blue-400 mr-1" />
              <span className="text-xs text-muted-foreground">{readFiles}</span>
            </div>
          )}

          {todoFiles > 0 && (
            <div className="flex items-center">
              <BookMarked size={12} className="text-primary mr-1" />
              <span className="text-xs text-muted-foreground">{todoFiles}</span>
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
          {category.subcategories?.map((subcategory) => (
            <FileTree
              key={subcategory.id}
              category={subcategory}
              depth={depth + 1}
              expandedCategories={expandedCategories}
              handleToggleExpand={handleToggleExpand}
              handleSelectFile={handleSelectFile}
              readFilePaths={readFilePaths}
              todoFilePaths={todoFilePaths}
              todoCompletedPaths={todoCompletedPaths}
              currentFilePath={currentFilePath}
              showDescriptions={showDescriptions}
            />
          ))}

          {/* Render files with status indicators */}
          {category.files?.map((file, index) => {
            const fileStatusIcon = getFileStatusIcon(
              file.path,
              todoFilePaths,
              todoCompletedPaths,
              readFilePaths
            );
            const statusText = getFileStatusText(
              file.path,
              todoFilePaths,
              todoCompletedPaths,
              readFilePaths
            );
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
                <div className="flex flex-col min-w-0">
                  <span className="truncate">
                    {index + 1}. {file.title}
                  </span>

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

export default FileTree;
