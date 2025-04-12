import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useReadingMetrics } from "@/context/metrics/MetricsContext";
import { MonthlyTrend } from "../trends";
import { LineChart } from "lucide-react";
import { useReadingHistory } from "@/context/history/HistoryContext";
import { getStreakEmoji } from "../utils";
const dayDescription = {
  Sun: "Sunday is Funday",
  Mon: "Monday is Motivational",
  Tue: "Tuesday is Tidy",
  Wed: "Wednesday is Wacky",
  Thu: "Thursday is Thankful",
  Fri: "Friday is Fantastic",
  Sat: "Saturday is Super",
} as const;

const Activity: React.FC = () => {
  const { analyticsData, metrics } = useReadingMetrics();
  const { readingHistory } = useReadingHistory();
  const { weeklyActivity } = analyticsData;

  const mostActiveDay = useMemo(() => {
    if (weeklyActivity.length === 0) return "—";
    return weeklyActivity
      .reduce(
        (max, day) => (day.count > max.count ? day : max),
        weeklyActivity[0]
      )
      .day.slice(0, 3);
  }, [weeklyActivity]);

  const currentWeekReadingCount = useMemo(() => {
    return readingHistory.filter((reading) => {
      const readingDate = new Date(reading.lastReadAt);
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() || 0));
      return readingDate >= startOfWeek;
    }).length;
  }, [readingHistory]);

  const streakEmoji = getStreakEmoji(metrics.currentStreak);

  const summary = [
    {
      heading: "Streak",
      value: metrics.currentStreak,
      emoji: streakEmoji,
      description: "Days in a row",
    },
    {
      heading: "Best Streak",
      value: metrics.longestStreak,
      emoji: "😲",
      description: "Consecutive days",
    },
    {
      heading: "This Week",
      value: currentWeekReadingCount,
      emoji: "📚",
      description: "Documents read",
    },
    {
      heading: "Most Active Day",
      emoji: "🌞",
      value: mostActiveDay,
      description: dayDescription[mostActiveDay as keyof typeof dayDescription],
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
            Monthly Activity
          </h5>
          <div className="h-56">
            <MonthlyTrend />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Activity;
