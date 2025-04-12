import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CircleIcon, TrendingUp, BookIcon, BadgeCheck } from "lucide-react";
import useMobile from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/context";
import CategoryRadialBarChart from "@/components/insights/CategoryRadialBarChart";

interface CategoryRadialChartProps {
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  legendPosition?: "top" | "right" | "bottom" | "left";
  className?: string;
}

/**
 * Enhanced Radial Bar Chart with improved visuals and theme integration
 *
 * This component creates a visually stunning radial bar chart that adapts
 * to your application's theme colors and offers smooth animations.
 */
const CategoryRadialChart: React.FC<CategoryRadialChartProps> = ({
  title = "Completion Progress",
  subtitle,
  showLegend = true,
  legendPosition = "right",
  className,
}) => {
  const { isMobile } = useMobile();

  const { totalCategoryBreakdown } = useAnalytics();

  // Calculate average completion
  const averageCompletion = useMemo(() => {
    if (totalCategoryBreakdown.length === 0) return 0;
    const total = totalCategoryBreakdown.reduce(
      (sum, item) => sum + item.count,
      0
    );
    return Math.round(total / totalCategoryBreakdown.length);
  }, [totalCategoryBreakdown]);

  // Simplified animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  if (totalCategoryBreakdown.length === 0) {
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
          "relative w-full overflow-hidden h-full",
          showLegend &&
            (legendPosition === "top" || legendPosition === "bottom")
            ? "h-[calc(100%-35px)]"
            : ""
        )}
      >
        <CategoryRadialBarChart />
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
      </div>
    </motion.div>
  );
};

export default CategoryRadialChart;
