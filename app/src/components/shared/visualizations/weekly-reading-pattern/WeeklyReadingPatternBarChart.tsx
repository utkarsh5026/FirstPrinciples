import React, { useMemo } from "react";
import { useTheme } from "@/hooks/ui/use-theme";
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
import ChartContainer from "@/components/shared/chart/chart-container";
import { ChartContainer as ChartContainerUI } from "@/components/ui/chart";
import type { WeeklyActivity } from "@/services/analytics/activity-analyzer";
import { useWeekilyActivityMetrcis } from "@/hooks";
import useChartTooltip from "@/components/shared/chart/tooltip/use-chart-tooltip";

interface WeeklyReadingPatternBarChartProps {
  weeklyActivity: WeeklyActivity[];
}

const ReadingByWeekDay: React.FC<WeeklyReadingPatternBarChartProps> = ({
  weeklyActivity,
}) => {
  const { currentTheme } = useTheme();
  const { generateWeeklyActivityInsights } = useWeekilyActivityMetrcis();

  const chartData = useMemo(() => {
    const insights = generateWeeklyActivityInsights(weeklyActivity);

    return {
      ...insights,
      enhancedData: insights.dayData,
    };
  }, [weeklyActivity, generateWeeklyActivityInsights]);

  const colors = useMemo(() => {
    return generateThemeColors(currentTheme.primary, chartData.dayData.length);
  }, [currentTheme, chartData]);

  const renderTooltip = useChartTooltip({
    icon: Calendar,
    getTitle: (data) => {
      return (
        <div className="flex items-center">
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
            {data.isWeekend ? "Weekend" : "Weekday"}
          </span>
        </div>
      );
    },
    getSections: (data) => {
      const percentOfTotal =
        chartData.totalCount > 0
          ? Math.round((data.count / chartData.totalCount) * 100)
          : 0;

      const sections = [
        { label: "Documents read:", value: data.count, highlight: true },
        { label: "% of week's reading:", value: `${percentOfTotal}%` },
      ];

      // Only add comparison if there is a difference
      if (data.comparedToAvg !== 0) {
        sections.push({
          label: "Compared to average:",
          value: (
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
          ),
          highlight: false,
        });
      }

      return sections;
    },
    getFooter: (data) =>
      data.isPeak
        ? {
            message: "Your peak reading day",
            icon: TrendingUp,
            className: "text-green-400",
          }
        : undefined,
  });

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
            content={renderTooltip}
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
