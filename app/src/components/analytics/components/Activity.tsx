import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStreakEmoji } from "../utils";

import type { AnalyticsData } from "../types";
import type { ReadingStats } from "@/utils/ReadingAnalyticsService";
import type { ReadingHistoryItem } from "@/hooks/useDocumentManager";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface ActivityProps {
  analyticsData: AnalyticsData;
  stats: ReadingStats;
  readingHistory: ReadingHistoryItem[];
}
const Activity = ({ analyticsData, stats, readingHistory }: ActivityProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Reading Heatmap (Detailed) */}
      <Card className="p-4 border-primary/10 md:col-span-2 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Reading Activity Calendar</h3>
          <Badge variant="outline" className="text-xs">
            Last 90 Days
          </Badge>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-full">
            <div className="flex flex-wrap gap-1 min-w-[500px]">
              {analyticsData.readingHeatmap.map((day) => {
                // Calculate color intensity based on count
                let intensity = 0;
                if (day.count > 0) intensity = Math.min(day.count * 25, 100);

                // Format date for tooltip
                const dateObj = new Date(day.date);
                const formattedDate = dateObj.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={day.date}
                    className="w-4 h-4 rounded-sm tooltip-container flex items-center justify-center text-[8px]"
                    style={{
                      backgroundColor:
                        intensity === 0
                          ? "var(--secondary)"
                          : `rgba(var(--primary-rgb), ${intensity / 100})`,
                      color: intensity > 50 ? "white" : "transparent",
                    }}
                    title={`${formattedDate}: ${day.count} documents`}
                  >
                    {day.count > 0 ? day.count : ""}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <div>
            Total Activity:{" "}
            {analyticsData.readingHeatmap.reduce(
              (sum, day) => sum + day.count,
              0
            )}{" "}
            documents
          </div>
          <div className="flex items-center gap-1">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-secondary" />
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: "rgba(var(--primary-rgb), 0.25)",
              }}
            />
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: "rgba(var(--primary-rgb), 0.5)" }}
            />
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: "rgba(var(--primary-rgb), 0.75)",
              }}
            />
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: "rgba(var(--primary-rgb), 1)" }}
            />
            <span>More</span>
          </div>
        </div>
      </Card>

      {/* Reading Time by Hour */}
      <Card className="p-4 border-primary/10 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Reading by Hour</h3>
          <Badge variant="outline" className="text-xs">
            All Time
          </Badge>
        </div>

        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.readingByHour}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="hour"
                tickFormatter={(hour) => {
                  const formattedHour = hour % 12 || 12;
                  const amPm = hour < 12 ? "AM" : "PM";
                  return `${formattedHour}${amPm}`;
                }}
                ticks={[0, 4, 8, 12, 16, 20]} // Show only every 4 hours
              />
              <YAxis allowDecimals={false} />
              <RechartsTooltip
                formatter={(value) => [value, "Documents"]}
                labelFormatter={(hour) => {
                  const formattedHour = hour % 12 || 12;
                  const amPm = hour < 12 ? "AM" : "PM";
                  return `${formattedHour}:00 ${amPm}`;
                }}
              />
              <Bar
                dataKey="count"
                fill="#8884d8"
                name="Documents Read"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Weekly Reading Activity */}
      <Card className="p-4 border-primary/10 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Weekly Pattern</h3>
          <Badge variant="outline" className="text-xs">
            All Time
          </Badge>
        </div>

        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.weeklyActivity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="day" type="category" width={80} />
              <RechartsTooltip />
              <Bar
                dataKey="count"
                fill="#82ca9d"
                name="Documents Read"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Streak Calendar */}
      <Card className="p-4 border-primary/10 md:col-span-2 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Reading Streak</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {stats.currentStreak} days
            </span>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-none rounded-4xl"
            >
              Current
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 rounded-lg bg-secondary/5 border border-secondary/10">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2 flex items-center justify-center">
              {stats.currentStreak}
              <span className="text-4xl ml-2">
                {getStreakEmoji(stats.currentStreak)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Current Streak</p>

            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.longestStreak}</div>
                <p className="text-xs text-muted-foreground">Longest Streak</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {readingHistory.length > 0
                    ? Math.round(
                        readingHistory.length /
                          (analyticsData.readingHeatmap.length / 7)
                      )
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">Weekly Average</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Activity;
