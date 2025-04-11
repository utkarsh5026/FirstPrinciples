import React, { useMemo } from "react";
import { Brain, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import CategoryPieChart from "@/components/insights/CategoryPieChart";
import ReadingByWeekDay from "@/components/analytics/trends/ReadingByWeekDay";
import { useReadingMetrics } from "@/context";

/**
 * 📚 ReadingInsights Component
 *
 * This component provides a delightful overview of your reading habits!
 * It showcases two main insights:
 *
 * 1. **Category Breakdown**: 🥳
 *    - Visualizes the categories of your reading materials using a pie chart.
 *    - It highlights the most read category, helping you understand your preferences better!
 *
 * 2. **Weekly Reading Patterns**: 📅
 *    - Displays your reading activity throughout the week, allowing you to see when you read the most.
 *    - If you haven't read much yet, it encourages you to read more to unlock your weekly patterns!
 *
 * The component utilizes hooks to compute the best day for reading and the best category based on your activity data.
 * It ensures that you have a clear and engaging view of your reading journey! 🌟
 */
const ReadingInsights: React.FC = () => {
  const { analyticsData } = useReadingMetrics();

  /**
   * This hook calculates the best day for reading based on your weekly activity! 📅
   * It analyzes how many times you've read on each day of the week and finds the day
   * where you read the most. If you haven't read at all, it cheerfully returns "N/A"! 😊
   */
  const bestDay = useMemo(() => {
    return analyticsData.weeklyActivity.length > 0
      ? analyticsData.weeklyActivity.reduce(
          (prev, current) => (prev.count > current.count ? prev : current),
          analyticsData.weeklyActivity[0]
        ).day
      : "N/A";
  }, [analyticsData]);

  /**
   * This hook identifies your favorite reading category! 📚✨
   * It sorts the categories based on how many times you've read in each one,
   * and then it picks the top one for you! This way, you can easily see
   * what you love to read the most! 💖
   */
  const bestCategory = useMemo(() => {
    const sorted = [...analyticsData.categoryBreakdown].sort(
      (a, b) => b.value - a.value
    );
    return sorted[0].name;
  }, [analyticsData]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-30"></div>

        <div className="relative">
          <div className="text-xs text-muted-foreground mb-2 flex items-center">
            <Brain className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
            Categories
          </div>
          <div className="h-32 w-full">
            <CategoryPieChart
              extraProps={{
                innerRadius: 25,
                outerRadius: 45,
                paddingAngle: 5,
                stroke: "transparent",
              }}
              showLegend={false}
            />
          </div>

          <div className="text-xs text-center text-muted-foreground mt-1">
            Most read:{" "}
            <span className="font-medium text-primary/90">{bestCategory}</span>
          </div>
        </div>
      </Card>

      {/* Weekly pattern */}
      <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-30"></div>

        <div className="relative">
          <div className="text-xs text-muted-foreground mb-2 flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
            Weekly Pattern
          </div>

          {analyticsData.weeklyActivity.some((day) => day.count > 0) ? (
            <div className="h-36 w-full">
              <ReadingByWeekDay />
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-center">
              <div className="text-muted-foreground text-xs">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>
                  Read more to see
                  <br />
                  your weekly patterns
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-center text-muted-foreground mt-1">
            {analyticsData.weeklyActivity.some((day) => day.count > 0) ? (
              <span>
                Best day:{" "}
                <span className="font-medium text-primary/90">{bestDay}</span>
              </span>
            ) : (
              <span>Track your reading patterns</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReadingInsights;
