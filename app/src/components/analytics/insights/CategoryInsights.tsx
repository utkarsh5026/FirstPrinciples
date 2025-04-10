import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookText, PieChart as PieChartIcon, Filter } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { COLORS } from "../utils";
import useMobile from "@/hooks/useMobile";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import { ReadingStats } from "@/utils/ReadingAnalyticsService";

interface CategoryInsightsProps {
  readingHistory: ReadingHistoryItem[];
  categoryBreakdown: { name: string; value: number }[];
  stats: ReadingStats;
}

/**
 * 🎉 CategoryInsights Component
 *
 * This delightful component showcases the user's reading habits across different categories!
 * It provides a visual representation of how many documents have been read in each category,
 * helping users understand their reading preferences better. 📚✨
 *
 * With a charming pie chart, users can easily see the distribution of their reading across
 * various categories, making it fun to explore their reading journey! 🌈
 *
 * Additionally, it highlights the categories explored by the user, showing how many documents
 * have been read in each category. This encourages users to dive deeper into their reading
 * habits and discover new genres! 📖💖
 *
 * If there are no categories explored yet, it gently nudges users to read more to fill
 * their reading palette! 🌟
 */
const CategoryInsights: React.FC<CategoryInsightsProps> = React.memo(
  ({ readingHistory, stats, categoryBreakdown }) => {
    const { isMobile } = useMobile();
    return (
      <Card className="p-4 border-primary/10 rounded-2xl">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium flex items-center">
            <Filter className="h-4 w-4 mr-2 text-primary" />
            Category Insights
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="space-y-2">
            <h5 className="text-xs uppercase text-muted-foreground font-medium">
              Distribution
            </h5>

            <div className="h-48">
              {categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 30 : 40}
                      outerRadius={isMobile ? 60 : 70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number, name: string) => [
                        `${value} documents (${Math.round(
                          (value / readingHistory.length) * 100
                        )}%)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: "rgba(22, 22, 22, 0.9)",
                        border: "1px solid #333",
                        borderRadius: "4px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center flex-col">
                  <PieChartIcon className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No category data yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Categories Explored */}
          <div className="space-y-2">
            <h5 className="text-xs uppercase text-muted-foreground font-medium">
              Categories Explored
            </h5>

            <div className="h-48 overflow-auto">
              {stats.categoriesExplored.size > 0 ? (
                <div className="space-y-2">
                  {Array.from(stats.categoriesExplored).map(
                    (category, index) => {
                      const categoryDocs = readingHistory.filter((item) =>
                        item.path.startsWith(category)
                      ).length;

                      const percentage = Math.round(
                        (categoryDocs / readingHistory.length) * 100
                      );

                      return (
                        <div key={category} className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <div className="text-sm truncate">{category}</div>
                              <div className="text-xs text-muted-foreground">
                                {categoryDocs} docs
                              </div>
                            </div>
                            <Progress
                              value={percentage}
                              className="h-1.5 mt-1"
                              style={
                                {
                                  backgroundColor: `${
                                    COLORS[index % COLORS.length]
                                  }33`,
                                  "--progress-value": `${
                                    COLORS[index % COLORS.length]
                                  }`,
                                } as React.CSSProperties
                              }
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center flex-col">
                  <BookText className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No categories explored yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

export default CategoryInsights;
