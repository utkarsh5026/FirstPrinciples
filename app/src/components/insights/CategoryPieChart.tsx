import React, { memo, useMemo } from "react";
import { PieChart as RechartsPieChart, Pie, Cell, Sector } from "recharts";
import useMobile from "@/hooks/useMobile";
import {
  BookText,
  TrendingUp,
  PieChart,
  Shuffle,
  Filter,
  Scale,
  Target,
} from "lucide-react";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { motion } from "framer-motion";
import { CategoryBreakdown } from "@/stores/categoryStore";
import {
  ChartConfig,
  ChartContainer as ShadcnChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import getIconForTech from "../icons";
import { generateThemeColors } from "@/utils/colors";
import { fromSnakeToTitleCase, truncateText } from "@/utils/string";
import ChartContainer from "../chart/ChartContainer";

interface CategoryPieChartProps {
  descriptive?: boolean;
  categoryBreakdown: CategoryBreakdown[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = memo(
  ({ descriptive = true, categoryBreakdown }) => {
    const { isMobile } = useMobile();
    const { currentTheme } = useTheme();

    const chartThemeColors = useMemo(() => {
      const baseColor = currentTheme.primary;
      return generateThemeColors(baseColor, categoryBreakdown.length);
    }, [currentTheme, categoryBreakdown]);

    // Calculate key metrics about reading categories
    const categoryMetrics = useMemo(() => {
      if (categoryBreakdown.length === 0) return null;

      // Find most read category
      const mostRead = [...categoryBreakdown].sort(
        (a, b) => b.count - a.count
      )[0];

      // Find least read category with at least one read
      const leastRead =
        [...categoryBreakdown]
          .filter((cat) => cat.count > 0)
          .sort((a, b) => a.count - b.count)[0] || null;

      // Calculate total readings
      const totalReadings = categoryBreakdown.reduce(
        (sum, category) => sum + category.count,
        0
      );

      // Calculate total documents
      const totalDocuments = categoryBreakdown.reduce(
        (sum, category) => sum + category.categoryCount,
        0
      );

      // Calculate coverage percentage (how many categories have been read)
      const categoriesWithReads = categoryBreakdown.filter(
        (category) => category.count > 0
      ).length;

      const coveragePercentage = Math.round(
        (categoriesWithReads / categoryBreakdown.length) * 100
      );

      // Determine diversity score (how evenly reading is spread across categories)
      // Higher score means more diverse reading habits
      const equalShare = totalReadings / categoryBreakdown.length;
      const deviations = categoryBreakdown.map((cat) =>
        Math.abs(cat.count - equalShare)
      );
      const avgDeviation =
        deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;

      const diversityScore = Math.max(
        0,
        Math.min(100, Math.round(100 - (avgDeviation / (equalShare || 1)) * 50))
      );

      // Derive reading pattern description
      let readingPattern = "Balanced";
      if (mostRead && mostRead.count > totalReadings * 0.5) {
        readingPattern = "Focused";
      } else if (diversityScore > 70) {
        readingPattern = "Diverse";
      } else if (categoriesWithReads < categoryBreakdown.length * 0.5) {
        readingPattern = "Selective";
      }

      return {
        mostRead,
        leastRead,
        totalReadings,
        totalDocuments,
        categoriesWithReads,
        totalCategories: categoryBreakdown.length,
        coveragePercentage,
        diversityScore,
        readingPattern,
      };
    }, [categoryBreakdown]);

    // Create more detailed active pie sector shape
    const renderActiveShape = (props: PieSectorDataItem) => {
      const RADIAN = Math.PI / 180;
      const {
        cx = 0,
        cy = 0,
        midAngle,
        innerRadius = 0,
        outerRadius = 0,
        startAngle,
        endAngle,
        fill,
        payload,
      } = props;

      // Extract data from payload
      const data = payload as CategoryBreakdown & { name: string };

      const sin = Math.sin(-RADIAN * (midAngle ?? 0));
      const cos = Math.cos(-RADIAN * (midAngle ?? 0));
      const sx = cx + (outerRadius + 10) * cos;
      const sy = cy + (outerRadius + 10) * sin;
      const mx = cx + (outerRadius + 30) * cos;
      const my = cy + (outerRadius + 30) * sin;
      const ex = mx + (cos >= 0 ? 1 : -1) * 22;
      const ey = my;
      const textAnchor = cos >= 0 ? "start" : "end";

      return (
        <g>
          {/* Inner sector */}
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />

          {/* Outer highlight sector */}
          <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={outerRadius + 6}
            outerRadius={outerRadius + 10}
            fill={fill}
          />

          {/* Connecting line and dot */}
          <path
            d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
            stroke={fill}
            fill="none"
          />
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />

          {/* Category name and count */}
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 12}
            y={ey}
            textAnchor={textAnchor}
            fill={currentTheme.foreground}
            fontSize={12}
            fontWeight="bold"
          >
            {truncateText(fromSnakeToTitleCase(data.category), 15)}
          </text>

          {/* Percentage and count */}
        </g>
      );
    };

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
            icon: <Target className="h-4 w-4 text-primary" />,
          };
        case "Diverse":
          return {
            className: "bg-green-500/20 text-green-400",
            label: "Diverse",
            icon: <Shuffle className="h-4 w-4 text-green-400" />,
          };
        case "Selective":
          return {
            className: "bg-amber-500/20 text-amber-400",
            label: "Selective",
            icon: <Filter className="h-4 w-4 text-amber-400" />,
          };
        default:
          return {
            className: "bg-blue-500/20 text-blue-400",
            label: "Balanced",
            icon: <Scale className="h-4 w-4 text-blue-400" />,
          };
      }
    };

    const { icon, className } = getClasses();

    const left = categoryMetrics?.mostRead.category
      ? {
          icon: <PieChart className="h-4 w-4 text-primary" />,
          label: "Top: ",
          value: fromSnakeToTitleCase(categoryMetrics?.mostRead.category),
        }
      : undefined;

    const right = categoryMetrics?.leastRead.category
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
                            {payload.categoryCount > 0
                              ? Math.round(
                                  (payload.count / payload.categoryCount) * 100
                                )
                              : 0}
                            %
                          </span>

                          <span className="text-muted-foreground">
                            Of total reading:
                          </span>
                          <span className="text-right">
                            {payload.percentage}%
                          </span>
                        </div>

                        {payload.count > 0 &&
                          categoryMetrics?.mostRead.category ===
                            payload.category && (
                            <div className="mt-1 pt-1.5 border-t border-border/50 text-xs text-green-400 flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Your most-read category
                            </div>
                          )}
                      </div>
                    );
                  }}
                />
              }
              cursor={false}
            />
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
              activeShape={renderActiveShape}
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

export default CategoryPieChart;
