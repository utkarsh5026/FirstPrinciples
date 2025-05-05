import React, { useMemo } from "react";
import { RadialBarChart, RadialBar, Legend } from "recharts";
import { motion } from "framer-motion";
import { BookIcon, PieChart, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateThemeColors } from "@/utils/colors";
import { fromSnakeToTitleCase } from "@/utils/string";
import useMobile from "@/hooks/device/use-mobile";
import { useCategoryStore } from "@/stores";
import { useTheme } from "@/hooks/ui/use-theme";
import getIconForTech from "../shared/icons";
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer as ChartContainerBase,
} from "@/components/ui/chart";
import ChartContainer from "../chart/ChartContainer";

/**
 * Enhanced Radial Bar Chart with improved visuals and theme integration
 *
 * This component creates a visually stunning radial bar chart that adapts
 * to your application's theme colors and offers smooth animations.
 * - Properly spaced bars for better visual separation
 * - Mobile and desktop optimized view
 * - Animated transitions for engagement
 * - Accessible color contrast
 * - Interactive tooltips with detailed information
 */
const CategoryRadialBarChart: React.FC = () => {
  const categoryBreakdown = useCategoryStore(
    (state) => state.categoryBreakdown
  );
  const { isMobile } = useMobile();
  const { currentTheme } = useTheme();

  const enrichedData = useMemo(() => {
    if (!categoryBreakdown || categoryBreakdown.length === 0) {
      return [];
    }

    const sortedData = [...categoryBreakdown].sort(
      (a, b) => b.percentage - a.percentage
    );

    // Limit to top 7 categories for better readability
    const visibleData = sortedData.slice(0, 7);
    const colors = generateThemeColors(
      currentTheme.primary,
      visibleData.length
    );

    return visibleData.map((item, index) => {
      return {
        ...item,
        name: fromSnakeToTitleCase(item.category),
        shortName:
          fromSnakeToTitleCase(item.category).substring(0, isMobile ? 8 : 15) +
          (fromSnakeToTitleCase(item.category).length > (isMobile ? 8 : 15)
            ? "..."
            : ""),
        value: Math.min(100, Math.round(item.percentage)), // Cap at 100%
        fill: colors[index % colors.length],
        displayValue: item.count,
        count: item.count,
        categoryCount: item.categoryCount,
      };
    });
  }, [categoryBreakdown, currentTheme.primary, isMobile]);

  // Calculate metrics for the chart container
  const metrics = useMemo(() => {
    if (enrichedData.length === 0) return null;

    const mostComplete = enrichedData[0]; // Already sorted in descending order
    const totalCompleted = enrichedData.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const totalCategories = enrichedData.length;
    const overallCompletion = Math.round(
      (totalCompleted /
        enrichedData.reduce((sum, item) => sum + item.categoryCount, 0)) *
        100
    );

    return {
      mostComplete,
      totalCompleted,
      totalCategories,
      overallCompletion,
    };
  }, [enrichedData]);

  // Chart configuration

  // Empty state
  if (!enrichedData.length) {
    return (
      <motion.div
        className={cn("flex items-center justify-center h-full")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <BookIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <h3 className="text-sm font-medium mb-1">No Data Available</h3>
          <p className="text-xs text-muted-foreground">
            Complete categories to see your progress
          </p>
        </div>
      </motion.div>
    );
  }

  // Custom legend formatter for better readability
  const legendFormatter = (value: string) => {
    const item = enrichedData.find((item) => item.name === value);
    if (!item) return value;

    // Format based on screen size
    return isMobile
      ? `${item.shortName} (${item.value}%)`
      : `${item.name} - ${item.value}%`;
  };

  return (
    <ChartContainer
      left={
        metrics
          ? {
              icon: PieChart,
              label: "Top: ",
              value: metrics.mostComplete.name,
            }
          : undefined
      }
      right={
        metrics
          ? {
              icon: Award,
              value: `${metrics.overallCompletion}% complete`,
              className: "bg-primary/20 text-primary",
            }
          : undefined
      }
    >
      <ChartContainerBase config={{}}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={isMobile ? "25%" : "30%"}
          outerRadius={isMobile ? "85%" : "90%"}
          barSize={isMobile ? 8 : 12}
          data={enrichedData}
          startAngle={0}
          endAngle={360}
        >
          <RadialBar
            label={false}
            background={{ fill: currentTheme.border + "30" }}
            dataKey="value"
            cornerRadius={4}
            animationDuration={1500}
            animationBegin={300}
          />

          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(_value, _name, props) => {
                  const payload = props?.payload;
                  if (!payload) return null;

                  const CategoryIcon = getIconForTech(payload.category);
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-medium gap-2 pb-1.5 border-b border-border/50">
                        <CategoryIcon className="w-4 h-4 text-primary" />
                        {fromSnakeToTitleCase(payload.category)}
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <span className="text-muted-foreground">
                          Documents read:
                        </span>
                        <span className="font-bold text-primary text-right">
                          {payload.count}
                        </span>

                        <span className="text-muted-foreground">
                          Total in category:
                        </span>
                        <span className="text-right">
                          {payload.categoryCount}
                        </span>

                        <span className="text-muted-foreground">
                          Completion:
                        </span>
                        <span className="text-right font-medium">
                          {payload.value}%
                        </span>

                        <span className="text-muted-foreground">
                          Of total reading:
                        </span>
                        <span className="text-right">
                          {payload.percentage}%
                        </span>
                      </div>

                      {payload.count > 0 &&
                        metrics?.mostComplete.category === payload.category && (
                          <div className="mt-1 pt-1.5 border-t border-border/50 text-xs text-green-400 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Your most completed category
                          </div>
                        )}
                    </div>
                  );
                }}
              />
            }
            cursor={false}
          />

          <Legend
            iconSize={8}
            layout={isMobile ? "horizontal" : "vertical"}
            verticalAlign={isMobile ? "bottom" : "middle"}
            align={isMobile ? "center" : "right"}
            wrapperStyle={{
              fontSize: isMobile ? 10 : 12,
              paddingLeft: isMobile ? 0 : 20,
              marginTop: isMobile ? 10 : 0,
            }}
            formatter={legendFormatter}
          />
        </RadialBarChart>
      </ChartContainerBase>
    </ChartContainer>
  );
};

export default CategoryRadialBarChart;
