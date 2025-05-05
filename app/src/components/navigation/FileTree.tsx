import { Category } from "@/services/document/document-loader";
import getIconForTech from "@/components/shared/icons";
import {
  ChevronRight,
  ChevronDown,
  BookMarked,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CategoryFile from "./CategoryFile";
import { useMemo } from "react";

interface FileTreeProps {
  category: Category;
  depth?: number;
  expandedCategories: Set<string>;
  handleToggleExpand: (categoryId: string, isExpanded: boolean) => void;
  handleSelectFile: (filePath: string) => void;
  filePaths: {
    todo: Set<string>;
    completed: Set<string>;
    read: Set<string>;
  };
  currentFilePath: string;
  showDescriptions: boolean;
}

const FileTree: React.FC<FileTreeProps> = ({
  category,
  depth = 0,
  expandedCategories,
  handleToggleExpand,
  handleSelectFile,
  filePaths,
  currentFilePath,
  showDescriptions,
}) => {
  const isExpanded = expandedCategories.has(category.id);
  const hasContent =
    (category.files && category.files.length > 0) ||
    (category.categories && category.categories.length > 0);

  const CategoryIcon = getIconForTech(category.name);

  const {
    totalFilesCount,
    readFilesCount,
    todoFilesCount,
    completedFilesCount,
  } = useMemo(() => {
    let totalFilesCount = 0;
    let readFilesCount = 0;
    let todoFilesCount = 0;
    let completedFilesCount = 0;

    const { todo, read, completed } = filePaths;

    const countFiles = (cat: Category) => {
      if (cat.files) {
        totalFilesCount += cat.files.length;
        cat.files.forEach(({ path }) => {
          if (read.has(path)) readFilesCount++;
          if (todo.has(path)) todoFilesCount++;
          if (completed.has(path)) completedFilesCount++;
        });
      }

      if (cat.categories) {
        cat.categories.forEach(countFiles);
      }
    };

    countFiles(category);

    return {
      totalFilesCount,
      readFilesCount,
      todoFilesCount,
      completedFilesCount,
    };
  }, [category, filePaths]);

  if (!hasContent) return null;

  return (
    <Collapsible key={category.id} open={isExpanded}>
      <CollapsibleTrigger asChild>
        <button
          onClick={() => handleToggleExpand(category.id, !isExpanded)}
          className={cn(
            "group flex items-start w-full rounded-md text-sm transition-colors py-2 px-2",
            "hover:bg-primary/10 hover:text-foreground",
            "focus:outline-none focus:ring-1 focus:ring-primary/30",
            isExpanded ? "bg-primary/5" : ""
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {/* Chevron icon */}
          <div className="mr-1.5 text-muted-foreground flex-shrink-0 mt-0.5">
            {isExpanded ? (
              <ChevronDown size={16} className="text-primary" />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>

          {/* Category icon for root level categories */}
          {depth === 0 && (
            <div className="flex-shrink-0 mr-2 text-primary mt-0.5">
              <CategoryIcon size={16} />
            </div>
          )}

          {/* Category name with wrapping instead of truncation */}
          <div className="flex flex-col flex-grow min-w-0">
            <span className="break-words text-left">{category.name}</span>
          </div>

          {/* File stats badges with updated colors - kept as flex-shrink-0 */}
          <div className="ml-auto flex-shrink-0 flex items-start gap-1.5 mt-0.5">
            <div className="flex items-center gap-1.5">
              {/* Only show badges with counts > 0 */}
              {completedFilesCount > 0 && (
                <div className="flex items-center">
                  <CheckCircle size={12} className="text-green-500 mr-0.5" />
                  <span className="text-xs text-green-500">
                    {completedFilesCount}
                  </span>
                </div>
              )}

              {todoFilesCount > 0 && (
                <div className="flex items-center">
                  <BookMarked size={12} className="text-primary mr-0.5" />
                  <span className="text-xs text-primary">{todoFilesCount}</span>
                </div>
              )}

              {readFilesCount > 0 && readFilesCount !== completedFilesCount && (
                <div className="flex items-center">
                  <Clock size={12} className="text-green-400 mr-0.5" />
                  <span className="text-xs text-green-400">
                    {readFilesCount - completedFilesCount}
                  </span>
                </div>
              )}

              {/* Total files counter */}
              <Badge
                variant="secondary"
                className="text-xs bg-secondary/30 ml-1 px-1.5 py-0 h-5"
              >
                {totalFilesCount}
              </Badge>
            </div>
          </div>
        </button>
      </CollapsibleTrigger>

      {/* Subcategories and files - only shown when expanded */}
      <CollapsibleContent>
        <div className="pl-4 overflow-hidden">
          {category.categories?.map((subcategory) => (
            <FileTree
              key={subcategory.id}
              category={subcategory}
              depth={depth + 1}
              expandedCategories={expandedCategories}
              handleToggleExpand={handleToggleExpand}
              handleSelectFile={handleSelectFile}
              filePaths={filePaths}
              currentFilePath={currentFilePath}
              showDescriptions={showDescriptions}
            />
          ))}

          {/* Render files with status indicators */}
          {category.files?.map((file, index) => {
            const isCurrentFile = file.path === currentFilePath;

            return (
              <CategoryFile
                key={file.path}
                file={file}
                depth={depth + 1}
                isCurrentFile={isCurrentFile}
                isTodo={filePaths.todo.has(file.path)}
                isCompleted={filePaths.completed.has(file.path)}
                isRead={filePaths.read.has(file.path)}
                fileNumber={index + 1}
                handleSelectFile={handleSelectFile}
                showDescriptions={showDescriptions}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FileTree;
