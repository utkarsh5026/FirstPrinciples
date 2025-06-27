import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CircleIcon, TrendingUp, BookIcon, BadgeCheck } from "lucide-react";
import useMobile from "@/hooks/device/use-mobile";
import { cn } from "@/lib/utils";
import CategoryRadialBarChart from "@/components/insights/CategoryRadialBarChart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCategoryStore } from "@/stores";

interface CategoryRadialChartProps {
  title?: string;
  subtitle?: string;
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
  className,
}) => {
  const { isMobile } = useMobile();

  const totalCategoryBreakdown = useCategoryStore(
    (state) => state.categoryBreakdown
  );

  // Calculate average completion
  const averageCompletion = useMemo(() => {
    if (totalCategoryBreakdown.length === 0) return 0;
    const total = totalCategoryBreakdown.reduce(
      (sum, item) => sum + item.count,
      0
    );
    return Math.round(total / totalCategoryBreakdown.length);
  }, [totalCategoryBreakdown]);

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
    <Card className={cn("w-full h-full rounded-2xl border-none", className)}>
      <CardHeader>
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
                <p className="text-xs text-muted-foreground mt-0.5">
                  {subtitle}
                </p>
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
      </CardHeader>

      <CardContent className={cn("relative w-full overflow-auto h-full")}>
        <CategoryRadialBarChart />

        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{averageCompletion}%</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <BadgeCheck className="h-3 w-3 mr-1 text-primary" />
              Average Completion
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryRadialChart;
