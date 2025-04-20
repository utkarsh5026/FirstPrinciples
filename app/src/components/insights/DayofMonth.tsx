import { memo, useEffect, useState } from "react";
import { Calendar, ArrowUp, ArrowDown } from "lucide-react";
import InsightCard from "../analytics/components/insights/InsightCard";
import { useActivityStore } from "@/stores";
import type { ReadingHistoryItem } from "@/services/history";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";

import { motion } from "framer-motion";
import { useTheme } from "@/hooks/ui/use-theme";
import { cn } from "@/lib/utils";
import useMobile from "@/hooks/device/use-mobile";
import { generateThemeColors } from "@/utils/colors";
import type { DailyActivity } from "@/services/analytics/activity-analyzer";
import { useActivityMetrics } from "@/hooks/analytics/use-activity-metrics";

interface DayOfMonthActivityInsightProps {
  history: ReadingHistoryItem[];
}

type DayOfMonthActivityInsights = {
  data: {
    isPeak: boolean;
    isSpecialDay: boolean;
    barColor: string;
    comparedToAvg: number;
    day: number;
    count: number;
  }[];
  mostActiveDay: DailyActivity;
  leastActiveDay: DailyActivity;
  average: number;
  monthlyPattern: string;
  maxValue: number;
};

/**
 * 📅 DayOfMonthActivityInsight
 *
 * A beautiful visualization showing which days of the month
 * you prefer for reading! Are you an early-month reader,
 * mid-month enthusiast, or end-of-month crammer?
 *
 * This component analyzes your reading patterns across monthly cycles
 * and highlights your most active days.
 */
