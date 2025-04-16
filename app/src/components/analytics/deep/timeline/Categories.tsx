import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Filter, BarChart3 } from "lucide-react";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import { getRandomColors } from "@/lib/constants";
import getIconForTech from "@/components/icons";
import { fromSnakeToTitleCase } from "@/utils/string";
import type { TimeRange } from "@/utils/time";
import { useCategoryStore } from "@/stores";

interface CategoriesViewProps {
  filteredHistory: ReadingHistoryItem[];
  timeRange: TimeRange;
  onSelectCategory?: (category: string) => void;
}

const CategoriesView: React.FC<CategoriesViewProps> = ({
  filteredHistory,
  timeRange,
  onSelectCategory,
}) => {
  const createCategoryBreakdown = useCategoryStore(
    (state) => state.createCategoryBreakdown
  );

  const categoryData = useMemo(() => {
    const result = createCategoryBreakdown(filteredHistory);
    const colors = getRandomColors(result.length);
    return result
      .map((category, index) => ({
        ...category,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredHistory, createCategoryBreakdown]);

  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case "week":
        return "this week";
      case "month":
        return "this month";
      case "quarter":
        return "this quarter";
      case "year":
        return "this year";
      case "all":
      default:
        return "all time";
    }
  }, [timeRange]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  if (categoryData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="relative w-16 h-16 mx-auto mb-3">
          <motion.div
            animate={{
              rotate: [0, 10, 0, -10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Filter className="h-16 w-16 mx-auto opacity-10" />
          </motion.div>
          <BarChart3 className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30" />
        </div>
        <p>No category data for this time period</p>
        <p className="text-xs mt-1">Try changing the time range filter</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
        {/* Category summary bar */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <span>{categoryData.length} categories found</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Reading activity in {timeRangeLabel}
          </div>
        </div>

        {/* Categories list */}
        {categoryData.map(({ category, count, percentage, color }, index) => {
          const CategoryIcon = getIconForTech(category);
          return (
            <motion.div
              key={category}
              custom={index}
              variants={itemVariants}
              className="group relative overflow-hidden flex items-stretch gap-2 p-3 rounded-2xl border border-border/50 cursor-pointer hover:bg-secondary/5 hover:border-primary/20 transition-all"
              onClick={() => onSelectCategory && onSelectCategory(category)}
            >
              {/* Category color bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: color }}
              />

              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                <motion.div
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 10 }}
                  className="text-foreground/70 group-hover:text-primary transition-colors"
                >
                  <CategoryIcon className="h-5 w-5" />
                </motion.div>
              </div>

              {/* Category details */}
              <div className="flex-1 pl-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {fromSnakeToTitleCase(category)}
                  </div>
                  <Badge
                    variant={count > 0 ? "default" : "outline"}
                    className="text-xs ml-2 bg-secondary/30 text-foreground border-none group-hover:bg-primary/20 transition-colors"
                  >
                    {count}×
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {count} {count === 1 ? "document" : "documents"} read in{" "}
                  {timeRangeLabel}
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full bg-secondary/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesView;
