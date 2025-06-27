import { useWeekilyActivityMetrcis } from "@/hooks";
import type { WeeklyActivity } from "@/services/analytics/activity-analyzer";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import { useState, useEffect } from "react";
import WeeklyReadingPatternBarChart from "./reading-pattern-bar-chart";
import CardContainer from "@/components/shared/container/CardContainer";
import { BarChart2Icon } from "lucide-react";

interface WeeklyReadingPatternProps {
  history: ReadingHistoryItem[];
  compact?: boolean;
}

type WeeklyPatternInsight = {
  mostActiveDay: WeeklyActivity;
  leastActiveDay: WeeklyActivity;
  weekendVsWeekday: { weekend: number; weekday: number };
};

const WeeklyReadingPattern: React.FC<WeeklyReadingPatternProps> = ({
  history,
  compact = false,
}) => {
  const { calculateTotalWeeklyActivity, getWeeklyActivityMetrics } =
    useWeekilyActivityMetrcis();
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [insights, setInsights] = useState<WeeklyPatternInsight>({
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
    const fetchWeeklyActivity = async () => {
      const weeklyActivity = await calculateTotalWeeklyActivity(history);
      setWeeklyActivity(weeklyActivity);
    };
    fetchWeeklyActivity();
  }, [history, calculateTotalWeeklyActivity]);

  /**
   * 🔍 This magical function analyzes your weekly reading patterns!
   * Discovers your most active reading day, least active day,
   * and whether you're a weekend bookworm or weekday reader! 📖✨
   */
  useEffect(() => {
    const createInsights = async () => {
      const { mostActiveDay, leastActiveDay } = await getWeeklyActivityMetrics(
        weeklyActivity
      );
      const weekendVsWeekday = weeklyActivity.reduce(
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
  }, [weeklyActivity, getWeeklyActivityMetrics]);

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
      icon={BarChart2Icon}
      insights={cardInsights}
      description="Are you a weekend warrior or a weekday reader? 📅"
      compact={compact}
      variant="subtle"
    >
      <WeeklyReadingPatternBarChart weeklyActivity={weeklyActivity} />
    </CardContainer>
  );
};

export default WeeklyReadingPattern;
