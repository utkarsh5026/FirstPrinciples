import { memo, useEffect, useState } from "react";
import { Calendar } from "lucide-react";

import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import { useTheme } from "@/components/features/theme/hooks/use-theme";
import { generateThemeColors } from "@/utils/colors";
import type { DailyActivity } from "@/services/analytics/activity-analyzer";
import { useActivityMetrics } from "@/hooks/analytics/use-activity-metrics";
import CardContainer from "@/components/shared/container/card-container";
import DaytoDayActivityAreaChart from "./day-to-day-activity-area-chart";

interface DailyActivityInsightProps {
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
const DailyActivityInsight: React.FC<DailyActivityInsightProps> = memo(
  ({ history }) => {
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

    return (
      <CardContainer
        title="Monthly Reading Cycle"
        description="Your reading activity throughout the month"
        icon={Calendar}
        insights={cardInsights}
        variant="subtle"
        delay={0.3}
      >
        <DaytoDayActivityAreaChart data={insights.data} />
      </CardContainer>
    );
  }
);

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

export default DailyActivityInsight;
