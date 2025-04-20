import React, { useState } from "react";
import {
  Radar,
  RadarChart as RechartRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import useMobile from "@/hooks/device/use-mobile";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { ChartArea } from "lucide-react";

type RadarData = {
  value: number;
  displayName: string;
  shortName: string;
  name: string;
  fullName: string;
  totalValue: number;
  percentage: number;
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
const CategoryRadarChart: React.FC<RadarChartProps> = ({
  title = "Reading Coverage",
  subtitle = "Category completion percentages",
  radarData,
}) => {
  const { isMobile } = useMobile();
  const { currentTheme } = useTheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!radarData || radarData.length === 0) {
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
    <div className="w-full h-full flex flex-col">
      {(title || subtitle) && (
        <div className="mb-2 text-center">
          {title && <h4 className="text-sm font-medium">{title}</h4>}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      <div className="flex-1 relative">
        {/* Absolute positioned items for custom overlay data */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
            <ChartArea className="h-3 w-3 inline-block mr-1 text-primary" />
            <span>{radarData.length} categories</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <RechartRadarChart
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? "70%" : "80%"}
            data={radarData}
          >
            <PolarGrid
              stroke={`${currentTheme.border}`}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />

            <PolarAngleAxis
              dataKey="name"
              tick={{
                fill: currentTheme.foreground,
                fontSize: isMobile ? 10 : 12,
                fontWeight: 500,
              }}
              stroke={currentTheme.border}
              tickLine={false}
            />

            {/* Percentage scale (0-100%) */}
            <PolarRadiusAxis
              angle={45}
              domain={[0, 100]}
              tick={{
                fill: currentTheme.secondary,
                fontSize: isMobile ? 9 : 10,
              }}
              tickCount={isMobile ? 3 : 5}
              stroke={currentTheme.border}
              axisLine={false}
              tickFormatter={(value) => (value === 0 ? "" : `${value}%`)}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const data = payload[0].payload as RadarData & {
                    displayName: string;
                  };
                  return (
                    <div className="bg-popover/95 border border-border rounded-md p-2 shadow-md">
                      <p className="text-xs font-medium mb-1">
                        {data.displayName}
                      </p>
                      <div className="flex justify-between gap-4">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-primary">
                            {data.value.toFixed(0)}%
                          </span>{" "}
                          complete
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {data.value} / {data.totalValue}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Radar
              name="Category Coverage"
              dataKey="value"
              stroke={currentTheme.primary}
              strokeWidth={2}
              fill={currentTheme.primary}
              animationDuration={1000}
              animationBegin={300}
              isAnimationActive={true}
              onMouseOut={() => setActiveIndex(null)}
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
              activeDot={{
                r: 6,
                fill: currentTheme.background,
                stroke: currentTheme.primary,
                strokeWidth: 2,
                filter: "url(#glow)",
                cursor: "pointer",
              }}
            />
          </RechartRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryRadarChart;
