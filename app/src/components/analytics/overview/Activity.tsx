import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart } from "lucide-react";
import { useHistoryStore } from "@/stores";
import { getStreakEmoji } from "../utils";
import { DayOfMonth } from "@/components/insights";
import type { WeeklyActivity } from "@/services/analytics/activity-analyzer";
import { useActivityMetrics } from "@/hooks/analytics/use-activity-metrics";
type Activity = {
  streak: number;
  currentWeek: number;
  mostActiveDay: WeeklyActivity;
  leastActiveDay: WeeklyActivity;
};

/**
 * 📊 Activity Dashboard Component
 *
 * ✨ A beautiful dashboard that visualizes your reading habits and streaks!
 * 🔍 Shows your current reading streak with fun emojis
 * 📈 Displays weekly reading activity with most/least active days
 * 📆 Includes a monthly trend visualization for long-term insights
 * 🎯 Helps you track your reading consistency and celebrate progress
 */
const Activity: React.FC = () => {
  const readingHistory = useHistoryStore((state) => state.readingHistory);
  const { currentStreak } = useHistoryStore((state) => state.streak);
  const { calculateTotalWeeklyActivity, getWeeklyActivityMetrics } =
    useActivityMetrics();

  const [activity, setActivity] = useState<Activity>({
    streak: 0,
    currentWeek: 0,
    mostActiveDay: { day: "Sunday", count: 0 },
    leastActiveDay: { day: "Sunday", count: 0 },
  });

  /**
   * 🗓️ Filters reading history to only show current week's activity
   */
  const currentWeekHistory = useMemo(() => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return readingHistory.filter((reading) => {
      const readingDate = new Date(reading.lastReadAt);
      return readingDate >= startOfWeek;
    });
  }, [readingHistory]);

  useEffect(() => {
    const createActivity = async () => {
      const weeklyActivity = await calculateTotalWeeklyActivity(readingHistory);
      const { mostActiveDay, leastActiveDay } = await getWeeklyActivityMetrics(
        weeklyActivity
      );
      setActivity({
        streak: currentStreak,
        currentWeek: currentWeekHistory.length,
        mostActiveDay,
        leastActiveDay,
      });
    };

    createActivity();
  }, [
    readingHistory,
    currentStreak,
    calculateTotalWeeklyActivity,
    getWeeklyActivityMetrics,
    currentWeekHistory.length,
  ]);

  /**
   * 📅 Filters reading history to only show current month's activity
   */
  const currentMonthHistory = useMemo(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return readingHistory.filter((reading) => {
      const readingDate = new Date(reading.lastReadAt);
      return readingDate >= startOfMonth;
    });
  }, [readingHistory]);

  const streakEmoji = getStreakEmoji(currentStreak);

  /**
   * 🌟 Summary cards showing your reading achievements
   */
  const summary = [
    {
      heading: "Streak",
      value: currentStreak,
      emoji: streakEmoji,
      description: "Days in a row",
    },
    {
      heading: "This Week",
      value: currentWeekHistory.length,
      emoji: "🚀",
      description: "Documents read",
    },
    {
      heading: "Most Active Day",
      emoji: "🌞",
      value: activity.mostActiveDay.day,
      description: `You read ${activity.mostActiveDay.count} documents`,
    },
    {
      heading: "Least Active Day",
      emoji: "🥹",
      value: activity.leastActiveDay.day,
      description: `You only read ${activity.leastActiveDay.count} documents`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Reading Stats Card */}
      <Card className="p-4 border-primary/10 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium flex items-center">
            <LineChart className="h-4 w-4 mr-2 text-primary" />
            Activity Summary
          </h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summary.map(({ heading, value, description, emoji }) => (
            <div
              className="bg-card rounded-2xl p-3 border border-primary/10"
              key={heading}
            >
              <div className="text-xs text-muted-foreground">{heading}</div>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold">{value}</span>
                <span className="text-lg ml-1">{emoji}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {description}
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Insights */}
        <div className="mt-6">
          <h5 className="text-xs uppercase text-muted-foreground font-medium mb-3">
            Current Month Activity{" "}
            <span className="text-xs text-muted-foreground">
              {`(${currentMonthHistory.length} documents read) 😎`}
            </span>
          </h5>
          <DayOfMonth history={currentMonthHistory} />
        </div>
      </Card>
    </div>
  );
};

export default Activity;
