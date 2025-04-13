/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  Label,
} from "recharts";
import { useReadingMetrics } from "@/context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ContentType } from "recharts/types/component/Tooltip";

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
const ProgressOverTime: React.FC = () => {
  const { monthlyData } = useReadingMetrics();

  // Calculate average reading count and other statistics
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

  // Custom tooltip component with enhanced styling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTooltip = ({
    active,
    payload,
    label,
  }: {
    active: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any;
    label: string;
  }) => {
    if (active && payload?.length) {
      const count = payload[0].value;
      const isAboveAverage = count > stats.average;

      return (
        <div className="bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-lg rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 border-b border-border/50 pb-1.5 mb-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <p className="text-sm font-medium">{label}</p>
          </div>
          <div className="flex justify-between gap-4 text-xs items-center">
            <span className="text-muted-foreground">Documents read:</span>
            <span
              className={cn(
                "font-bold",
                isAboveAverage ? "text-green-500" : "text-primary"
              )}
            >
              {count}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-xs mt-1 items-center">
            <span className="text-muted-foreground">Average:</span>
            <span className="font-medium">{stats.average.toFixed(1)}</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-border/50 text-xs text-muted-foreground">
            {isAboveAverage
              ? `${Math.round(
                  (count / stats.average - 1) * 100
                )}% above average`
              : `${Math.round(
                  (1 - count / stats.average) * 100
                )}% below average`}
          </div>
        </div>
      );
    }
    return null;
  };

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
    <motion.div
      className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats row above chart */}
      <div className="flex justify-between mb-1 px-2">
        <div className="text-xs flex items-center">
          <TrendingUp
            className={cn(
              "h-3 w-3 mr-1",
              stats.trend === "up"
                ? "text-green-500"
                : stats.trend === "down"
                ? "text-red-500"
                : "text-yellow-500"
            )}
          />
          <span className="text-muted-foreground">Trend:</span>
          <span
            className={cn(
              "ml-1 font-medium",
              stats.trend === "up"
                ? "text-green-500"
                : stats.trend === "down"
                ? "text-red-500"
                : "text-yellow-500"
            )}
          >
            {stats.trend === "up"
              ? "Improving"
              : stats.trend === "down"
              ? "Declining"
              : "Stable"}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{stats.total}</span>{" "}
          total readings
        </div>
      </div>

      <ResponsiveContainer width="100%" height="94%">
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
            dataKey="name"
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

          <Tooltip content={renderTooltip as ContentType<any, any>} />

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

          <Legend
            verticalAlign="top"
            height={30}
            content={() => (
              <div className="text-xs text-center text-muted-foreground mt-1">
                Monthly Reading Progress
              </div>
            )}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ProgressOverTime;
