import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { Clock, Sun, Moon, Coffee, Clipboard } from "lucide-react";
import { useReadingMetrics } from "@/context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * 📅 TimeOfDayPreference Component
 *
 * This component visualizes the user's reading activity throughout the day with a beautiful
 * and informative chart. It helps users understand when they typically read and identify
 * their peak reading hours for optimal productivity. 📈✨
 *
 * Key features:
 * - Smooth gradient area chart showing reading intensity by hour
 * - Time period indicators (morning, afternoon, evening, night)
 * - Peak reading time highlight with visual indicators
 * - Detailed tooltips with time context
 * - Responsive design for both mobile and desktop
 * - Empty state with helpful prompts
 */
const TimeOfDayPreference: React.FC = () => {
  const { analyticsData } = useReadingMetrics();

  // Calculate key metrics about reading times
  const timeMetrics = useMemo(() => {
    if (analyticsData.readingByHour.length === 0) return null;

    // Find peak reading hour
    const peak = analyticsData.readingByHour.reduce(
      (max, hour) => (hour.count > max.count ? hour : max),
      analyticsData.readingByHour[0]
    );

    // Format display hour (12-hour format)
    const displayHour =
      peak.hour === 0 ? 12 : peak.hour > 12 ? peak.hour - 12 : peak.hour;
    const period = peak.hour >= 12 ? "PM" : "AM";

    // Determine time of day category
    let timeCategory;
    if (peak.hour >= 5 && peak.hour < 12) {
      timeCategory = "morning";
    } else if (peak.hour >= 12 && peak.hour < 17) {
      timeCategory = "afternoon";
    } else if (peak.hour >= 17 && peak.hour < 21) {
      timeCategory = "evening";
    } else {
      timeCategory = "night";
    }

    // Calculate total readings and percentage at peak hour
    const totalReadings = analyticsData.readingByHour.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const peakPercentage =
      totalReadings > 0 ? Math.round((peak.count / totalReadings) * 100) : 0;

    // Group readings by period
    const periodTotals = {
      morning: 0, // 5am-11am
      afternoon: 0, // 12pm-4pm
      evening: 0, // 5pm-8pm
      night: 0, // 9pm-4am
    };

    analyticsData.readingByHour.forEach((hour) => {
      if (hour.hour >= 5 && hour.hour < 12) {
        periodTotals.morning += hour.count;
      } else if (hour.hour >= 12 && hour.hour < 17) {
        periodTotals.afternoon += hour.count;
      } else if (hour.hour >= 17 && hour.hour < 21) {
        periodTotals.evening += hour.count;
      } else {
        periodTotals.night += hour.count;
      }
    });

    // Find preferred period
    const preferredPeriod = Object.entries(periodTotals).reduce(
      (max, [period, count]) => (count > max.count ? { period, count } : max),
      { period: "none", count: 0 }
    );

    return {
      peak,
      displayHour,
      period,
      timeCategory,
      peakPercentage,
      totalReadings,
      periodTotals,
      preferredPeriod,
    };
  }, [analyticsData.readingByHour]);

  // Prepare enhanced data for the chart with period markers
  const enhancedData = useMemo(() => {
    return analyticsData.readingByHour.map((item) => {
      let period = "";
      if (item.hour === 6) period = "Morning";
      if (item.hour === 12) period = "Afternoon";
      if (item.hour === 18) period = "Evening";
      if (item.hour === 0) period = "Night";

      return {
        ...item,
        period,
        formattedHour:
          item.hour === 0
            ? "12am"
            : item.hour === 12
            ? "12pm"
            : item.hour < 12
            ? `${item.hour}am`
            : `${item.hour - 12}pm`,
      };
    });
  }, [analyticsData.readingByHour]);

  // Get time period icon
  const getTimeIcon = (category: string) => {
    switch (category) {
      case "morning":
        return <Coffee className="h-4 w-4 text-amber-400" />;
      case "afternoon":
        return <Sun className="h-4 w-4 text-orange-400" />;
      case "evening":
        return <Sun className="h-4 w-4 text-purple-400" />;
      case "night":
        return <Moon className="h-4 w-4 text-indigo-400" />;
      default:
        return <Clock className="h-4 w-4 text-primary" />;
    }
  };

  // Custom tooltip component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hour = data.hour;

      // Determine which part of the day this hour belongs to
      let timePeriod, periodColor, icon;
      if (hour >= 5 && hour < 12) {
        timePeriod = "Morning";
        periodColor = "text-amber-400";
        icon = <Coffee className="h-3.5 w-3.5 text-amber-400" />;
      } else if (hour >= 12 && hour < 17) {
        timePeriod = "Afternoon";
        periodColor = "text-orange-400";
        icon = <Sun className="h-3.5 w-3.5 text-orange-400" />;
      } else if (hour >= 17 && hour < 21) {
        timePeriod = "Evening";
        periodColor = "text-purple-400";
        icon = <Sun className="h-3.5 w-3.5 text-purple-400" />;
      } else {
        timePeriod = "Night";
        periodColor = "text-indigo-400";
        icon = <Moon className="h-3.5 w-3.5 text-indigo-400" />;
      }

      // Format time for display
      const formattedTime =
        hour === 0
          ? "12:00 AM"
          : hour === 12
          ? "12:00 PM"
          : hour < 12
          ? `${hour}:00 AM`
          : `${hour - 12}:00 PM`;

      // Calculate percentage of day's reading at this hour
      const totalReadings = timeMetrics?.totalReadings || 0;
      const percentage =
        totalReadings > 0 ? Math.round((data.count / totalReadings) * 100) : 0;

      return (
        <div className="bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-lg rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 border-b border-border/50 pb-1.5 mb-1.5">
            {icon}
            <p className="text-sm font-medium flex items-center">
              <span className={periodColor}>{timePeriod}</span>
              <span className="mx-1 opacity-60">·</span>
              <span>{formattedTime}</span>
            </p>
          </div>
          <div className="flex justify-between gap-4 text-xs items-center">
            <span className="text-muted-foreground">Documents read:</span>
            <span className="font-bold text-primary">{data.count}</span>
          </div>
          <div className="flex justify-between gap-4 text-xs mt-1 items-center">
            <span className="text-muted-foreground">Percent of total:</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          {timeMetrics?.peak.hour === hour && (
            <div className="mt-2 pt-1.5 border-t border-border/50 text-xs text-green-400 flex items-center">
              <Clipboard className="h-3 w-3 mr-1" />
              Peak reading hour
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // If there's no data, show an empty state
  if (!analyticsData.readingByHour.some((item) => item.count > 0)) {
    return (
      <motion.div
        className="h-full flex items-center justify-center flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Clock className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
        <p className="text-sm text-muted-foreground">No time data yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Read more documents to reveal your time preferences
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="h-full space-y-3">
        {/* Period indicators */}
        <div className="flex justify-between items-center h-6 px-2">
          {timeMetrics && (
            <div className="flex items-center gap-1.5">
              {getTimeIcon(timeMetrics.timeCategory)}
              <div className="text-xs">
                <span>Peak: </span>
                <span className="font-medium text-primary">
                  {timeMetrics.displayHour}:00 {timeMetrics.period}
                </span>
              </div>
            </div>
          )}

          {timeMetrics && (
            <div className="text-xs flex items-center gap-2">
              <div
                className={cn(
                  "px-1.5 py-0.5 rounded text-xs",
                  timeMetrics.preferredPeriod.period === "morning"
                    ? "bg-amber-500/10 text-amber-400"
                    : timeMetrics.preferredPeriod.period === "afternoon"
                    ? "bg-orange-500/10 text-orange-400"
                    : timeMetrics.preferredPeriod.period === "evening"
                    ? "bg-purple-500/10 text-purple-400"
                    : "bg-indigo-500/10 text-indigo-400"
                )}
              >
                {timeMetrics.preferredPeriod.period.charAt(0).toUpperCase() +
                  timeMetrics.preferredPeriod.period.slice(1)}{" "}
                reader
              </div>
            </div>
          )}
        </div>

        {/* The chart */}
        <div className="h-[calc(100%-1.5rem)]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={enhancedData}
              margin={{ top: 10, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                opacity={0.15}
                vertical={false}
              />

              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                tickFormatter={(hour) => {
                  if (hour % 4 === 0) {
                    if (hour === 0) return "12am";
                    if (hour === 12) return "12pm";
                    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
                  }
                  return "";
                }}
                axisLine={{ stroke: "var(--border)", opacity: 0.2 }}
                tickLine={false}
                padding={{ left: 10, right: 10 }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                width={25}
              />

              <RechartsTooltip content={renderTooltip} />

              {timeMetrics && (
                <ReferenceLine
                  x={timeMetrics.peak.hour}
                  stroke="var(--primary)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.7}
                />
              )}

              {/* Time period labels */}
              {enhancedData.map((item) => {
                if (item.period) {
                  return (
                    <ReferenceLine
                      key={item.hour}
                      x={item.hour}
                      stroke="var(--border)"
                      strokeOpacity={0.2}
                      label={{
                        value: item.period,
                        position: "insideTopLeft",
                        fill: "var(--muted-foreground)",
                        fontSize: 9,
                        offset: 10,
                      }}
                    />
                  );
                }
                return null;
              })}

              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#timeGradient)"
                animationDuration={1000}
                animationBegin={300}
                dot={{
                  r: 3,
                  strokeWidth: 1,
                  fill: "var(--background)",
                  stroke: "var(--primary)",
                }}
                activeDot={{
                  r: 5,
                  strokeWidth: 1,
                  fill: "var(--primary)",
                  stroke: "var(--background)",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default TimeOfDayPreference;
