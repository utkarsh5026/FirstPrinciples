import { memo, useState, useMemo } from "react";
import {
  Radar,
  RadarChart as RechartRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { motion } from "framer-motion";
import useMobile from "@/hooks/device/use-mobile";
import { useTheme } from "@/hooks/ui/use-theme";
import { ChartArea, Activity, TrendingUp } from "lucide-react";
import ChartContainer from "@/components/shared/chart/ChartContainer";
import {
  ChartContainer as ChartContainerBase,
  ChartTooltip,
} from "@/components/ui/chart";
import getIconForTech from "@/components/shared/icons";
import { fromSnakeToTitleCase } from "@/utils/string";
import useChartTooltip from "@/components/shared/chart/tooltip/use-chart-tooltip";

type RadarData = {
  value: number;
  displayName: string;
  shortName: string;
  name: string;
  fullName: string;
  totalValue: number;
  percentage: number;
  category?: string;
};

interface RadarChartProps {
  title?: string;
  subtitle?: string;
  radarData: RadarData[];
  compact?: boolean;
}

/**
 * 📊 CategoryRadarChart
 *
 * A beautiful radar visualization that displays category completion metrics in a radial format.
 * This chart helps visualize your reading coverage across different categories and quickly
 * identify areas where you've made the most progress.
 *
 * Features:
 * - Interactive radar with hover effects and tooltips
 * - Responsive design for both mobile and desktop
 * - Visual highlighting of top completion categories
 * - Consistent styling with other application visualizations
 * - Glowing effects for active data points
 */
const CategoryRadarChart: React.FC<RadarChartProps> = memo(({ radarData }) => {
  const { isMobile } = useMobile();
  const { currentTheme } = useTheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Process radar data to add category property if needed
  const processedData = useMemo(() => {
    if (!radarData || radarData.length === 0) return [];

    return radarData.map((item) => ({
      ...item,
      // If category is missing, use name as fallback for icon lookup
      category: item.category || item.name.toLowerCase().replace(/\s+/g, "_"),
    }));
  }, [radarData]);

  // Calculate metrics for insights and header
  const metrics = useMemo(() => {
    if (!processedData || processedData.length === 0) return null;

    // Find the highest completion item
    const topItem = [...processedData].sort((a, b) => b.value - a.value)[0];

    // Find the lowest completion item with some value
    const activeItems = processedData.filter((item) => item.value > 0);
    const lowestItem =
      activeItems.length > 0
        ? [...activeItems].sort((a, b) => a.value - b.value)[0]
        : null;

    // Calculate average completion
    const avgCompletion = Math.round(
      processedData.reduce((sum, item) => sum + item.value, 0) /
        processedData.length
    );

    // Calculate coverage statistics
    const categoriesWithSomeProgress = processedData.filter(
      (item) => item.value > 0
    ).length;
    const coveragePercentage = Math.round(
      (categoriesWithSomeProgress / processedData.length) * 100
    );

    // Determine reading pattern
    let pattern = "Balanced";
    if (topItem.value > 75 && avgCompletion < 40) {
      pattern = "Focused";
    } else if (coveragePercentage > 80 && avgCompletion > 30) {
      pattern = "Explorer";
    } else if (categoriesWithSomeProgress < processedData.length * 0.4) {
      pattern = "Selective";
    }

    return {
      topItem,
      lowestItem,
      avgCompletion,
      categoriesCount: processedData.length,
      coveragePercentage,
      categoriesWithSomeProgress,
      pattern,
    };
  }, [processedData]);

  // Custom tooltip using consistent design pattern
  const renderTooltip = useChartTooltip({
    getTitle: (data) => {
      const CategoryIcon = getIconForTech(data.category);
      return (
        <div className="flex items-center">
          <CategoryIcon className="w-4 h-4 mr-2" />
          <span>{data.displayName ?? fromSnakeToTitleCase(data.name)}</span>
        </div>
      );
    },
    getSections: (data) => [
      {
        label: "Completion:",
        value: `${Math.round(data.value)}%`,
        highlight: metrics?.topItem && metrics.topItem.name === data.name,
      },
      {
        label: "Documents:",
        value: `${Math.round((data.value * data.totalValue) / 100)} / ${
          data.totalValue
        }`,
      },
      {
        label: "Of total reading:",
        value: `${Math.round(data.percentage || 0)}%`,
      },
    ],
    getFooter: (data) => {
      if (metrics?.topItem && metrics.topItem.name === data.name) {
        return {
          message: "Your most completed category",
          icon: TrendingUp,
          className: "text-green-400",
        };
      }
      return undefined;
    },
    className: "bg-popover/95 backdrop-blur-sm",
  });

  // Empty state when no data is available
  if (!processedData || processedData.length === 0) {
    return (
      <motion.div
        className="h-full flex items-center justify-center flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ChartArea className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
        <p className="text-sm text-muted-foreground">No radar data available</p>
        <p className="text-xs text-muted-foreground mt-1">
          Explore more categories to see insights
        </p>
      </motion.div>
    );
  }

  return (
    <ChartContainer
      left={
        metrics
          ? {
              icon: Activity,
              label: "Avg: ",
              value: `${metrics.avgCompletion}%`,
            }
          : undefined
      }
      right={
        metrics
          ? {
              icon: TrendingUp,
              value: `${metrics.pattern} Reader`,
            }
          : undefined
      }
    >
      <ChartContainerBase config={{}} className="h-full w-full">
        <RechartRadarChart
          cx="50%"
          cy="50%"
          outerRadius={isMobile ? "70%" : "80%"}
          data={processedData}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          {/* Create a subtle grid with less visual noise */}
          <PolarGrid
            stroke={`${currentTheme.border}`}
            strokeDasharray="3 3"
            strokeOpacity={0.4}
            radialLines
          />

          {/* Category labels around the radar */}
          <PolarAngleAxis
            dataKey={(data) => data.displayName || data.name}
            tick={{
              fill: currentTheme.foreground + "cc",
              fontSize: isMobile ? 9 : 11,
              fontWeight: 500,
            }}
            stroke={currentTheme.border}
            strokeOpacity={0.4}
            tickLine={false}
            // Formatter to truncate long names on mobile
            tickFormatter={(value) =>
              isMobile && value.length > 8
                ? `${value.substring(0, 6)}...`
                : value
            }
          />

          {/* Percentage scale (0-100%) */}
          <PolarRadiusAxis
            angle={45}
            domain={[0, 100]}
            tick={{
              fontSize: isMobile ? 8 : 10,
              fill: currentTheme.foreground + "99",
            }}
            tickCount={isMobile ? 3 : 5}
            stroke={currentTheme.border}
            strokeOpacity={0.4}
            axisLine={false}
            tickFormatter={(value) => (value === 0 ? "" : `${value}%`)}
          />

          {/* Use the ChartTooltip component for consistency */}
          <ChartTooltip content={renderTooltip} />

          {/* The radar itself */}
          <Radar
            name="Category Coverage"
            dataKey="value"
            stroke={currentTheme.primary}
            strokeWidth={2}
            fill={currentTheme.primary}
            fillOpacity={0.5}
            animationDuration={1000}
            animationBegin={300}
            isAnimationActive={true}
            onMouseLeave={() => setActiveIndex(null)}
            // Enhanced dot styling with active states
            dot={(props) => {
              const index = props.index as number;
              const dataPoint = processedData[index];
              const isTopCategory =
                metrics?.topItem && metrics.topItem.name === dataPoint.name;
              const isActive = activeIndex === index;
              const opacity = isActive ? 1 : 0.7;

              return (
                <circle
                  {...props}
                  r={isActive ? 5 : isTopCategory ? 4 : 3}
                  fill={
                    isActive || isTopCategory
                      ? currentTheme.background
                      : currentTheme.primary
                  }
                  stroke={currentTheme.primary}
                  strokeWidth={isTopCategory ? 2.5 : 2}
                  opacity={opacity}
                  filter={isActive || isTopCategory ? "url(#glow)" : undefined}
                  className="transition-all duration-300"
                />
              );
            }}
            // Active dot styling
            activeDot={{
              r: 6,
              fill: currentTheme.background,
              stroke: currentTheme.primary,
              strokeWidth: 2.5,
              filter: "url(#glow)",
              cursor: "pointer",
            }}
          />

          {/* SVG filter for the glowing effect on active dots */}
          <defs>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feFlood
                floodColor={currentTheme.primary}
                floodOpacity="0.3"
                result="color"
              />
              <feComposite
                in="color"
                in2="blur"
                operator="in"
                result="shadow"
              />
              <feComposite in="SourceGraphic" in2="shadow" operator="over" />
            </filter>
          </defs>
        </RechartRadarChart>
      </ChartContainerBase>
    </ChartContainer>
  );
});

export default CategoryRadarChart;
