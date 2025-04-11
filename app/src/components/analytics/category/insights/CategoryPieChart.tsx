import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  type PieProps,
} from "recharts";
import useMobile from "@/hooks/useMobile";
import { useReadingHistory, useReadingMetrics } from "@/context";
import { COLORS } from "@/components/analytics/utils";
import { BookText } from "lucide-react";
import { memo, useMemo } from "react";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { fromSnakeToTitleCase } from "@/utils/string";

interface CategoryPieChartProps {
  extraProps?: Omit<PieProps, "data" | "dataKey" | "ref">;
  showTooltip?: boolean;
  useThemeColors?: boolean;
  showLegend?: boolean;
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = memo(
  ({
    extraProps = {},
    showTooltip = true,
    useThemeColors = true,
    showLegend = true,
  }) => {
    const { isMobile } = useMobile();
    const { readingHistory } = useReadingHistory();
    const { analyticsData } = useReadingMetrics();
    const { categoryBreakdown } = analyticsData;
    const { currentTheme } = useTheme();

    const chartThemeColors = useMemo(() => {
      return [
        currentTheme.primary,
        `${currentTheme.primary}DD`,
        `${currentTheme.primary}BB`,
        `${currentTheme.primary}99`,
        `${currentTheme.primary}77`,
      ];
    }, [currentTheme]);

    const colors = useThemeColors ? chartThemeColors : COLORS;

    if (categoryBreakdown.length === 0) {
      return (
        <div className="h-full flex items-center justify-center flex-col">
          <BookText className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
          <p className="text-xs text-muted-foreground">No category data yet</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categoryBreakdown}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? 30 : 40}
            outerRadius={isMobile ? 60 : 70}
            paddingAngle={4}
            dataKey="value"
            {...extraProps}
          >
            {categoryBreakdown.map((category, index) => (
              <Cell
                key={`${category.name}-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          {showTooltip && (
            <RechartsTooltip
              formatter={(value: number, name: string) => [
                `${value} documents (${Math.round(
                  (value / readingHistory.length) * 100
                )}%)`,
                name,
              ]}
              contentStyle={{
                backgroundColor: "rgba(22, 22, 22, 0.9)",
                border: "1px solid #333",
                borderRadius: "4px",
              }}
            />
          )}
          {showLegend && (
            <Legend
              iconType="circle"
              iconSize={8}
              payload={categoryBreakdown.map((category, index) => {
                return {
                  value: fromSnakeToTitleCase(
                    category.name
                  ).toLocaleLowerCase(),
                  id: category.name,
                  type: "circle",
                  color: colors[index % colors.length],
                };
              })}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    );
  }
);

export default CategoryPieChart;
