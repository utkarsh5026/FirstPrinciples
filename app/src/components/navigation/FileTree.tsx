import { Category } from "@/services/document/document-loader";
import getIconForTech from "@/components/shared/icons";
import getTopicIcon from "@/components/shared/icons/topicIcon";
import { ChevronRight, BookMarked, Clock, CheckCircle } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CategoryFile from "./CategoryFile";
import { memo, useMemo } from "react";

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
  parentCategory?: string;
}

const FileTree: React.FC<FileTreeProps> = memo(
  ({
    category,
    depth = 0,
    expandedCategories,
    handleToggleExpand,
    handleSelectFile,
    filePaths,
    currentFilePath,
    showDescriptions,
    parentCategory,
  }) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasContent =
      (category.files && category.files.length > 0) ||
      (category.categories && category.categories.length > 0);

    const IconComponent =
      depth === 0
        ? getIconForTech(category.name)
        : () => getTopicIcon(`${parentCategory ?? ""}_${category.name}`);

    console.log(parentCategory);

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
          <div className="my-1.5 px-1">
            <button
              onClick={() => handleToggleExpand(category.id, !isExpanded)}
              className={cn(
                "group flex items-start w-full rounded-2xl text-sm transition-all py-2.5 px-3",
                "hover:bg-primary/10 hover:text-foreground active:scale-98",
                "focus:outline-none focus:ring-1 focus:ring-primary/30",
                "touch-action-manipulation",
                isExpanded ? "bg-primary/10 shadow-sm" : "hover:shadow-sm"
              )}
              style={{ paddingLeft: `${depth * 12 + 12}px` }}
            >
              <div
                className={cn(
                  "mr-2 flex-shrink-0 transition-transform duration-200 mt-0.5",
                  isExpanded
                    ? "text-primary rotate-90"
                    : "text-muted-foreground"
                )}
              >
                <ChevronRight size={16} />
              </div>

              <div className="flex-shrink-0 mr-2 text-primary mt-0.5">
                <IconComponent size={16} />
              </div>

              <div className="flex flex-col flex-grow min-w-0">
                <span
                  className={cn(
                    "break-words text-left font-medium",
                    isExpanded ? "text-primary" : ""
                  )}
                >
                  {category.name}
                </span>
              </div>

              {/* File stats badges */}
              <div className="ml-auto flex-shrink-0 flex items-start gap-1.5 mt-0.5">
                <div className="flex items-center gap-1.5">
                  {/* Only show badges with counts > 0 */}
                  {completedFilesCount > 0 && (
                    <div className="flex items-center bg-green-500/10 px-1.5 py-0.5 rounded-full">
                      <CheckCircle
                        size={12}
                        className="text-green-500 mr-0.5"
                      />
                      <span className="text-xs text-green-500 font-medium">
                        {completedFilesCount}
                      </span>
                    </div>
                  )}

                  {todoFilesCount > 0 && (
                    <div className="flex items-center bg-primary/10 px-1.5 py-0.5 rounded-full">
                      <BookMarked size={12} className="text-primary mr-0.5" />
                      <span className="text-xs text-primary font-medium">
                        {todoFilesCount}
                      </span>
                    </div>
                  )}

                  {readFilesCount > 0 &&
                    readFilesCount !== completedFilesCount && (
                      <div className="flex items-center bg-green-400/10 px-1.5 py-0.5 rounded-full">
                        <Clock size={12} className="text-green-200 mr-0.5" />
                        <span className="text-xs text-green-200 font-medium">
                          {readFilesCount}
                        </span>
                      </div>
                    )}

                  {/* Total files counter */}
                  <Badge
                    variant="secondary"
                    className="text-xs bg-secondary/40 ml-1 px-2 py-0.5 h-5 rounded-full"
                  >
                    {totalFilesCount}
                  </Badge>
                </div>
              </div>
            </button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent asChild>
          {isExpanded ? (
            <div className="overflow-hidden pl-4">
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
                  parentCategory={`${parentCategory ?? ""}_${category.name}`}
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
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

export default FileTree;
