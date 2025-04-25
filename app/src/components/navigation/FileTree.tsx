import { Category } from "@/services/document/document-loader";
import getIconForTech from "@/components/icons/";
import { ChevronRight, ChevronDown, BookMarked, Clock } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CategoryFile from "./CategoryFile";

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
  const CategoryIcon = getIconForTech(category.name);

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
    <Collapsible key={category.id} open={isExpanded}>
      <CollapsibleTrigger asChild>
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
      </CollapsibleTrigger>

      {/* Subcategories and files - only shown when expanded */}
      <CollapsibleContent>
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
            const isCurrentFile = file.path === currentFilePath;

            return (
              <CategoryFile
                key={file.path}
                file={file}
                depth={depth + 1}
                isCurrentFile={isCurrentFile}
                isTodo={todoFilePaths.has(file.path)}
                isCompleted={todoCompletedPaths.has(file.path)}
                isRead={readFilePaths.has(file.path)}
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
