import React, { memo } from "react";
import { PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import useMobile from "@/hooks/device/use-mobile";
import {
  BookText,
  TrendingUp,
  PieChart,
  Shuffle,
  Filter,
  Scale,
  Target,
} from "lucide-react";
import { useTheme } from "@/hooks/ui/use-theme";
import { motion } from "framer-motion";
import type { CategoryBreakdown } from "@/stores/categoryStore";
import {
  ChartConfig,
  ChartTooltip,
  ChartContainer as ShadcnChartContainer,
} from "@/components/ui/chart";
import getIconForTech from "@/components/icons";
import { generateThemeColors } from "@/utils/colors";
import { fromSnakeToTitleCase } from "@/utils/string";
import ChartContainer from "@/components/chart/ChartContainer";
import useChartTooltip from "@/components/chart/tooltip/use-chart-tooltip";
import type { CategoryMetrics } from "@/hooks/analytics/use-category-metrics";
import ActivePieShape from "./ActivePieShape";

interface CategoryPieChartProps {
  descriptive?: boolean;
  categoryBreakdown: CategoryBreakdown[];
  categoryMetrics: CategoryMetrics | null;
}

const CategoryDistributionPieChart: React.FC<CategoryPieChartProps> = memo(
  ({ descriptive = true, categoryBreakdown, categoryMetrics }) => {
    const { isMobile } = useMobile();
    const { currentTheme } = useTheme();

    const chartThemeColors = generateThemeColors(
      currentTheme.primary,
      categoryBreakdown.length
    );

    const renderCategoryTooltip = useChartTooltip({
      getTitle: (payload) => {
        const CategoryIcon = getIconForTech(payload.category);
        return (
          <div className="flex items-center gap-2">
            <CategoryIcon className="w-4 h-4 text-primary" />
            {fromSnakeToTitleCase(payload.category)}
          </div>
        );
      },

      getSections: (payload) => [
        {
          label: "Documents read:",
          value: payload.count,
          highlight: true,
        },
        {
          label: "Total in category:",
          value: payload.categoryCount,
        },
        {
          label: "Completion:",
          value: `${
            payload.categoryCount > 0
              ? Math.round((payload.count / payload.categoryCount) * 100)
              : 0
          }%`,
        },
        {
          label: "Of total reading:",
          value: `${payload.percentage}%`,
        },
      ],

      getFooter: (payload) => {
        return payload.count > 0 &&
          categoryMetrics?.mostRead?.category === payload.category
          ? {
              message: "Your most-read category",
              icon: TrendingUp,
              className: "text-green-400",
            }
          : undefined;
      },
    });

    if (categoryBreakdown.length === 0) return <NoCategoryData />;

    const config: ChartConfig = {
      category: {
        label: "Category",
      },
    };

    const getClasses = () => {
      switch (categoryMetrics?.readingPattern) {
        case "Focused":
          return {
            className: "bg-primary/20 text-primary",
            label: "Focused",
            icon: Target,
          };
        case "Diverse":
          return {
            className: "bg-green-500/20 text-green-400",
            label: "Diverse",
            icon: Shuffle,
          };
        case "Selective":
          return {
            className: "bg-amber-500/20 text-amber-400",
            label: "Selective",
            icon: Filter,
          };
        default:
          return {
            className: "bg-blue-500/20 text-blue-400",
            label: "Balanced",
            icon: Scale,
          };
      }
    };

    const { icon, className } = getClasses();

    const left = categoryMetrics?.mostRead?.category
      ? {
          icon: PieChart,
          label: "Top: ",
          value: fromSnakeToTitleCase(categoryMetrics?.mostRead.category),
        }
      : undefined;

    const right = categoryMetrics?.leastRead?.category
      ? {
          icon: icon,
          value: `${categoryMetrics.readingPattern} reader`,
          className: className,
        }
      : undefined;

    return (
      <ChartContainer left={left} right={right}>
        <ShadcnChartContainer className="w-full h-full" config={config}>
          <RechartsPieChart>
            <ChartTooltip content={renderCategoryTooltip} cursor={false} />
            <Pie
              data={categoryBreakdown}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? "40%" : "45%"}
              outerRadius={isMobile ? "70%" : "75%"}
              paddingAngle={4}
              dataKey="percentage"
              nameKey="category"
              isAnimationActive={true}
              activeIndex={0}
              activeShape={ActivePieShape}
            >
              {categoryBreakdown.map(({ category }, index) => (
                <Cell
                  key={`${category}`}
                  fill={chartThemeColors[index % chartThemeColors.length]}
                  style={{
                    filter: index === 0 ? "brightness(1.2)" : "brightness(1.1)",
                    transition: "filter 0.3s ease",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Pie>
          </RechartsPieChart>
        </ShadcnChartContainer>

        {descriptive && categoryMetrics && (
          <div className="text-xs text-muted-foreground mt-2 px-2 py-1.5 bg-secondary/20 rounded-md flex justify-between gap-2">
            <span>
              {categoryMetrics.categoriesWithReads} of{" "}
              {categoryMetrics.totalCategories} categories explored
            </span>
            <span className="font-medium">
              {categoryMetrics.coveragePercentage}% coverage
            </span>
          </div>
        )}
      </ChartContainer>
    );
  }
);

const NoCategoryData = () => {
  return (
    <motion.div
      className="h-full flex items-center justify-center flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <BookText className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
      <p className="text-sm text-muted-foreground">No category data yet</p>
      <p className="text-xs text-muted-foreground mt-1">
        Read more documents to see insights
      </p>
    </motion.div>
  );
};

export default CategoryDistributionPieChart;
