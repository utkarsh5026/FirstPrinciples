import CardContainer, {
  type CardContainerProps,
} from "@/components/container/CardContainer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TimeRange } from "@/utils/time";
import type { ReadingHistoryItem } from "@/services/history";
import { fromSnakeToTitleCase } from "@/utils/string";
import getIconForTech from "@/components/icons";

interface TimelineCardProps {
  readingHistory: ReadingHistoryItem[];
  props: Omit<CardContainerProps, "children">;
  categories: string[];
  children: (props: {
    readingHistory: ReadingHistoryItem[];
    currentCategory: string | null;
  }) => React.ReactNode;
  handleCategoryChange: (category: string) => void;
  handleTimeRangeChange: (timeRange: TimeRange) => void;
  currentTimeRange: TimeRange;
  currentCategory: string | null;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  readingHistory,
  categories,
  props,
  children,
  handleCategoryChange,
  handleTimeRangeChange,
  currentTimeRange,
  currentCategory,
}) => {
  return (
    <CardContainer
      {...props}
      headerAction={
        <div className="flex items-center gap-2">
          <Select
            value={currentTimeRange}
            onValueChange={(v) => handleTimeRangeChange(v as TimeRange)}
          >
            <SelectTrigger className="h-8 text-xs w-24 bg-card border-border/50 focus:ring-primary/20 focus:border-primary/30 rounded-2xl">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl font-cascadia-code">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={currentCategory ?? "all"}
            onValueChange={(value) => handleCategoryChange(value)}
          >
            <SelectTrigger className="h-7 text-xs bg-card border-border/50 focus:ring-primary/20 focus:border-primary/30 rounded-2xl">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl font-cascadia-code">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => {
                const Icon = getIconForTech(category);
                return (
                  <SelectItem
                    key={category}
                    value={category}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-3 w-3 mr-1 text-primary" />
                    {fromSnakeToTitleCase(category)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      }
    >
      {children({
        readingHistory,
        currentCategory,
      })}
    </CardContainer>
  );
};

export default TimelineCard;
