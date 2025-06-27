import { cn } from "@/lib/utils";
import {
  BookMarked,
  ChevronRight,
  Clock,
  Layers,
  Clock4,
  Files,
  Info,
} from "lucide-react";
import { getIconForTech } from "@/components/shared/icons/icon-map";
import getTopicIcon from "@/components/shared/icons/topic-icon";
import { fromSnakeToTitleCase } from "@/utils/string";
import CategoryInsightsDialog from "@/components/navigation/insights/CategoryInsightsDialog";
import { Document } from "@/stores/document/document-store";

interface CategoryProps {
  category: Document;
  isExpanded: boolean;
  handleToggleExpand: (categoryId: string, isExpanded: boolean) => void;
  depth: number;
  style?: React.CSSProperties;
  showExpandIcon?: boolean;
  colorIcon?: boolean;
}

/**
 * 📁 Category Component
 *
 * This component represents a category in the document navigation tree.
 * It displays the category name, icon, and various statistics about the
 * files within it. The component is designed to be interactive and provides
 * visual feedback for user actions.
 *
 * Key Features:
 * - Expandable/collapsible functionality for tree navigation
 * - Visual badges showing reading progress and file counts
 * - Responsive design optimized for both mobile and desktop
 * - Info button that opens detailed insights about the category
 * - Smart icon selection based on category depth and context
 */
const Category: React.FC<CategoryProps> = ({
  category,
  isExpanded,
  handleToggleExpand,
  depth,
  style,
  showExpandIcon,
  colorIcon,
}) => {
  const IconComponent =
    depth === 0
      ? getIconForTech(category.name)
      : () => getTopicIcon(category.path);

  const subcategoriesCount = category.documents?.length ?? 0;

  // Check if this is an empty category (no files and no subcategories)
  const isEmptyCategory =
    (category.fileCount === 0 || category.fileCount === undefined) &&
    subcategoriesCount === 0;

  return (
    <div className="my-1.5 px-1">
      <div
        className={cn(
          "group flex items-start w-full rounded-2xl text-sm transition-all py-2.5 px-3",
          "hover:bg-primary/10 hover:text-foreground active:scale-98",
          "focus:outline-none focus:ring-1 focus:ring-primary/30",
          "touch-action-manipulation relative", // Added relative for absolute positioning
          isExpanded ? "bg-primary/10 shadow-sm" : "hover:shadow-sm"
        )}
        style={{ paddingLeft: `${depth * 12 + 12}px`, ...style }}
      >
        {/* Main clickable area for category expansion */}
        <button
          onClick={() => handleToggleExpand(category.id, !isExpanded)}
          className="flex items-start flex-grow min-w-0"
        >
          {showExpandIcon && (
            <div
              className={cn(
                "mr-2 flex-shrink-0 transition-transform duration-200 mt-0.5",
                isExpanded ? "text-primary rotate-90" : "text-muted-foreground"
              )}
            >
              <ChevronRight size={16} />
            </div>
          )}

          <div
            className={cn(
              "flex-shrink-0 mr-2 mt-0.5 text-sm",
              depth === 0 && "text-primary",
              depth === 1 && "text-foreground/70",
              depth === 2 && "text-muted-foreground",
              (isExpanded || colorIcon) && "text-primary"
            )}
          >
            <IconComponent size={16} />
          </div>

          <div className="flex flex-col flex-grow min-w-0">
            <span
              className={cn(
                "break-words text-left font-medium text-foreground/90 text-sm",
                isExpanded ? "text-primary" : ""
              )}
            >
              {fromSnakeToTitleCase(category.name)}
            </span>
          </div>
        </button>

        {/* Right side badges and info button */}
        <div className="flex items-center gap-1.5 ml-2">
          {/* Existing badges */}
          {subcategoriesCount > 0 && (
            <div className="flex items-center px-1.5 py-0.5 rounded-full">
              <Layers size={12} className="text-blue-400 mr-0.5" />
              <span className="text-xs text-blue-400 font-medium">
                {subcategoriesCount}
              </span>
            </div>
          )}

          {category.todoFiles.length > 0 && (
            <div className="flex items-center bg-primary/10 px-1.5 py-0.5 rounded-full">
              <BookMarked size={12} className="text-primary mr-0.5" />
              <span className="text-xs text-primary font-medium">
                {category.todoFiles.length}
              </span>
            </div>
          )}

          {category.readFiles.length > 0 && (
            <div className="flex items-center px-1.5 py-0.5 rounded-full">
              <Clock size={12} className="text-green-200 mr-0.5" />
              <span className="text-xs text-green-200 font-medium">
                {category.readFiles.length}
              </span>
            </div>
          )}

          {isEmptyCategory && (
            <div className="flex items-center bg-amber-500/10 px-1.5 py-0.5 rounded-full">
              <Clock4 size={12} className="text-amber-500 mr-0.5" />
              <span className="text-xs text-amber-500 font-medium">
                Coming Soon
              </span>
            </div>
          )}

          {category.files && category.files.length > 0 && (
            <div className="flex items-center bg-secondary/40 px-1.5 py-0.5 rounded-full">
              <Files size={12} className="text-muted-foreground mr-0.5" />
              <span className="text-xs text-muted-foreground font-medium">
                {category.files.length}
              </span>
            </div>
          )}

          {/* Info button with insights dialog */}

          <CategoryInsightsDialog category={category}>
            <button
              className={cn(
                "ml-1 p-1.5 rounded-full",
                "hover:bg-primary/20 hover:text-primary",
                "transition-all duration-200",
                "flex items-center justify-center",
                "opacity-0 group-hover:opacity-100", // Show on hover for desktop
                "sm:opacity-0 opacity-100", // Always visible on mobile
                "touch-manipulation",
                "focus:outline-none focus:ring-2 focus:ring-primary/30"
              )}
              onClick={(e) => {
                e.stopPropagation(); // Prevent category expansion
              }}
              aria-label={`View insights for ${category.name}`}
            >
              <Info
                size={14}
                className="text-muted-foreground hover:text-primary"
              />
            </button>
          </CategoryInsightsDialog>
        </div>
      </div>
    </div>
  );
};

export default Category;
