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
import { useTheme } from "@/components/theme/context/ThemeContext";
import { BookIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/context";

/**
 * Enhanced Radial Bar Chart with improved visuals and theme integration
 *
 * This component creates a visually stunning radial bar chart that adapts
 * to your application's theme colors and offers smooth animations.
 */
const CategoryRadialBarChart: React.FC = () => {
  const { currentTheme } = useTheme();
  const { totalCategoryBreakdown } = useAnalytics();

  const colorPalette = useMemo(() => {
    const baseColor = currentTheme.primary;

    // Simplified color adjustment function
    const adjustColor = (color: string, opacity: number) => {
      return `${color}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")}`;
    };

    return {
      primary: baseColor,
      secondary: currentTheme.secondary,
      variants: [
        baseColor,
        adjustColor(baseColor, 0.8),
        adjustColor(baseColor, 0.6),
        adjustColor(baseColor, 0.4),
        adjustColor(baseColor, 0.2),
      ],
      background: currentTheme.cardBg,
      text: currentTheme.foreground,
      muted: currentTheme.secondary,
    };
  }, [currentTheme]);

  const enrichedData = useMemo(() => {
    return totalCategoryBreakdown
      .map((item, index) => ({
        ...item,
        value: item.count,
        name: item.category,
        fill: colorPalette.variants[index % colorPalette.variants.length],
        displayValue: item.count,
        fullMark: item.categoryCount,
        cornerRadius: 4,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [totalCategoryBreakdown, colorPalette.variants]);
  console.log(enrichedData);

  if (enrichedData.length === 0) {
    return (
      <motion.div
        className={cn("flex items-center justify-center h-60")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-popover/95 border border-border p-2 px-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.fill }}
            />
            <span className="font-medium text-sm">{data.name}</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between items-center gap-6">
              <span>Completion:</span>
              <span className="font-medium text-foreground">
                {data.displayValue}%
              </span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span>Value:</span>
              <span className="font-medium text-foreground">
                {data.value} / {data.fullMark}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  console.log(enrichedData);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="50%"
        outerRadius="90%"
        barSize={10}
        data={enrichedData}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar
          background
          dataKey="value"
          cornerRadius={5}
          label={{
            position: "insideStart",
            fill: "#fff",
            fontWeight: "bold",
            fontSize: 12,
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconSize={10}
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{
            fontSize: "12px",
            paddingLeft: "10px",
            color: "var(--color-foreground)",
          }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

export default CategoryRadialBarChart;
