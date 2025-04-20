import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  TooltipProps,
} from "recharts";
import { motion } from "framer-motion";
import { BookIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRandomColors } from "@/lib/constants";
import { fromSnakeToTitleCase } from "@/utils/string";
import useMobile from "@/hooks/device/use-mobile";
import { useCategoryStore } from "@/stores";

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

  const enrichedData = useMemo(() => {
    if (!categoryBreakdown || categoryBreakdown.length === 0) {
      return [];
    }

    const sortedData = [...categoryBreakdown].sort(
      (a, b) => b.percentage - a.percentage
    );

    const visibleData = sortedData.slice(0, 7);

    const colors = getRandomColors(visibleData.length);

    return visibleData.map((item, index) => {
      return {
        ...item,
        name: item.category,
        value: Math.min(100, Math.round(item.percentage)), // Cap at 100%
        fill: colors[index % colors.length],
        displayValue: item.count,
        count: item.count,
        categoryCount: item.categoryCount,
      };
    });
  }, [categoryBreakdown]);

  console.log(enrichedData);

  // Empty state
  if (!enrichedData.length) {
    return (
      <motion.div
        className={cn("flex items-center justify-center h-60")}
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

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-lg rounded-lg p-3 border border-border"
        >
          <div className="flex items-center gap-2 mb-1 border-b border-border/50 pb-1">
            <div
              className="w-3 h-3 rounded-full shadow-inner"
              style={{ backgroundColor: data.fill }}
            />
            <span className="font-medium text-sm">{data.name}</span>
          </div>
          <div className="text-xs space-y-2 mt-1">
            <div className="flex justify-between items-center gap-6">
              <span className="text-muted-foreground">Completion:</span>
              <span className="font-bold text-primary">{data.value}%</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-muted-foreground">Documents:</span>
              <span className="font-medium">
                {data.count} / {data.categoryCount}
              </span>
            </div>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        cx="50%"
        cy="50%"
        startAngle={0}
        endAngle={360}
        data={enrichedData}
        barSize={isMobile ? 8 : 10}
      >
        <RadialBar dataKey="value" cornerRadius={4} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={24}
          formatter={(value) => fromSnakeToTitleCase(value)}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

export default CategoryRadialBarChart;
