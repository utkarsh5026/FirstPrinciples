import React, { memo } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReadingHistoryItem } from "@/components/home/types";
import { useTheme } from "@/components/theme/context/ThemeContext";
import getIconForTech from "@/components/icons/iconMap";

interface HistoryListProps {
  filteredHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
  formatDate: (timestamp: number) => string;
}

const HistoryList: React.FC<HistoryListProps> = memo(
  ({ filteredHistory, handleSelectDocument, formatDate }) => {
    return (
      <div className="space-y-2 md:space-y-3">
        {filteredHistory.map((item) => (
          <HistoryListItem
            key={item.path}
            item={item}
            handleSelectDocument={handleSelectDocument}
            formatDate={formatDate}
          />
        ))}
      </div>
    );
  }
);

const HistoryListItem: React.FC<{
  item: ReadingHistoryItem;
  handleSelectDocument: (path: string, title: string) => void;
  formatDate: (timestamp: number) => string;
}> = memo(({ item, handleSelectDocument, formatDate }) => {
  const { currentTheme } = useTheme();
  const category = item.path.split("/")[0] || "uncategorized";

  // Get a consistent color for the category
  const getCategoryColor = (category: string) => {
    const colors = [
      currentTheme.primary,
      `hsl(${
        parseInt(currentTheme.primary.replace(/^hsl\((\d+).*$/, "$1")) + 30
      }, 70%, 50%)`,
      `hsl(${
        parseInt(currentTheme.primary.replace(/^hsl\((\d+).*$/, "$1")) + 60
      }, 70%, 50%)`,
      `hsl(${
        parseInt(currentTheme.primary.replace(/^hsl\((\d+).*$/, "$1")) + 90
      }, 70%, 50%)`,
      `hsl(${
        parseInt(currentTheme.primary.replace(/^hsl\((\d+).*$/, "$1")) + 120
      }, 70%, 50%)`,
    ];

    // Simple hash function to get consistent index for a category
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const CategoryIcon = getIconForTech(category);

  return (
    <Card
      className="p-2 md:p-3 border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer rounded-2xl"
      onClick={() => handleSelectDocument(item.path, item.title)}
    >
      <div className="flex gap-2 md:gap-3 items-center">
        <div className="h-8 w-8 md:h-10 md:w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <CategoryIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm md:text-base line-clamp-1">
            {item.title}
          </h4>
          <div className="flex flex-wrap items-center text-xs text-muted-foreground mt-0.5 md:mt-1 gap-1 md:gap-2">
            <Badge
              variant="outline"
              className="mr-1 px-1.5 py-0 text-[10px] md:text-xs font-normal"
              style={{
                borderColor: `${getCategoryColor(category)}50`,
                color: getCategoryColor(category),
              }}
            >
              {category}
            </Badge>
            <div className="flex items-center">
              <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
              <span>{formatDate(item.lastReadAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center text-muted-foreground">
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
        </div>
      </div>
    </Card>
  );
});

export default HistoryList;
