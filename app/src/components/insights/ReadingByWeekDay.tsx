import React, { useMemo } from "react";
import { useTheme } from "@/hooks/ui/use-theme";
import { useActivityStore } from "@/stores/activityStore";
import {
  Bar,
  BarChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
  Label,
} from "recharts";
import { motion } from "framer-motion";
import {
  CalendarDays,
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowDown,
  Coffee,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateThemeColors } from "@/utils/colors";
import { generateWeeklyActivityInsights } from "@/services/activity/insights";
import ChartContainer from "@/components/chart/ChartContainer";
import { ChartContainer as ChartContainerUI } from "@/components/ui/chart";

/**
 * 🌞 ReadingByWeekDay Component
 *
 * This enhanced component visualizes reading patterns across different days of the week
 * with a beautiful, information-rich chart that helps users understand their reading habits.
 *
 * Key features:
 * - Visually distinctive bars with custom colors for weekdays vs weekends
 * - Highlighting of peak reading days and comparative metrics
 * - Context-rich tooltips that provide deeper insights
 * - Average reading reference line to show performance against typical habits
 * - Responsive design with optimized layouts for any screen size
 * - Smooth animations for engaging user experience
 * - Empty state handling with helpful prompts
 */
const ReadingByWeekDay: React.FC = () => {
  const { currentTheme } = useTheme();
  const weeklyActivity = useActivityStore((state) => state.totalWeeklyActivity);

  const chartData = useMemo(() => {
    const insights = generateWeeklyActivityInsights(weeklyActivity);

    return {
      ...insights,
      enhancedData: insights.dayData,
    };
  }, [weeklyActivity]);

  const colors = useMemo(() => {
    return generateThemeColors(currentTheme.primary, chartData.dayData.length);
  }, [currentTheme, chartData]);

  // Custom tooltip component with enhanced information
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const dayType = data.isWeekend ? "Weekend" : "Weekday";

      // Calculate percentage of week's reading
      const percentOfTotal =
        chartData.totalCount > 0
          ? Math.round((data.count / chartData.totalCount) * 100)
          : 0;

      return (
        <div className="bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-lg rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 border-b border-border/50 pb-1.5 mb-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <p className="text-sm font-medium flex items-center">
              <span>{data.day}</span>
              <span className="mx-1 opacity-60">·</span>
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  data.isWeekend
                    ? "bg-secondary/30 text-secondary-foreground"
                    : "bg-accent/30 text-accent-foreground"
                )}
              >
                {dayType}
              </span>
            </p>
          </div>

          <div className="flex justify-between gap-4 text-xs items-center">
            <span className="text-muted-foreground">Documents read:</span>
            <span className="font-bold text-primary">{data.count}</span>
          </div>

          <div className="flex justify-between gap-4 text-xs mt-1 items-center">
            <span className="text-muted-foreground">% of week's reading:</span>
            <span className="font-medium">{percentOfTotal}%</span>
          </div>

          {data.comparedToAvg !== 0 && (
            <div className="flex justify-between gap-4 text-xs mt-1 items-center">
              <span className="text-muted-foreground">
                Compared to average:
              </span>
              <span
                className={cn(
                  "font-medium flex items-center",
                  data.comparedToAvg > 0 ? "text-green-500" : "text-red-500"
                )}
              >
                {data.comparedToAvg > 0 ? (
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-0.5" />
                )}
                {Math.abs(data.comparedToAvg)}%
              </span>
            </div>
          )}

          {data.isPeak && (
            <div className="mt-2 pt-1.5 border-t border-border/50 text-xs text-green-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Your peak reading day
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (!chartData.totalCount) {
    return <EmptyState />;
  }

  const getRight = () => {
    if (chartData.preferredType === "weekend") {
      return {
        label: "Weekend reader",
        icon: Coffee,
        className: "bg-secondary/20 text-secondary-foreground",
      };
    }
    return {
      label: "Weekday reader",
      icon: Briefcase,
      className: "bg-accent/20 text-accent-foreground",
    };
  };

  const left = {
    icon: CalendarDays,
    label: "Peak: ",
    value: chartData.peakDay?.day ?? "None",
  };

  const right = {
    icon: getRight().icon,
    value: getRight().label,
    className: getRight().className,
  };

  return (
    <ChartContainer left={left} right={right}>
      <ChartContainerUI config={{}} className="h-full w-full">
        <BarChart
          data={chartData.enhancedData}
          margin={{ top: 15, right: 5, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={currentTheme.border || "#333"}
            opacity={0.15}
            vertical={false}
          />

          <XAxis
            dataKey="shortDay"
            tick={{
              fill: currentTheme.foreground + "80",
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
            padding={{ left: 10, right: 10 }}
          />

          <YAxis
            tick={{
              fill: currentTheme.foreground + "80",
              fontSize: 10,
            }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={25}
          />

          <RechartsTooltip
            content={<CustomTooltip />}
            cursor={{
              fill: currentTheme.primary + "10",
              radius: 4,
            }}
          />

          {/* Average reading reference line */}
          <ReferenceLine
            y={chartData.average}
            stroke={currentTheme.foreground}
            strokeDasharray="3 3"
            strokeOpacity={0.4}
          >
            <Label
              value="Average"
              position="insideTopRight"
              fill={currentTheme.foreground + "80"}
              fontSize={9}
              offset={5}
            />
          </ReferenceLine>

          <Bar
            dataKey="count"
            radius={5}
            animationDuration={1500}
            animationBegin={200}
          >
            {chartData.enhancedData.map((entry, index) => (
              <Cell
                key={`${entry.day}-${index}`}
                fill={colors[index]}
                fillOpacity={entry.isPeak ? 1 : 0.8}
                stroke={entry.isPeak ? currentTheme.background : undefined}
                strokeWidth={entry.isPeak ? 1 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainerUI>
    </ChartContainer>
  );
};

const EmptyState = () => {
  return (
    <motion.div
      className="h-full flex items-center justify-center flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CalendarDays className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
      <p className="text-sm text-muted-foreground">No weekly data yet</p>
      <p className="text-xs text-muted-foreground mt-1">
        Read more documents to reveal your weekly patterns
      </p>
    </motion.div>
  );
};

export default ReadingByWeekDay;
