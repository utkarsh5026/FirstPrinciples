import { Clock } from "lucide-react";
import { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import { formatTimeAgo } from "@/utils/time";
import { getIconForTech } from "@/components/shared/icons/iconMap";

interface ReadingItemProps {
  item: ReadingHistoryItem;
  onFileSelect: (path: string) => void;
}

const ReadingItem = ({ item, onFileSelect }: ReadingItemProps) => {
  const category = item.path.split("/")[0];
  const CategoryIcon = getIconForTech(category);
  return (
    <button
      className="bg-card border border-border/20 p-4 rounded-2xl shadow-sm cursor-pointer transition-all hover:shadow-md"
      onClick={() => onFileSelect(item.path)}
    >
      <div className="flex gap-2 justify-between">
        <div className="flex items-center mb-2 justify-start">
          <div className="mr-2 bg-primary/10 rounded-full p-1.5">
            <CategoryIcon size={14} className="text-primary" />
          </div>
          <h4 className="font-medium text-sm flex-1 break-words text-start">
            {item.title}
          </h4>
        </div>

        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="flex items-center">
            <Clock size={12} className="text-muted-foreground mr-1.5" />
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(item.lastReadAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-secondary/20 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground mb-1">Time spent</div>
          <div className="text-sm font-medium">
            {Math.round(item.timeSpent / 60000)} min
          </div>
        </div>
        <div className="bg-secondary/20 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground mb-1">
            Sections Completed
          </div>
          <div className="text-sm font-medium">
            {item.completedSectionIndices?.length}
          </div>
        </div>
      </div>
    </button>
  );
};

export default ReadingItem;
