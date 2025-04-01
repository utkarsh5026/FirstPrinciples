import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Category } from "@/utils/MarkdownLoader";
import { cn } from "@/lib/utils";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import FileItem from "./FileItem";
import { useCallback } from "react";

interface CategoryItemProps {
  category: Category;
  indent: number;
  isExpanded: boolean;
  currentFilePath?: string;
  onToggleExpand: (categoryId: string, isExpanded: boolean) => void;
  onSelectFile: (filepath: string) => void;
}

/**
 * CategoryItem Component
 *
 * This component represents a single category in a collapsible navigation structure.
 * It displays the category name, the number of files within it, and allows users to
 * expand or collapse the category to view its subcategories and files.
 *
 * Props:
 * - category (Category): The category object containing its details, including
 *   subcategories and files.
 * - indent (number): The indentation level for nested categories, used to
 *   visually represent the hierarchy.
 * - isExpanded (boolean): A flag indicating whether the category is currently
 *   expanded or collapsed.
 * - currentFilePath (string | undefined): The path of the currently selected file,
 *   used to highlight the active file.
 * - onToggleExpand (function): A callback function that is called when the user
 *   toggles the expansion state of the category. It receives the category ID and
 *   the new expansion state as arguments.
 * - onSelectFile (function): A callback function that is called when a file within
 *   the category is selected. It receives the file path as an argument.
 *
 * Hooks Used:
 * - React.FC: This is a TypeScript type for functional components in React. It
 *   allows you to define the props that the component will receive and ensures
 *   type safety.
 *
 * - cn: A utility function that combines class names conditionally. It helps
 *   manage dynamic class names based on the component's state or props.
 *
 * - Collapsible: A component that provides a collapsible behavior for its
 *   children. It manages the open/close state and provides a trigger for
 *   toggling this state.
 *
 * - CollapsibleTrigger: A component that acts as the clickable area to toggle
 *   the Collapsible component. It can contain any content, such as icons or text.
 *
 * - CollapsibleContent: A component that contains the content to be shown or
 *   hidden when the Collapsible is toggled. It can include nested components
 *   like subcategories and files.
 */
const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  indent,
  isExpanded,
  currentFilePath,
  onToggleExpand,
  onSelectFile,
}) => {
  const hasContent =
    (category.files && category.files.length > 0) ||
    (category.subcategories && category.subcategories.length > 0);

  /**
   * countFiles function
   *
   * This function counts the total number of files in a category and its subcategories.
   * It uses a recursive approach to traverse the category hierarchy.
   *
   * @param cat - The category to count files in.
   * @returns The total number of files in the category and its subcategories.
   */
  const countFiles = useCallback((cat: Category): number => {
    let count = cat.files?.length ?? 0;
    if (cat.subcategories) {
      cat.subcategories.forEach((subCat) => {
        count += countFiles(subCat);
      });
    }
    return count;
  }, []);

  if (!hasContent) return null;

  const fileCount = countFiles(category);

  return (
    <Collapsible
      key={category.id}
      open={isExpanded}
      onOpenChange={(open) => onToggleExpand(category.id, open)}
      className="category-item"
    >
      <CollapsibleTrigger
        className={cn(
          "flex items-center w-full rounded-md text-sm transition-colors py-2 px-2 my-1",
          "text-gray-300 hover:text-white hover:bg-[#252836]/50 focus:outline-none",
          "group",
          "justify-start items-start"
        )}
        style={{ paddingLeft: `${indent * 16}px` }}
      >
        <div className="mr-1 text-gray-500 flex-shrink-0">
          {isExpanded ? (
            <FiChevronDown size={16} />
          ) : (
            <FiChevronRight size={16} />
          )}
        </div>

        <span className="truncate text-left group-hover:text-purple-300">
          {category.name}
        </span>

        <div className="flex-1"></div>

        {fileCount > 0 && (
          <Badge className="ml-2 bg-purple-500/10 text-purple-400 border-purple-500/20">
            {fileCount}
          </Badge>
        )}
      </CollapsibleTrigger>

      <CollapsibleContent
        className={cn(
          "pl-2 overflow-hidden",
          "data-[state=open]:animate-collapsible-down",
          "data-[state=closed]:animate-collapsible-up"
        )}
      >
        {/* Render subcategories */}
        {category.subcategories?.map((subcategory) => (
          <CategoryItem
            key={subcategory.id}
            category={subcategory}
            indent={indent + 1}
            isExpanded={isExpanded}
            currentFilePath={currentFilePath}
            onToggleExpand={onToggleExpand}
            onSelectFile={onSelectFile}
          />
        ))}

        {/* Render files */}
        {category.files?.map((file) => (
          <FileItem
            key={file.path}
            file={file}
            indent={indent + 1}
            isActive={currentFilePath === file.path}
            onSelectFile={onSelectFile}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CategoryItem;
