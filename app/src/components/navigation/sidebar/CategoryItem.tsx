import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Category } from "@/utils/MarkdownLoader";
import { cn } from "@/lib/utils";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import FileItem from "./FileItem";
import { useCallback } from "react";
import { getIconForTech } from "../../icons/iconMap";

interface CategoryItemProps {
  category: Category;
  indent: number;
  isExpanded: boolean;
  currentFilePath?: string;
  onToggleExpand: (categoryId: string, isExpanded: boolean) => void;
  onSelectFile: (filepath: string) => void;
  expandedCategories: Set<string>; // Pass the expanded categories Set
}

/**
 * CategoryItem Component
 *
 * This component represents a single category in a collapsible navigation structure.
 * It displays the category name, the number of files within it, and allows users to
 * expand or collapse the category to view its subcategories and files.
 */
const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  indent,
  isExpanded,
  currentFilePath,
  onToggleExpand,
  onSelectFile,
  expandedCategories, // Use this to check if subcategories are expanded
}) => {
  const hasContent =
    (category.files && category.files.length > 0) ||
    (category.subcategories && category.subcategories.length > 0);

  /**
   * countFiles function
   *
   * This function counts the total number of files in a category and its subcategories.
   * It uses a recursive approach to traverse the category hierarchy.
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
  const CategoryIcon = getIconForTech(category.name);

  return (
    <Collapsible
      key={category.id}
      open={isExpanded}
      onOpenChange={(open) => onToggleExpand(category.id, open)}
      className="category-item w-full"
    >
      <CollapsibleTrigger
        className={cn(
          "flex items-center w-full rounded-md text-sm transition-colors py-2 px-2 my-1",
          "text-gray-300 hover:text-white hover:bg-[#252836]/50 focus:outline-none",
          "group",
          "justify-start"
        )}
        style={{ paddingLeft: `${indent * 12}px` }}
      >
        <div className="mr-1.5 text-gray-500 flex-shrink-0">
          {isExpanded ? (
            <FiChevronDown size={16} />
          ) : (
            <FiChevronRight size={16} />
          )}
        </div>

        <div className="flex-shrink-0 mr-2 text-indigo-400">
          <CategoryIcon size={16} />
        </div>

        <span className="break-words text-left group-hover:text-indigo-300 leading-tight">
          {category.name}
        </span>

        <div className="flex-grow"></div>
      </CollapsibleTrigger>

      <CollapsibleContent
        className={cn(
          "pl-3 overflow-hidden",
          "data-[state=open]:animate-collapsible-down",
          "data-[state=closed]:animate-collapsible-up"
        )}
      >
        {/* Render subcategories - check expandedCategories to see if they're expanded */}
        {category.subcategories?.map((subcategory) => (
          <CategoryItem
            key={subcategory.id}
            category={subcategory}
            indent={indent + 1}
            isExpanded={expandedCategories.has(subcategory.id)} // Check if this specific subcategory is expanded
            currentFilePath={currentFilePath}
            onToggleExpand={onToggleExpand}
            onSelectFile={onSelectFile}
            expandedCategories={expandedCategories} // Pass the expanded categories set down
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
