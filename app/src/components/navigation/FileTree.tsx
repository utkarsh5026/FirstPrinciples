import { Category as CategoryType } from "@/services/document/document-loader";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import CategoryFile from "./CategoryFile";
import { memo, useMemo } from "react";
import Category from "./Category";

interface FileTreeProps {
  category: CategoryType;
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
    parentCategory,
  }) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasContent =
      (category.files && category.files.length > 0) ||
      (category.categories && category.categories.length > 0);

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

      const countFiles = (cat: CategoryType) => {
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
          <Category
            category={category}
            isExpanded={isExpanded}
            handleToggleExpand={handleToggleExpand}
            depth={depth}
            stats={{
              totalFilesCount,
              readFilesCount,
              todoFilesCount,
              completedFilesCount,
            }}
            parentCategory={parentCategory}
          />
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
                  parentCategory={`${parentCategory ?? ""} > ${category.name}`}
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
