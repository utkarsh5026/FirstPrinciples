import CardContainer from "@/components/shared/container/card-container";
import { Clock, Moon, Coffee, Sun, Lightbulb, Book } from "lucide-react";
import TimeOfTheDayDistributionBarChart from "./time-of-the-day-bar-chart";
import { useActivityMetrics } from "@/hooks/analytics/use-activity-metrics";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import { useState, useEffect, useMemo } from "react";
import type { HourlyActivity } from "@/services/analytics/activity-analyzer";
import HourOftheDayDistributionAreaChart from "./hour-of-the-day-area-chart";
import { fromSnakeToTitleCase } from "@/utils/string";

interface TimeOfTheDayDistributionProps {
  history: ReadingHistoryItem[];
  typeOfChart: "bar" | "area";
  compact?: boolean;
}

/**
 * 🕰️ TimeOfTheDayDistribution
 *
 * A beautiful visualization that shows when you prefer to read during the day!
 * Are you an early bird with your coffee ☕, a midday reader soaking up the sun ☀️,
 * or a night owl reading under moonlight 🌙?
 *
 * This component analyzes your reading patterns throughout the day and
 * presents them in either a bar chart or area chart format.
 */
const TimeOfTheDayDistribution: React.FC<TimeOfTheDayDistributionProps> = ({
  history,
  typeOfChart = "bar",
  compact = false,
}) => {
  const { calculateTotalReadingByHour } = useActivityMetrics();
  const [hourlyData, setHourlyData] = useState<HourlyActivity[]>([]);

  /**
   * 📊 Fetches your hourly reading data when history changes
   */
  useEffect(() => {
    const fetchHourlyData = async () => {
      const data = await calculateTotalReadingByHour(history);
      setHourlyData(data);
    };
    fetchHourlyData();
  }, [history, calculateTotalReadingByHour]);

  /**
   * 🎨 Determines the visual style for each time of day
   */
  const getCss = (timeOfDay: string) => {
    switch (timeOfDay.toLowerCase()) {
      case "morning":
        return {
          icon: Coffee,
          color: "text-pink-500",
        };
      case "afternoon":
        return {
          icon: Sun,
          color: "text-orange-500",
        };
      case "evening":
      case "night":
      default:
        return {
          icon: Moon,
          color: "text-blue-500",
        };
    }
  };

  /**
   * 🕒 Transforms raw hourly data into user-friendly reading metrics
   */
  const readingByHour = useMemo(() => {
    const totalReadings = hourlyData.reduce((sum, item) => sum + item.count, 0);

    const getFormattedTime = (hour: number) => {
      let formattedHour;
      switch (hour) {
        case 0:
          formattedHour = 12;
          break;
        case 12:
          formattedHour = 12;
          break;
        default:
          formattedHour = hour > 12 ? hour - 12 : hour;
      }
      const period = hour >= 12 ? "PM" : "AM";
      return `${formattedHour}:00 ${period}`;
    };

    const getPeriod = (hour: number) => {
      if (hour >= 5 && hour < 12) return "morning";
      if (hour >= 12 && hour < 17) return "afternoon";
      if (hour >= 17 && hour < 21) return "evening";
      return "night";
    };

    return hourlyData.map((hour) => {
      const period = getPeriod(hour.hour);
      return {
        ...hour,
        period,
        comparedToAverage: hour.count / totalReadings,
        icon: getCss(period).icon,
        textcolorClass: getCss(period).color,
        formmattedTime: getFormattedTime(hour.hour),
      };
    });
  }, [hourlyData]);

  /**
   * 📈 Calculates insightful metrics about your reading habits
   * Finds your peak reading hours, preferred time of day, and more!
   */
  const timeMetrics = useMemo(() => {
    if (hourlyData.length === 0) return null;

    const totalReadings = hourlyData.reduce((sum, item) => sum + item.count, 0);
    const peak = readingByHour.reduce(
      (max, hour) => (hour.count > max.count ? hour : max),
      readingByHour[0]
    );

    const leastReadHour = readingByHour.reduce(
      (min, hour) => (hour.count < min.count ? hour : min),
      readingByHour[0]
    );

    const periodTotals = {
      morning: 0, // 5am-11am
      afternoon: 0, // 12pm-4pm
      evening: 0, // 5pm-8pm
      night: 0, // 9pm-4am
    };

    readingByHour.forEach(({ period, count }) => {
      periodTotals[period as keyof typeof periodTotals] += count;
    });

    const preferredPeriod = Object.entries(periodTotals).reduce(
      (max, [period, count]) => (count > max.count ? { period, count } : max),
      { period: "none", count: 0 }
    );

    return {
      peak,
      totalReadings,
      periodTotals,
      preferredPeriod,
      leastReadHour,
    };
  }, [hourlyData, readingByHour]);

  /**
   * 🌓 Creates data for the time period visualization
   * Groups your reading into morning, afternoon, evening and night
   */
  const createPeriodData = () => {
    if (!timeMetrics) return [];

    const rangeMap = {
      morning: [5, 11],
      afternoon: [12, 17],
      evening: [17, 21],
      night: [21, 5],
    };

    return Object.entries(timeMetrics.periodTotals).map(([period, count]) => ({
      period,
      count,
      range: rangeMap[period as keyof typeof rangeMap],
      render: {
        icon: getCss(period).icon,
        textcolorClass: getCss(period).color,
      },
    }));
  };

  return (
    <>
      {typeOfChart === "bar" ? (
        <CardContainer
          title="Time of the Day Distribution"
          icon={Clock}
          description="So are you a morning person or a night owl?"
          compact={compact}
          baseColor="blue"
          variant="subtle"
        >
          <TimeOfTheDayDistributionBarChart periodData={createPeriodData()} />
        </CardContainer>
      ) : (
        <CardContainer
          title="Hourly Reading Distribution"
          icon={Clock}
          description="At which hour do you read the most?"
          compact={compact}
          variant="subtle"
          insights={[
            {
              label: "Peak Hour",
              value: `${timeMetrics?.peak.formmattedTime}`,
              icon: timeMetrics?.peak.icon,
            },
            {
              label: "Preferred Period",
              value: `${fromSnakeToTitleCase(
                timeMetrics?.preferredPeriod.period ?? ""
              )}`,
              icon: Lightbulb,
            },
            {
              label: "Total Readings",
              value: `${timeMetrics?.totalReadings}`,
              icon: Book,
            },
            {
              label: "Least Read Hour",
              value: `${timeMetrics?.leastReadHour.formmattedTime}`,
              icon: Book,
            },
          ]}
        >
          <HourOftheDayDistributionAreaChart
            metrics={timeMetrics}
            periodData={createPeriodData()}
            readingByHour={readingByHour}
          />
        </CardContainer>
      )}
    </>
  );
};

export default TimeOfTheDayDistribution;
