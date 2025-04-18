import InsightCard from "./InsightCard";
import { Clock } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { TimeOfDayPreference } from "../trends";
import { useActivityStore } from "@/stores";
import type { ReadingHistoryItem } from "@/services/history";
import type { HourlyActivity } from "@/services/history/activity";

interface TimeOfDayInsightCardProps {
  history: ReadingHistoryItem[];
}

type TimeOfDayInsightCard = {
  mostActiveHour: HourlyActivity;
  leastActiveHour: HourlyActivity;
  totalReadingEvents: number;
  preferredPeriod: string;
  analyticsData: HourlyActivity[];
};

/**
 * ⏰ TimeOfDayInsightCard
 *
 * A beautiful visualization of when you prefer to read during the day!
 * Shows your peak reading hours and preferred time periods (morning, afternoon, evening, night).
 * Uses color-coded gradients to make your reading patterns visually delightful.
 */
const TimeOfDayInsightCard: React.FC<TimeOfDayInsightCardProps> = memo(
  ({ history }) => {
    const [insights, setInsights] = useState<TimeOfDayInsightCard>({
      mostActiveHour: { hour: 0, count: 0 },
      leastActiveHour: { hour: 0, count: 0 },
      totalReadingEvents: 0,
      preferredPeriod: "",
      analyticsData: [],
    });
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
    useEffect(() => {
      const createInsights = async () => {
        const analyticsData = await calculateTotalReadingByHour(history);
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
        setInsights({
          mostActiveHour,
          leastActiveHour,
          totalReadingEvents,
          preferredPeriod,
          analyticsData,
        });
      };

      createInsights();
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

    const cardInsights = insights.mostActiveHour
      ? [
          {
            label: "Peak hour",
            value: formatHour(insights.mostActiveHour.hour),
          },
          {
            label: "Preferred time",
            value: insights.preferredPeriod ?? "N/A",
            highlight: true,
          },
          {
            label: "Least active hour",
            value: formatHour(insights.leastActiveHour.hour),
          },
          {
            label: "Reading events",
            value: insights.totalReadingEvents.toString(),
          },
        ]
      : [];

    const { timeGradient, timeIconColor } = getStyles(insights.preferredPeriod);
    return (
      <InsightCard
        title="Time of Day Preference"
        description="When you're most likely to read throughout the day"
        icon={Clock}
        insights={cardInsights}
        gradient={timeGradient}
        iconColor={timeIconColor}
        delay={0.1}
      >
        <div className="h-52 w-full">
          <TimeOfDayPreference readingByHour={insights.analyticsData} />
        </div>
      </InsightCard>
    );
  }
);

export default TimeOfDayInsightCard;
