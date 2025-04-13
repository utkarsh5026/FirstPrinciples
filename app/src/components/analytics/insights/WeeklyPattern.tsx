import { useMemo, memo } from "react";
import InsightCard from "./InsightCard";
import { CalendarDays } from "lucide-react";
import { ReadingByWeekDay } from "../trends";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import { useActivityStore } from "@/stores";

interface WeekdayPatternInsightCardProps {
  history: ReadingHistoryItem[];
}

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

    /**
     * 🔍 This magical function analyzes your weekly reading patterns!
     * Discovers your most active reading day, least active day,
     * and whether you're a weekend bookworm or weekday reader! 📖✨
     */
    const { mostActiveDay, leastActiveDay, weekendVsWeekday } = useMemo(() => {
      const analyticsData = calculateTotalWeeklyActivity(history);
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
      return { mostActiveDay, leastActiveDay, weekendVsWeekday };
    }, [history, calculateTotalWeeklyActivity, getWeeklyActivityMetrics]);

    /**
     * 🎨 Creates beautiful color themes based on your reading style!
     * Weekend warriors get emerald, weekday readers get cyan! 💫
     */
    const getWeekStyles = (weekend: number, weekday: number) => {
      if (weekend > weekday) {
        return {
          gradient: "from-emerald-500/5 to-emerald-500/10",
          iconColor: "text-emerald-500",
        };
      }
      return {
        gradient: "from-cyan-500/5 to-cyan-500/10",
        iconColor: "text-cyan-500",
      };
    };

    const { gradient, iconColor } = getWeekStyles(
      weekendVsWeekday.weekend,
      weekendVsWeekday.weekday
    );

    const insights = mostActiveDay
      ? [
          { label: "Most active", value: mostActiveDay.day, highlight: true },
          { label: "Least active", value: leastActiveDay.day },
          {
            label: "Weekend reads",
            value: weekendVsWeekday.weekend.toString(),
          },
          {
            label: "Weekday reads",
            value: weekendVsWeekday.weekday.toString(),
          },
        ]
      : [];

    return (
      <InsightCard
        title="Weekly Reading Pattern"
        description="Your reading activity throughout the week"
        icon={CalendarDays}
        insights={insights}
        gradient={gradient}
        iconColor={iconColor}
        delay={0}
      >
        <div className="h-52 w-full">
          <ReadingByWeekDay />
        </div>
      </InsightCard>
    );
  }
);

export default WeekdayPattern;
