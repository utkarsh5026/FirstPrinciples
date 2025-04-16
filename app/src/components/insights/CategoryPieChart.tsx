import React, { useMemo } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  type PieProps,
} from "recharts";
import useMobile from "@/hooks/useMobile";
import { BookText } from "lucide-react";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { fromSnakeToTitleCase, truncateText } from "@/utils/string";
import { motion } from "framer-motion";
import { getRandomColors } from "@/lib/constants";
import { useCategoryStore } from "@/stores/categoryStore";
import { useHistoryStore } from "@/stores";

interface CategoryPieChartProps {
  extraProps?: Omit<PieProps, "data" | "dataKey" | "ref">;
  showTooltip?: boolean;
  useThemeColors?: boolean;
  showLegend?: boolean;
  animationDuration?: number;
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  extraProps = {},
  useThemeColors = true,
  showLegend = true,
}) => {
  const { isMobile } = useMobile();
  const readingHistory = useHistoryStore((state) => state.readingHistory);
  const categoryBreakdown = useCategoryStore(
    (state) => state.categoryBreakdown
  );
  const { currentTheme } = useTheme();

  // Generate theme-based color palette
  const chartThemeColors = useMemo(() => {
    const baseColor = currentTheme.primary;
    // Create a palette from the primary color with different saturations and lightness
    return [
      baseColor,
      adjustColor(baseColor, { l: -10 }),
      adjustColor(baseColor, { s: -15, l: 10 }),
      adjustColor(baseColor, { h: 15, s: -10 }),
      adjustColor(baseColor, { h: -15, s: -5, l: 5 }),
    ];
  }, [currentTheme]);

  // Generate rich data with helpful tooltips
  const enrichedCategoryData = useMemo(() => {
    return categoryBreakdown.map((category) => ({
      ...category,
      displayName: fromSnakeToTitleCase(category.category),
      percentage:
        readingHistory.length > 0
          ? Math.round((category.count / readingHistory.length) * 100)
          : 0,
    }));
  }, [categoryBreakdown, readingHistory]);

  const colors = useThemeColors
    ? chartThemeColors
    : getRandomColors(categoryBreakdown.length);

  // Animated container with framer-motion
  const chartContainer = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.1,
        ease: "easeOut",
      },
    },
  };

  if (enrichedCategoryData.length === 0) {
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
  }

  return (
    <motion.div
      className="w-full h-full"
      initial="hidden"
      animate="visible"
      variants={chartContainer}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodOpacity="0.1"
                floodColor={currentTheme.foreground}
              />
            </filter>
          </defs>
          <Pie
            data={enrichedCategoryData}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? "40%" : "45%"}
            outerRadius={isMobile ? "70%" : "75%"}
            paddingAngle={4}
            dataKey="percentage"
            filter="url(#shadow)"
            isAnimationActive={true}
            {...extraProps}
          >
            {enrichedCategoryData.map(({ category }, index) => (
              <Cell
                key={`${category}`}
                fill={colors[index % colors.length]}
                style={{
                  filter: "brightness(1.1)",
                  transition: "filter 0.3s ease",
                  cursor: "pointer",
                }}
              />
            ))}
          </Pie>

          {showLegend && (
            <Legend
              iconType="circle"
              iconSize={isMobile ? 6 : 8}
              layout={isMobile ? "horizontal" : "vertical"}
              verticalAlign={isMobile ? "bottom" : "middle"}
              align={isMobile ? "center" : "right"}
              wrapperStyle={{
                fontSize: isMobile ? 10 : 12,
                padding: isMobile ? "0 4px" : "0 20px",
                ...(isMobile ? { bottom: -5 } : { right: 0 }),
                maxWidth: "40%",
              }}
              formatter={(_value, _entry, index) => {
                const category = enrichedCategoryData[index];
                const label = isMobile
                  ? truncateText(category.displayName, 10)
                  : category.displayName;
                return (
                  <span
                    className="text-xs whitespace-nowrap"
                    style={{
                      color: currentTheme.foreground,
                      transition: "color 0.3s ease",
                      fontWeight: "normal",
                    }}
                  >
                    {label} {category.percentage}%
                  </span>
                );
              }}
              payload={enrichedCategoryData.map(({ category }, index) => {
                return {
                  value: category,
                  id: category,
                  type: "circle",
                  color: colors[index % colors.length],
                };
              })}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

function adjustColor(
  hexColor: string,
  adjustments: { h?: number; s?: number; l?: number }
) {
  // Convert hex to RGB
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);

  if (adjustments.l) {
    const factor = adjustments.l > 0 ? 1.1 : 0.9;
    r = Math.min(255, Math.max(0, Math.round(r * factor)));
    g = Math.min(255, Math.max(0, Math.round(g * factor)));
    b = Math.min(255, Math.max(0, Math.round(b * factor)));
  }

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export default CategoryPieChart;
