import React, { useState } from "react";
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
import { ChartArea, PieChart, TrendingUp } from "lucide-react";
import ChartContainer from "@/components/chart/ChartContainer";
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer as ChartContainerBase,
} from "@/components/ui/chart";
import getIconForTech from "../icons";
import { fromSnakeToTitleCase } from "@/utils/string";

type RadarData = {
  value: number;
  displayName: string;
  shortName: string;
  name: string;
  fullName: string;
  totalValue: number;
  percentage: number;
  category?: string; // Added for compatibility with getIconForTech
};

interface RadarChartProps {
  title?: string;
  subtitle?: string;
  radarData: RadarData[];
}

/**
 * Enhanced RadarChart component for visualizing category completion
 * with improved aesthetics, animations, and mobile optimization.
 */
const CategoryRadarChart: React.FC<RadarChartProps> = ({ radarData }) => {
  const { isMobile } = useMobile();
  const { currentTheme } = useTheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Process radar data to add category property if needed
  const processedData = React.useMemo(() => {
    if (!radarData || radarData.length === 0) return [];

    return radarData.map((item) => ({
      ...item,
      // If category is missing, use name as fallback for icon lookup
      category: item.category || item.name.toLowerCase().replace(/\s+/g, "_"),
    }));
  }, [radarData]);

  // Calculate metrics for the chart header
  const metrics = React.useMemo(() => {
    if (!processedData || processedData.length === 0) return null;

    // Find the highest completion item
    const topItem = [...processedData].sort((a, b) => b.value - a.value)[0];

    // Calculate average completion
    const avgCompletion = Math.round(
      processedData.reduce((sum, item) => sum + item.value, 0) /
        processedData.length
    );

    return {
      topItem,
      avgCompletion,
      categoriesCount: processedData.length,
    };
  }, [processedData]);

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
              icon: PieChart,
              label: "Top: ",
              value: metrics.topItem.displayName || metrics.topItem.name,
            }
          : undefined
      }
      right={
        metrics
          ? {
              icon: TrendingUp,
              value: `${metrics.avgCompletion}% avg`,
              className: "bg-primary/20 text-primary",
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
        >
          {/* Create a subtle grid with less visual noise */}
          <PolarGrid
            stroke={`${currentTheme.border}`}
            strokeDasharray="3 3"
            strokeOpacity={0.5}
            radialLines
          />

          {/* Category labels around the radar */}
          <PolarAngleAxis
            dataKey="name"
            tick={{
              fill: currentTheme.foreground,
              fontSize: isMobile ? 10 : 12,
              fontWeight: 500,
            }}
            stroke={currentTheme.border}
            tickLine={false}
            // Formatter to truncate long names on mobile
            tickFormatter={(value) =>
              isMobile && value.length > 10
                ? `${value.substring(0, 8)}...`
                : value
            }
          />

          {/* Percentage scale (0-100%) */}
          <PolarRadiusAxis
            angle={45}
            domain={[0, 100]}
            tick={{
              fill: currentTheme.muted,
              fontSize: isMobile ? 9 : 10,
            }}
            tickCount={isMobile ? 3 : 5}
            stroke={currentTheme.border}
            axisLine={false}
            tickFormatter={(value) => (value === 0 ? "" : `${value}%`)}
          />

          {/* Use the ChartTooltip component for consistency */}
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(_value, _name, props) => {
                  const payload = props?.payload;
                  if (!payload) return null;

                  // Get the appropriate icon
                  const CategoryIcon = getIconForTech(payload.category);

                  // Custom content similar to CategoryPieChart
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-medium gap-2 pb-1.5 border-b border-border/50">
                        <CategoryIcon className="w-4 h-4 text-primary" />
                        {payload.displayName ||
                          fromSnakeToTitleCase(payload.name)}
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <span className="text-muted-foreground">
                          Completion:
                        </span>
                        <span className="font-bold text-primary text-right">
                          {payload.value.toFixed(0)}%
                        </span>

                        <span className="text-muted-foreground">
                          Documents:
                        </span>
                        <span className="text-right">
                          {payload.value} / {payload.totalValue}
                        </span>

                        {payload.percentage && (
                          <>
                            <span className="text-muted-foreground">
                              Of total reading:
                            </span>
                            <span className="text-right">
                              {payload.percentage.toFixed(0)}%
                            </span>
                          </>
                        )}
                      </div>

                      {metrics?.topItem.name === payload.name && (
                        <div className="mt-1 pt-1.5 border-t border-border/50 text-xs text-green-400 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Your most completed category
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            }
          />

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
            onMouseOver={(_, index) => setActiveIndex(index)}
            onMouseOut={() => setActiveIndex(null)}
            // Enhanced dot styling with active states
            dot={(props) => {
              const isActive = activeIndex === props.index;
              const opacity = isActive ? 1 : 0.7;
              return (
                <circle
                  {...props}
                  r={isActive ? 5 : 3}
                  fill={
                    isActive ? currentTheme.background : currentTheme.primary
                  }
                  stroke={currentTheme.primary}
                  strokeWidth={2}
                  opacity={opacity}
                  filter={isActive ? "url(#glow)" : undefined}
                />
              );
            }}
            // Active dot styling
            activeDot={{
              r: 6,
              fill: currentTheme.background,
              stroke: currentTheme.primary,
              strokeWidth: 2,
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
};

export default CategoryRadarChart;
