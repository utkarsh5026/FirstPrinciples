import React, { useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  Label,
} from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { MonthlyDocumentCounts } from "@/services/analytics/heatmap-generator";
import { getMonthName } from "@/utils/time";
import {
  ChartContainer as ChartContainerUI,
  ChartTooltip,
  ChartLegend,
} from "@/components/ui/chart";
import ChartContainer from "@/components/chart/ChartContainer";
import useChartTooltip from "@/components/chart/tooltip/use-chart-tooltip";

interface ProgressOverTimeProps {
  monthlyData: MonthlyDocumentCounts["months"];
}

/**
 * 🚀 ProgressOverTime Component
 *
 * This component visualizes the user's progress over time, providing a beautiful graphical representation
 * of their monthly reading activity. It aims to help users track their progress, identify patterns,
 * and stay motivated to read more. 📚💡
 *
 * The enhanced version includes:
 * - Gradient fill with customizable opacity
 * - Reference lines for average reading activity
 * - Custom tooltips with detailed information
 * - Animation effects for engaging visualization
 * - Responsive design for both mobile and desktop
 * - Better axis formatting and visual indicators
 */
const ReadingProgressAreaChart: React.FC<ProgressOverTimeProps> = ({
  monthlyData,
}) => {
  const stats = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) {
      return { average: 0, highest: 0, trend: "neutral", total: 0 };
    }

    const total = monthlyData.reduce((sum, item) => sum + item.count, 0);
    const average = total / monthlyData.length;
    const highest = Math.max(...monthlyData.map((item) => item.count));

    // Calculate trend by comparing last two months
    let trend = "neutral";
    if (monthlyData.length >= 2) {
      const lastMonth = monthlyData[monthlyData.length - 1].count;
      const previousMonth = monthlyData[monthlyData.length - 2].count;

      if (lastMonth > previousMonth * 1.1) {
        trend = "up";
      } else if (lastMonth < previousMonth * 0.9) {
        trend = "down";
      }
    }

    return { average, highest, trend, total };
  }, [monthlyData]);

  const getTrendText = (trend: string): string => {
    if (trend === "up") return "Improving";
    if (trend === "down") return "Declining";
    return "Stable";
  };

  const getTrendColorClass = (trend: string): string => {
    if (trend === "up") return "text-green-500";
    if (trend === "down") return "text-red-500";
    return "text-yellow-500";
  };

  // Replace the custom tooltip with useChartTooltip
  const renderTooltip = useChartTooltip({
    icon: Calendar,
    getTitle: (data) => {
      const isPeak = data.count === stats.highest;
      return (
        <div className="flex items-center">
          <span>{getMonthName(data.month)}</span>
          {isPeak && (
            <>
              <span className="mx-1 opacity-60">·</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-secondary/30 text-secondary-foreground">
                Peak Month
              </span>
            </>
          )}
        </div>
      );
    },
    getSections: (data) => {
      const count = data.count;
      const isAboveAverage = count > stats.average;
      const percentDiff = Math.round(
        Math.abs((count / stats.average - 1) * 100)
      );

      return [
        {
          label: "Documents read:",
          value: count,
          highlight: true,
        },
        {
          label: "% of total:",
          value: `${Math.round((count / stats.total) * 100)}%`,
        },
        {
          label: "Compared to average:",
          value: (
            <span
              className={cn(
                "font-medium flex items-center",
                isAboveAverage ? "text-green-500" : "text-red-500"
              )}
            >
              {isAboveAverage ? (
                <ArrowUp className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-0.5" />
              )}
              {percentDiff}%
            </span>
          ),
        },
      ];
    },
    getFooter: (data) =>
      data.count === stats.highest
        ? {
            message: "Your peak reading month",
            icon: TrendingUp,
            className: "text-green-400",
          }
        : undefined,
    className: "bg-popover/95 backdrop-blur-sm",
  });

  if (monthlyData.length === 0) {
    return (
      <motion.div
        className="h-full flex items-center justify-center flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <BarChart3 className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
        <p className="text-muted-foreground text-sm">No monthly data yet</p>
        <p className="text-muted-foreground text-xs mt-1">
          Read more documents to track your progress
        </p>
      </motion.div>
    );
  }

  const chartAppearance = {
    gradientStart: "var(--primary)",
    gradientEnd: "var(--primary)",
    startOpacity: 0.8,
    endOpacity: 0.1,
    strokeColor: "var(--primary)",
    strokeWidth: 2,
    referenceColor: "var(--muted-foreground)",
    gridColor: "var(--border)",
    animationDuration: 1000,
  };

  return (
    <ChartContainer
      className="h-full w-full"
      left={{
        icon: TrendingUp,
        label: "Trend: ",
        value: getTrendText(stats.trend),
        className: cn(getTrendColorClass(stats.trend)),
      }}
      right={{
        value: `${stats.total} total readings`,
        className: "",
      }}
    >
      <ChartContainerUI config={{}}>
        <AreaChart
          data={monthlyData}
          margin={{ top: 20, right: 5, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={chartAppearance.gradientStart}
                stopOpacity={chartAppearance.startOpacity}
              />
              <stop
                offset="95%"
                stopColor={chartAppearance.gradientEnd}
                stopOpacity={chartAppearance.endOpacity}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartAppearance.gridColor}
            opacity={0.15}
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tickFormatter={(value) => getMonthName(value).slice(0, 3)}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: chartAppearance.gridColor, opacity: 0.2 }}
            tickLine={false}
            padding={{ left: 10, right: 10 }}
          />

          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            width={25}
            domain={[0, "auto"]}
          />

          <ChartTooltip content={renderTooltip} />

          <ReferenceLine
            y={stats.average}
            stroke={chartAppearance.referenceColor}
            strokeDasharray="3 3"
            strokeOpacity={0.6}
          >
            <Label
              value="Average"
              position="insideTopRight"
              fill="var(--muted-foreground)"
              fontSize={9}
              offset={5}
            />
          </ReferenceLine>

          <Area
            type="monotone"
            dataKey="count"
            stroke={chartAppearance.strokeColor}
            strokeWidth={chartAppearance.strokeWidth}
            fillOpacity={1}
            fill="url(#colorReading)"
            animationDuration={chartAppearance.animationDuration}
            animationBegin={200}
            activeDot={{
              r: 6,
              stroke: "var(--background)",
              strokeWidth: 2,
              fill: chartAppearance.strokeColor,
            }}
            dot={{
              r: 3,
              stroke: "var(--background)",
              strokeWidth: 1,
              fill: chartAppearance.strokeColor,
            }}
          />

          <ChartLegend
            verticalAlign="top"
            height={30}
            content={() => (
              <div className="text-xs text-center text-muted-foreground mt-1">
                Monthly Reading Progress
              </div>
            )}
          />
        </AreaChart>
      </ChartContainerUI>
    </ChartContainer>
  );
};

export default ReadingProgressAreaChart;
