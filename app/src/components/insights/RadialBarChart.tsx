import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  PolarAngleAxis,
  TooltipProps,
} from "recharts";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { CircleIcon, TrendingUp, BookIcon, BadgeCheck } from "lucide-react";
import useMobile from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/context";

// Types for our component
interface RadialBarChartProps {
  title?: string;
  subtitle?: string;
  height?: number | string;
  width?: number | string;
  showLegend?: boolean;
  legendPosition?: "top" | "right" | "bottom" | "left";
  barSize?: number;
  className?: string;
  showTooltip?: boolean;
  animationDuration?: number;
}

/**
 * Enhanced Radial Bar Chart with improved visuals and theme integration
 *
 * This component creates a visually stunning radial bar chart that adapts
 * to your application's theme colors and offers smooth animations.
 */
const EnhancedRadialBarChart: React.FC<RadialBarChartProps> = ({
  title = "Completion Progress",
  subtitle,
  height = "100%",
  width = "100%",
  showLegend = true,
  legendPosition = "right",
  barSize = 20,
  className,
  showTooltip = true,
  animationDuration = 1500,
}) => {
  const { currentTheme } = useTheme();
  const { isMobile } = useMobile();
  const [isAnimated, setIsAnimated] = useState(false);

  const { totalCategoryBreakdown } = useAnalytics();

  // Create a simplified color palette based on the current theme
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
        fill: colorPalette.variants[index % colorPalette.variants.length],
        displayValue: item.percentage,
        fullMark: item.categoryCount,
        cornerRadius: 4,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [totalCategoryBreakdown, colorPalette.variants]);
  console.log(enrichedData);

  // Display max value for the chart
  const maxValue = useMemo(() => {
    return Math.max(...enrichedData.map((d) => d.fullMark));
  }, [enrichedData]);

  // Calculate average completion
  const averageCompletion = useMemo(() => {
    if (enrichedData.length === 0) return 0;
    const total = enrichedData.reduce(
      (sum, item) => sum + item.displayValue,
      0
    );
    return Math.round(total / enrichedData.length);
  }, [enrichedData]);

  // Start animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Simplified animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  if (enrichedData.length === 0) {
    return (
      <motion.div
        className={cn("flex items-center justify-center h-60", className)}
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

  return (
    <motion.div
      className={cn("w-full h-full relative", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with title and average */}
      {(title || subtitle) && (
        <div
          className={cn(
            "flex justify-between items-center mb-2 px-1",
            isMobile ? "flex-col items-start space-y-1" : ""
          )}
        >
          <div>
            {title && (
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <CircleIcon className="h-3 w-3 text-primary" />
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">Average:</div>
            <div className="text-sm font-medium flex items-center">
              {averageCompletion}%
              <TrendingUp className="h-3 w-3 ml-1 text-primary" />
            </div>
          </div>
        </div>
      )}

      {/* Main chart container */}
      <div
        className={cn(
          "relative w-full overflow-hidden",
          height ? "" : "h-60",
          showLegend &&
            (legendPosition === "top" || legendPosition === "bottom")
            ? "h-[calc(100%-35px)]"
            : ""
        )}
        style={{ height: typeof height === "string" ? height : `${height}px` }}
      >
        {/* Center text when no item is active */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{averageCompletion}%</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <BadgeCheck className="h-3 w-3 mr-1 text-primary" />
              Average Completion
            </div>
          </div>
        </div>

        {/* Main chart */}
        <ResponsiveContainer width={width} height="100%">
          <RadialBarChart
            innerRadius={isMobile ? "30%" : "35%"}
            outerRadius={isMobile ? "85%" : "80%"}
            barSize={barSize}
            data={enrichedData}
            startAngle={90}
            endAngle={-270}
            cx="50%"
            cy="50%"
          >
            <PolarAngleAxis type="number" domain={[0, maxValue]} tick={false} />

            {showTooltip && (
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />
            )}

            <RadialBar
              background={{ fill: `${currentTheme.border}10` }}
              dataKey="value"
              cornerRadius={8}
              isAnimationActive={isAnimated}
              animationDuration={animationDuration}
              animationBegin={300}
            />

            {showLegend && (
              <Legend
                layout={
                  legendPosition === "top" || legendPosition === "bottom"
                    ? "horizontal"
                    : "vertical"
                }
                verticalAlign={legendPosition === "top" ? "top" : "bottom"}
                align={legendPosition === "left" ? "left" : "right"}
                wrapperStyle={{
                  padding: "10px",
                  fontSize: "12px",
                }}
              />
            )}
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default EnhancedRadialBarChart;