const DayOfMonthActivityInsight: React.FC<DayOfMonthActivityInsightProps> =
  memo(({ history }) => {
    const { isMobile } = useMobile();
    const { currentTheme } = useTheme();

    const { calculateTotalDailyActivity, getDailyActivityMetrics } =
      useActivityMetrics();

    const [insights, setInsights] = useState<DayOfMonthActivityInsights>({
      data: [],
      mostActiveDay: { day: 0, count: 0 },
      leastActiveDay: { day: 0, count: 0 },
      average: 0,
      monthlyPattern: "",
      maxValue: 0,
    });
    /**
     * 🎯 This analyzes your monthly reading patterns!
     * Discovers which days of the month you're most likely to read,
     * and identifies patterns in your monthly reading cycle.
     */
    useEffect(() => {
      const createInsights = async () => {
        const dailyData = await calculateTotalDailyActivity(history);

        const colors = generateThemeColors(
          currentTheme.primary,
          dailyData.length
        );

        const { mostActiveDay, leastActiveDay } = await getDailyActivityMetrics(
          dailyData
        );

        const validData = dailyData.filter(
          (day) => day.day > 0 && day.day <= 31
        );

        const monthlyPattern = figureOutMonthlyPattern(validData);
        const { average, maxValue } = calculateDailyMetrics(validData);

        const enhancedData = validData.map((day, index) => {
          const isMonthStart = day.day === 1;
          const isMonthEnd = day.day === 31;
          const isQuarterMonth =
            day.day === 7 || day.day === 15 || day.day === 23;
          const isPeak = day.day === mostActiveDay.day;

          return {
            ...day,
            isPeak,
            isSpecialDay: isMonthStart || isMonthEnd || isQuarterMonth,
            barColor: colors[index],
            comparedToAvg:
              average > 0 ? Math.round((day.count / average - 1) * 100) : 0,
          };
        });

        setInsights({
          data: enhancedData,
          mostActiveDay,
          leastActiveDay,
          average,
          monthlyPattern,
          maxValue,
        });
      };
      createInsights();
    }, [
      history,
      calculateTotalDailyActivity,
      getDailyActivityMetrics,
      currentTheme,
    ]);

    // Get gradient and icon color based on monthly pattern
    const getPatternStyles = (pattern: string) => {
      switch (pattern) {
        case "early-month":
          return {
            gradient: "from-blue-500/5 to-blue-500/10",
            iconColor: "text-blue-500",
          };
        case "mid-month":
          return {
            gradient: "from-purple-500/5 to-purple-500/10",
            iconColor: "text-purple-500",
          };
        case "late-month":
          return {
            gradient: "from-amber-500/5 to-amber-500/10",
            iconColor: "text-amber-500",
          };
        default:
          return {
            gradient: "from-slate-500/5 to-slate-500/10",
            iconColor: "text-slate-500",
          };
      }
    };

    const { gradient, iconColor } = getPatternStyles(insights.monthlyPattern);

    // Get pattern display name
    const getPatternDisplayName = (pattern: string) => {
      switch (pattern) {
        case "early-month":
          return "Early-month focus";
        case "mid-month":
          return "Mid-month focus";
        case "late-month":
          return "Late-month focus";
        default:
          return "Balanced";
      }
    };

    // Insights for the card
    const cardInsights = insights.mostActiveDay
      ? [
          {
            label: "Peak day",
            value: insights.mostActiveDay.day.toString(),
            highlight: true,
          },
          {
            label: "Pattern",
            value: getPatternDisplayName(insights.monthlyPattern),
          },
          {
            label: "Least active",
            value: insights.leastActiveDay.day.toString(),
          },
          {
            label: "Daily average",
            value: insights.average.toFixed(1),
          },
        ]
      : [];

    // Custom tooltip component
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;

        return (
          <div className="bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-lg rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 border-b border-border/50 pb-1.5 mb-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <p className="text-sm font-medium flex items-center">
                <span>Day {data.day}</span>
                {data.isPeak && (
                  <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    Peak
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-between gap-4 text-xs items-center">
              <span className="text-muted-foreground">Documents read:</span>
              <span className="font-bold text-primary">{data.count}</span>
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
          </div>
        );
      }
      return null;
    };

    // If there's no data, show empty state
    if (!insights.data.length || insights.maxValue === 0) {
      return (
        <motion.div
          className="h-full flex items-center justify-center flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Calendar className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
          <p className="text-sm text-muted-foreground">No monthly data yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Read more documents to reveal your monthly patterns
          </p>
        </motion.div>
      );
    }

    return (
      <InsightCard
        title="Monthly Reading Cycle"
        description="Your reading activity throughout the month"
        icon={Calendar}
        insights={cardInsights}
        gradient={gradient}
        iconColor={iconColor}
        delay={0.3}
      >
        <div className="h-60 w-full">
          <motion.div
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={insights.data}
                margin={{ top: 15, right: 5, left: 0, bottom: 5 }}
                barCategoryGap={isMobile ? 1 : 2}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={currentTheme.border || "#333"}
                  opacity={0.15}
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  tick={{
                    fill: currentTheme.foreground + "80",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={true}
                  interval={isMobile ? 4 : 2}
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

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    fill: currentTheme.primary + "10",
                    radius: 4,
                  }}
                />

                {/* Average reading reference line */}
                <ReferenceLine
                  y={insights.average}
                  stroke={currentTheme.foreground}
                  strokeDasharray="3 3"
                  label={{
                    value: "Avg",
                    position: "right",
                    fill: currentTheme.foreground,
                    fontSize: 18,
                  }}
                  strokeOpacity={0.4}
                />

                <Bar
                  dataKey="count"
                  radius={6}
                  animationDuration={1500}
                  animationBegin={200}
                >
                  {insights.data.map((entry, index) => (
                    <Cell
                      key={`${entry.day}-${index}`}
                      fill={entry.barColor}
                      fillOpacity={entry.isPeak ? 1 : 0.8}
                      stroke={
                        entry.isPeak ? currentTheme.background : undefined
                      }
                      strokeWidth={entry.isPeak ? 1 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </InsightCard>
    );
  });

const figureOutMonthlyPattern = (data: DailyActivity[]): string => {
  const earlyMonthTotal = data
    .filter((d) => d.day <= 10)
    .reduce((sum, d) => sum + d.count, 0);

  const midMonthTotal = data
    .filter((d) => d.day > 10 && d.day <= 20)
    .reduce((sum, d) => sum + d.count, 0);

  const lateMonthTotal = data
    .filter((d) => d.day > 20)
    .reduce((sum, d) => sum + d.count, 0);

  let monthlyPattern = "balanced";
  if (earlyMonthTotal > midMonthTotal && earlyMonthTotal > lateMonthTotal) {
    monthlyPattern = "early-month";
  } else if (
    midMonthTotal > earlyMonthTotal &&
    midMonthTotal > lateMonthTotal
  ) {
    monthlyPattern = "mid-month";
  } else if (
    lateMonthTotal > earlyMonthTotal &&
    lateMonthTotal > midMonthTotal
  ) {
    monthlyPattern = "late-month";
  }

  return monthlyPattern;
};

const calculateDailyMetrics = (
  data: DailyActivity[]
): {
  average: number;
  maxValue: number;
} => {
  const totalReadings = data.reduce((sum, day) => sum + day.count, 0);
  const average = data.length > 0 ? totalReadings / data.length : 0;
  const maxValue = Math.max(...data.map((day) => day.count));

  return {
    average,
    maxValue,
  };
};

export default DayOfMonthActivityInsight;
