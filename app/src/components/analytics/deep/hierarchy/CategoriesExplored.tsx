import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useReadingMetrics, useReadingHistory } from "@/context";
import { BookText, Rocket, Bookmark } from "lucide-react";
import { fromSnakeToTitleCase } from "@/utils/string";
import { COLORS } from "@/lib/constants";
import { useTheme } from "@/components/theme/context/ThemeContext";
import getIconForTech from "@/components/icons";
import useMobile from "@/hooks/useMobile";
import { formatRelativeTime } from "@/utils/time";

const CategoriesExplored: React.FC = () => {
  const { analyticsData } = useReadingMetrics();
  const { categoryBreakdown } = analyticsData;
  const { readingHistory } = useReadingHistory();
  const { currentTheme } = useTheme();
  const { isMobile } = useMobile();

  // Enhanced category coverage data with more stats
  const categoryCoverage = useMemo(() => {
    if (!categoryBreakdown.length) return [];

    // Find the total number of reads
    const totalReads = readingHistory.length;

    return categoryBreakdown
      .map((category, index) => {
        // Calculate various metrics
        const categoryDocs = readingHistory.filter((item) =>
          item.path.startsWith(category.name)
        );

        const lastReadItem = [...categoryDocs].sort(
          (a, b) => b.lastReadAt - a.lastReadAt
        )[0];

        const totalTimeSpent = categoryDocs.reduce(
          (sum, doc) => sum + (doc.timeSpent || 0),
          0
        );

        // Format time for display
        const timeSpentMinutes = Math.floor(totalTimeSpent / (1000 * 60));
        let timeDisplay = "";
        if (timeSpentMinutes >= 60) {
          const hours = Math.floor(timeSpentMinutes / 60);
          const mins = timeSpentMinutes % 60;
          timeDisplay = `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
        } else if (timeSpentMinutes > 0) {
          timeDisplay = `${timeSpentMinutes}m`;
        }

        // Calculate readable percentage and ranking
        const percentage =
          totalReads > 0 ? Math.round((category.value / totalReads) * 100) : 0;

        return {
          name: category.name,
          displayName: fromSnakeToTitleCase(category.name),
          value: category.value,
          percentage,
          timeSpent: totalTimeSpent,
          timeDisplay,
          lastRead: lastReadItem?.lastReadAt || null,
          color: COLORS[index % COLORS.length],
          rank: index + 1,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [categoryBreakdown, readingHistory]);

  console.log(categoryCoverage);

  if (categoryCoverage.length === 0) {
    return (
      <motion.div
        className="h-full flex items-center justify-center flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <BookText className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
        <p className="text-sm text-muted-foreground">
          No categories explored yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Start reading to discover content
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {isMobile ? (
        // Mobile version - more compact
        <div className="space-y-3">
          {categoryCoverage.map((category) => {
            const CategoryIcon = getIconForTech(category.name);
            return (
              <div key={category.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <CategoryIcon
                      className="w-3.5 h-3.5"
                      style={{ color: category.color }}
                    />
                    <span className="text-xs truncate max-w-36">
                      {category.displayName}
                    </span>
                  </div>
                  <div className="text-xs opacity-80">
                    {category.percentage}%
                  </div>
                </div>

                <Progress
                  value={category.percentage}
                  className="h-1.5"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${currentTheme.primary}10, ${currentTheme.primary}05)`,
                    borderRadius: "999px",
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : (
        // Desktop version - more details
        <div className="space-y-4">
          {categoryCoverage.map((category) => {
            const CategoryIcon = getIconForTech(category.name);

            return (
              <div
                key={category.name}
                className="space-y-2 p-2 rounded-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-10 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: category.color,
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <CategoryIcon
                          className="w-4 h-4"
                          style={{ color: category.color }}
                        />
                        <span className="text-sm font-medium truncate">
                          {category.displayName}
                        </span>
                      </div>

                      <div className="flex justify-between mt-0.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BookText className="w-3 h-3" />
                          <span>{category.value} documents</span>
                        </div>

                        {category.timeDisplay && (
                          <div className="text-xs text-muted-foreground">
                            <span>{category.timeDisplay} spent</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-1.5 flex items-center">
                      <Progress
                        value={category.percentage}
                        className="h-1.5 flex-1"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${currentTheme.primary}10, ${currentTheme.primary}05)`,
                          borderRadius: "999px",
                        }}
                      />
                      <span
                        className="ml-2 text-xs font-medium"
                        style={{ color: category.color }}
                      >
                        {category.percentage}%
                      </span>
                    </div>

                    {/* Last read timestamp (only if we have data) */}
                    {category.lastRead && (
                      <motion.div
                        className="text-xs mt-1 flex items-center gap-1.5 text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>
                          Last read {formatRelativeTime(category.lastRead)}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-border/30">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Rocket className="w-3.5 h-3.5" />
            <span>{categoryCoverage.length} categories discovered</span>
          </div>
          <div>{readingHistory.length} total reads</div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesExplored;
