import InsightCard from "./InsightCard";
import { Clock } from "lucide-react";
import { memo, useMemo } from "react";
import { TimeOfDayPreference } from "../trends";
import { useActivityStore } from "@/stores";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";

interface TimeOfDayInsightCardProps {
  history: ReadingHistoryItem[];
}

/**
 * ⏰ TimeOfDayInsightCard
 *
 * A beautiful visualization of when you prefer to read during the day!
 * Shows your peak reading hours and preferred time periods (morning, afternoon, evening, night).
 * Uses color-coded gradients to make your reading patterns visually delightful.
 */
const TimeOfDayInsightCard: React.FC<TimeOfDayInsightCardProps> = memo(
  ({ history }) => {
    const calculateTotalReadingByHour = useActivityStore(
      (state) => state.calculateTotalReadingByHour
    );

    const getReadingByHourMetrics = useActivityStore(
      (state) => state.getReadingByHourMetrics
    );

    /**
     * 🎉 This magical function gathers insights about your reading habits!
     * It reveals your most and least active reading hours,
     * counts how many times you've read, and identifies your favorite time of day to dive into a book! 📚✨
     */
    const {
      mostActiveHour,
      leastActiveHour,
      totalReadingEvents,
      preferredPeriod,
      analyticsData,
    } = useMemo(() => {
      const analyticsData = calculateTotalReadingByHour(history);
      const { mostActiveHour, leastActiveHour } =
        getReadingByHourMetrics(analyticsData);
      const totalReadingEvents =
        analyticsData?.reduce((sum, hour) => sum + hour.count, 0) || 0;

      const getPreferredPeriod = (hour: number) => {
        if (hour >= 5 && hour < 12) return "morning";
        if (hour >= 12 && hour < 17) return "afternoon";
        if (hour >= 17 && hour < 21) return "evening";
        return "night";
      };

      const preferredPeriod = getPreferredPeriod(mostActiveHour.hour);
      return {
        mostActiveHour,
        leastActiveHour,
        totalReadingEvents,
        preferredPeriod,
        analyticsData,
      };
    }, [history, calculateTotalReadingByHour, getReadingByHourMetrics]);

    /**
     * 🕒 Converts 24-hour format to friendly 12-hour format
     */
    const formatHour = (hour: number) => {
      if (hour === 0) return "12 AM";
      if (hour === 12) return "12 PM";
      if (hour < 12) return `${hour} AM`;
      return `${hour - 12} PM`;
    };

    /**
     * 🎨 Provides beautiful color themes for each time period
     */
    const getStyles = (period: string) => {
      switch (period) {
        case "morning":
          return {
            timeGradient: "from-blue-500/5 to-blue-500/10",
            timeIconColor: "text-blue-500",
          };
        case "afternoon":
          return {
            timeGradient: "from-orange-500/5 to-orange-500/10",
            timeIconColor: "text-orange-500",
          };
        case "evening":
          return {
            timeGradient: "from-purple-500/5 to-purple-500/10",
            timeIconColor: "text-purple-500",
          };
        default:
          return {
            timeGradient: "from-indigo-500/5 to-indigo-500/10",
            timeIconColor: "text-indigo-500",
          };
      }
    };

    const insights = mostActiveHour
      ? [
          {
            label: "Peak hour",
            value: formatHour(mostActiveHour.hour),
          },
          {
            label: "Preferred time",
            value: preferredPeriod ?? "N/A",
            highlight: true,
          },
          {
            label: "Least active hour",
            value: formatHour(leastActiveHour.hour),
          },
          { label: "Reading events", value: totalReadingEvents.toString() },
        ]
      : [];

    const { timeGradient, timeIconColor } = getStyles(preferredPeriod);
    return (
      <InsightCard
        title="Time of Day Preference"
        description="When you're most likely to read throughout the day"
        icon={Clock}
        insights={insights}
        gradient={timeGradient}
        iconColor={timeIconColor}
        delay={0.1}
      >
        <div className="h-52 w-full">
          <TimeOfDayPreference readingByHour={analyticsData} />
        </div>
      </InsightCard>
    );
  }
);

export default TimeOfDayInsightCard;
