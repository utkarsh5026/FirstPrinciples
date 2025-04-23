import { memo, useMemo } from "react";
import {
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import useMobile from "@/hooks/device/use-mobile";
import { useTheme } from "@/hooks/ui/use-theme";
import { generateThemeColors } from "@/utils/colors";
import {
  ChartContainer as ChartContainerUI,
  ChartTooltip,
} from "@/components/ui/chart";
import ChartContainer from "@/components/chart/ChartContainer";
import { BarChart2, BookOpen, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import useChartTooltip from "@/components/chart/tooltip/use-chart-tooltip";
import getIconForTech from "@/components/icons";

type CategoryBarData = {
  name: string;
  displayName: string;
  count: number;
  totalDocuments: number;
  percentage: number;
  path: string;
  fullName?: string;
};

interface CategoryHorizontalBarChartProps {
  data: CategoryBarData[];
  onSelectDocument: (path: string, name: string) => void;
  selectedSubcategory: string | null;
  title?: string;
  description?: string;
}

/**
 * 📊 CategoryHorizontalBarChart
 *
 * A beautiful visualization that displays category-based reading statistics as horizontal bars.
 * This component shows how frequently you read different categories, making it easy to spot
 * your favorites and discover new areas to explore.
 *
 * Features:
 * - Interactive bars that allow navigation directly to categories
 * - Responsive design for both mobile and desktop
 * - Beautiful animations and hover effects
 * - Consistent styling with other application visualizations
 */
const CategoryHorizontalBarChart: React.FC<CategoryHorizontalBarChartProps> =
  memo(({ data, onSelectDocument, selectedSubcategory }) => {
    const { isMobile } = useMobile();
    const { currentTheme } = useTheme();

    const colors = useMemo(
      () => generateThemeColors(currentTheme.primary, Math.max(data.length, 1)),
      [data.length, currentTheme.primary]
    );

    const topCategory = useMemo(() => {
      if (!data || data.length === 0) return null;
      return [...data].sort((a, b) => b.count - a.count)[0];
    }, [data]);

    const totalCompletion = useMemo(() => {
      if (!data || data.length === 0) return 0;
      const totalRead = data.reduce((acc, cat) => acc + cat.count, 0);
      const totalAvailable = data.reduce(
        (acc, cat) => acc + cat.totalDocuments,
        0
      );
      return totalAvailable > 0
        ? Math.round((totalRead / totalAvailable) * 100)
        : 0;
    }, [data]);

    // Custom tooltip using consistent design pattern
    const renderTooltip = useChartTooltip({
      getTitle: (data) => {
        const CategoryIcon = getIconForTech(data.name);
        return (
          <div className="flex items-center">
            <CategoryIcon className="w-4 h-4 mr-2" />
            <span>{data.fullName ?? data.displayName}</span>
          </div>
        );
      },
      getSections: (data) => [
        {
          label: "Documents read:",
          value: data.count,
          highlight: Boolean(topCategory && topCategory.name === data.name),
        },
        {
          label: "Total documents:",
          value: data.totalDocuments,
        },
        {
          label: "Completion:",
          value: `${Math.round((data.count / data.totalDocuments) * 100)}%`,
        },
      ],
      getFooter: (data) => {
        const isTopCategory = topCategory && topCategory.name === data.name;
        return isTopCategory
          ? {
              message: "Your most-read category",
              icon: TrendingUp,
              className: "text-green-400",
            }
          : undefined;
      },
      className: "bg-popover/95 backdrop-blur-sm",
    });

    // Empty state when no data is available
    if (!data || data.length === 0) {
      return (
        <motion.div
          className="h-full flex items-center justify-center flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <BarChart2 className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
          <p className="text-sm text-muted-foreground">No category data yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Read more documents to see category insights
          </p>
        </motion.div>
      );
    }

    return (
      <ChartContainer
        left={{
          icon: BookOpen,
          label: "Categories: ",
          value: data.length.toString(),
        }}
        right={{
          icon: BarChart2,
          value: `${totalCompletion}% Complete`,
        }}
      >
        <ChartContainerUI config={{}} className="w-full h-full">
          <RechartsBarChart
            data={data}
            layout="vertical"
            margin={{
              top: 10,
              right: isMobile ? 5 : 30,
              left: isMobile ? 10 : 20,
              bottom: 5,
            }}
            barSize={isMobile ? 16 : 22}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={currentTheme.border || "#333"}
              opacity={0.15}
              horizontal={true}
              vertical={false}
            />
            <XAxis
              type="number"
              tick={{
                fontSize: isMobile ? 10 : 11,
                fill: currentTheme.foreground + "80",
              }}
              tickMargin={5}
              axisLine={{ stroke: currentTheme.border, opacity: 0.8 }}
              tickLine={{ stroke: currentTheme.border, opacity: 0.8 }}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              width={isMobile ? 70 : 120}
              tick={{
                fontSize: isMobile ? 10 : 11,
                fill: currentTheme.foreground + "80",
              }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip
              content={renderTooltip}
              cursor={{
                fill: currentTheme.primary + "10",
                radius: 4,
              }}
            />
            <Bar
              dataKey="count"
              onClick={(data) => {
                if (
                  selectedSubcategory &&
                  data.path &&
                  typeof data.path === "string"
                ) {
                  onSelectDocument(data.path, data.fullName || data.name);
                }
              }}
              isAnimationActive={true}
              animationDuration={800}
              animationBegin={200}
              cursor={selectedSubcategory ? "pointer" : "default"}
              radius={[0, 4, 4, 0]}
              label={
                isMobile
                  ? false
                  : {
                      position: "right",
                      offset: 5,
                      fontSize: 11,
                      fill: currentTheme.foreground,
                      opacity: 0.7,
                      formatter: (value: number) => (value > 0 ? value : ""),
                    }
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}-${index}`}
                  fill={colors[index % colors.length]}
                  className="transition-all duration-300 hover:opacity-90 hover:brightness-110"
                  // Highlight the top category
                  opacity={
                    topCategory && topCategory.name === entry.name ? 1 : 0.8
                  }
                  stroke={
                    topCategory && topCategory.name === entry.name
                      ? currentTheme.background
                      : undefined
                  }
                  strokeWidth={
                    topCategory && topCategory.name === entry.name ? 1 : 0
                  }
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ChartContainerUI>
      </ChartContainer>
    );
  });

export default CategoryHorizontalBarChart;
