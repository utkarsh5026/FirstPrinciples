import { cn } from "@/lib/utils";
import {
  BookMarked,
  CheckCircle,
  ChevronRight,
  Clock,
  Layers,
  Clock4,
  Files,
} from "lucide-react";
import { Category as CategoryType } from "@/services/document";
import { getIconForTech } from "@/components/shared/icons/iconMap";
import getTopicIcon from "@/components/shared/icons/topicIcon";
import { fromSnakeToTitleCase } from "@/utils/string";

interface CategoryProps {
  category: CategoryType;
  isExpanded: boolean;
  handleToggleExpand: (categoryId: string, isExpanded: boolean) => void;
  depth: number;
  stats: {
    completedFilesCount: number;
    todoFilesCount: number;
    readFilesCount: number;
    totalFilesCount: number;
  };
  parentCategory?: string;
  style?: React.CSSProperties;
  showExpandIcon?: boolean;
  colorIcon?: boolean;
}

const Category: React.FC<CategoryProps> = ({
  category,
  isExpanded,
  handleToggleExpand,
  depth,
  stats,
  parentCategory,
  style,
  showExpandIcon,
  colorIcon,
}) => {
  const IconComponent =
    depth === 0
      ? getIconForTech(category.name)
      : () => getTopicIcon(`${parentCategory ?? ""}>${category.name}`);

  const { todoFilesCount, readFilesCount } = stats;

  // Get subcategories count
  const subcategoriesCount = category.categories?.length ?? 0;
  console.log(parentCategory);

  // Check if this is an empty category (no files and no subcategories)
  const isEmptyCategory =
    (category.fileCount === 0 || category.fileCount === undefined) &&
    subcategoriesCount === 0;

  return (
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
        style={{ paddingLeft: `${depth * 12 + 12}px`, ...style }}
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

        <div className="flex items-center gap-1.5">
          {subcategoriesCount > 0 && (
            <div className="flex items-center  px-1.5 py-0.5 rounded-full">
              <Layers size={12} className="text-blue-400 mr-0.5" />
              <span className="text-xs text-blue-400 font-medium">
                {subcategoriesCount}
              </span>
            </div>
          )}
          {/* Only show badges with counts > 0 */}
          {stats.completedFilesCount > 0 && (
            <div className="flex items-center bg-green-500/10 px-1.5 py-0.5 rounded-full">
              <CheckCircle size={12} className="text-green-500 mr-0.5" />
              <span className="text-xs text-green-500 font-medium">
                {stats.completedFilesCount}
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

          {readFilesCount > 0 && (
            <div className="flex items-center  px-1.5 py-0.5 rounded-full">
              <Clock size={12} className="text-green-200 mr-0.5" />
              <span className="text-xs text-green-200 font-medium">
                {readFilesCount}
              </span>
            </div>
          )}

          {/* Coming Soon badge for empty categories */}
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
        </div>
      </button>
    </div>
  );
};

export default Category;
