import { memo, useState, useEffect } from "react";
import CardContainer from "@/components/container/CardContainer";
import { CalendarDays } from "lucide-react";
import { ReadingByWeekDay } from "../trends";
import type { ReadingHistoryItem } from "@/services/history";
import { useActivityStore } from "@/stores";
import { WeeklyActivity } from "@/services/history/activity";

interface WeekdayPatternInsightCardProps {
  history: ReadingHistoryItem[];
}

type WeeklyPatternInsightCard = {
  mostActiveDay: WeeklyActivity;
  leastActiveDay: WeeklyActivity;
  weekendVsWeekday: { weekend: number; weekday: number };
};

/**
 * 📊 WeekdayPatternInsightCard
 *
 * A beautiful visualization of your weekly reading habits! ✨
 * Shows which days you love to read the most and compares your
 * weekend vs weekday reading patterns.
 *
 * Uses color-coded gradients to make your reading journey visually delightful!
 * Emerald for weekend warriors 🏝️, cyan for weekday readers 📚
 */
export const WeekdayPattern: React.FC<WeekdayPatternInsightCardProps> = memo(
  ({ history = [] }) => {
    const calculateTotalWeeklyActivity = useActivityStore(
      (state) => state.calculateTotalWeeklyActivity
    );

    const getWeeklyActivityMetrics = useActivityStore(
      (state) => state.getWeeklyActivityMetrics
    );

    const [insights, setInsights] = useState<WeeklyPatternInsightCard>({
      mostActiveDay: { day: "Sunday", count: 0 },
      leastActiveDay: { day: "Sunday", count: 0 },
      weekendVsWeekday: { weekend: 0, weekday: 0 },
    });

    /**
     * 🔍 This magical function analyzes your weekly reading patterns!
     * Discovers your most active reading day, least active day,
     * and whether you're a weekend bookworm or weekday reader! 📖✨
     */
    useEffect(() => {
      const createInsights = async () => {
        const analyticsData = await calculateTotalWeeklyActivity(history);
        const { mostActiveDay, leastActiveDay } =
          getWeeklyActivityMetrics(analyticsData);
        const weekendVsWeekday = analyticsData.reduce(
          (acc, day) => {
            if (day.day === "Saturday" || day.day === "Sunday") {
              acc.weekend += day.count;
            } else {
              acc.weekday += day.count;
            }
            return acc;
          },
          { weekend: 0, weekday: 0 }
        );
        setInsights({ mostActiveDay, leastActiveDay, weekendVsWeekday });
      };

      createInsights();
    }, [history, calculateTotalWeeklyActivity, getWeeklyActivityMetrics]);

    const cardInsights = insights.mostActiveDay
      ? [
          {
            label: "Most active",
            value: insights.mostActiveDay.day,
            highlight: true,
          },
          { label: "Least active", value: insights.leastActiveDay.day },
          {
            label: "Weekend reads",
            value: insights.weekendVsWeekday.weekend.toString(),
          },
          {
            label: "Weekday reads",
            value: insights.weekendVsWeekday.weekday.toString(),
          },
        ]
      : [];

    return (
      <CardContainer
        title="Weekly Reading Pattern"
        description="Your reading activity throughout the week"
        icon={CalendarDays}
        insights={cardInsights}
        baseColor={"primary"}
        variant={"subtle"}
        delay={0}
        infoTooltip={
          "This chart shows your reading activity throughout the week. The most active day is the day with the highest number of reads, and the least active day is the day with the lowest number of reads. The weekend reads are the number of reads on the weekend, and the weekday reads are the number of reads on the weekdays."
        }
      >
        <div className="h-52 w-full">
          <ReadingByWeekDay />
        </div>
      </CardContainer>
    );
  }
);

export default WeekdayPattern;
