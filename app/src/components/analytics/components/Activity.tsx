import React from "react";
import { Card } from "@/components/ui/card";
import type { ReadingStats } from "@/utils/ReadingAnalyticsService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
} from "recharts";
import ActivityHeatmap from "./AnalyticsHeatmap";

interface ActivityProps {
  stats: ReadingStats;
  streakEmoji: string;
  thisWeekReadingCount: number;
  weeklyActivity: { day: string; count: number }[];
  monthlyReadingData: { name: string; count: number }[];
  heatMapData: { date: string; count: number }[];
}
const dayDescription = {
  Sun: "Sunday is Funday",
  Mon: "Monday is Motivational",
  Tue: "Tuesday is Tidy",
  Wed: "Wednesday is Wacky",
  Thu: "Thursday is Thankful",
  Fri: "Friday is Fantastic",
  Sat: "Saturday is Super",
} as const;

const Activity: React.FC<ActivityProps> = ({
  stats,
  streakEmoji,
  thisWeekReadingCount,
  weeklyActivity,
  monthlyReadingData,
  heatMapData,
}) => {
  const mostActiveDay =
    weeklyActivity.length > 0
      ? weeklyActivity
          .reduce(
            (max, day) => (day.count > max.count ? day : max),
            weeklyActivity[0]
          )
          .day.slice(0, 3)
      : "—";

  const summary = [
    {
      heading: "Streak",
      value: stats.currentStreak,
      emoji: streakEmoji,
      description: "Days in a row",
    },
    {
      heading: "Best Streak",
      value: stats.longestStreak,
      emoji: "😲",
      description: "Consecutive days",
    },
    {
      heading: "This Week",
      value: thisWeekReadingCount,
      emoji: "📚",
      description: "Documents read",
    },
    {
      heading: "Most Active Day",
      emoji: "🌞",
      value:
        weeklyActivity.length > 0
          ? weeklyActivity
              .reduce(
                (max, day) => (day.count > max.count ? day : max),
                weeklyActivity[0]
              )
              .day.slice(0, 3)
          : "—",
      description: dayDescription[mostActiveDay as keyof typeof dayDescription],
    },
  ];
  return (
    <div className="space-y-6">
      {/* Heat Map */}
      <ActivityHeatmap
        data={heatMapData}
        title="Reading Activity Calendar"
        subtitle="Track your reading consistency over time"
      />

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
              className="bg-card rounded-lg p-3 border border-primary/10"
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyReadingData}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <RechartsTooltip
                  formatter={(value: number) => [`${value} documents`, "Read"]}
                  labelStyle={{ color: "#888" }}
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    border: "1px solid #333",
                    borderRadius: "4px",
                    color: "#fff",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  name="Documents Read"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Activity;
