import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Calendar,
  Clock,
  BookText,
  PieChart as PieChartIcon,
  Filter,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Line,
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  LineChart,
} from "recharts";

import type { ReadingStats } from "@/utils/ReadingAnalyticsService";
import type { AnalyticsData } from "../types";
import type { ReadingHistoryItem } from "@/hooks/useDocumentManager";
import { COLORS } from "../utils";

interface InsightsProps {
  stats: ReadingStats;
  analyticsData: AnalyticsData;
  isMobile: boolean;
  readingHistory: ReadingHistoryItem[];
  monthlyReadingData: { name: string; count: number }[];
}

const Insights: React.FC<InsightsProps> = ({
  stats,
  analyticsData,
  readingHistory,
  isMobile,
  monthlyReadingData,
}) => {
  const { weeklyActivity, readingByHour, categoryBreakdown } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Reading Habits */}
      <Card className="p-4 border-primary/10">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium flex items-center">
            <PieChartIcon className="h-4 w-4 mr-2 text-primary" />
            Reading Habits
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Pattern */}
          <div className="space-y-2">
            <h5 className="text-xs uppercase text-muted-foreground font-medium">
              Day of Week Preference
            </h5>

            <div className="h-48">
              {weeklyActivity.some((day) => day.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyActivity}
                    margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#333"
                      opacity={0.1}
                    />
                    <XAxis
                      dataKey="day"
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
                      formatter={(value: number) => [
                        `${value} documents`,
                        "Read",
                      ]}
                      contentStyle={{
                        backgroundColor: "rgba(22, 22, 22, 0.9)",
                        border: "1px solid #333",
                        borderRadius: "4px",
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
              ) : (
                <div className="h-full flex items-center justify-center flex-col">
                  <Calendar className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Read more to see day patterns
                  </p>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-center mt-1">
              {weeklyActivity.some((day) => day.count > 0)
                ? `Most active: ${
                    weeklyActivity.reduce(
                      (max, day) => (day.count > max.count ? day : max),
                      weeklyActivity[0]
                    ).day
                  }`
                : "No data yet"}
            </div>
          </div>

          {/* Time of Day Pattern */}
          <div className="space-y-2">
            <h5 className="text-xs uppercase text-muted-foreground font-medium">
              Time of Day Preference
            </h5>

            <div className="h-48">
              {readingByHour.some((item) => item.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={readingByHour}
                    margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#333"
                      opacity={0.1}
                    />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(hour) => {
                        if (hour % 6 === 0) {
                          if (hour === 0) return "12am";
                          if (hour === 12) return "12pm";
                          return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
                        }
                        return "";
                      }}
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
                      formatter={(value: number) => [
                        `${value} documents`,
                        "Read",
                      ]}
                      labelFormatter={(hour) => {
                        if (hour === 0) return "12:00 AM";
                        if (hour === 12) return "12:00 PM";
                        return hour < 12
                          ? `${hour}:00 AM`
                          : `${hour - 12}:00 PM`;
                      }}
                      contentStyle={{
                        backgroundColor: "rgba(22, 22, 22, 0.9)",
                        border: "1px solid #333",
                        borderRadius: "4px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center flex-col">
                  <Clock className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Read more to see time patterns
                  </p>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-center mt-1">
              {readingByHour.some((item) => item.count > 0)
                ? (() => {
                    const peakHour = readingByHour.reduce(
                      (max, hour) => (hour.count > max.count ? hour : max),
                      readingByHour[0]
                    ).hour;
                    const period = peakHour >= 12 ? "PM" : "AM";
                    const displayHour =
                      peakHour === 0
                        ? 12
                        : peakHour > 12
                        ? peakHour - 12
                        : peakHour;
                    return `Peak reading time: ${displayHour}:00 ${period}`;
                  })()
                : "No data yet"}
            </div>
          </div>
        </div>

        {/* Reading Progress Over Time */}
        <div className="mt-6 pt-6 border-t border-border/40">
          <h5 className="text-xs uppercase text-muted-foreground font-medium mb-3">
            Progress Over Time
          </h5>

          <div className="h-64">
            {monthlyReadingData.some((month) => month.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyReadingData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorReading"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--primary)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--primary)"
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  </defs>
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
                    formatter={(value: number) => [
                      `${value} documents`,
                      "Read",
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(22, 22, 22, 0.9)",
                      border: "1px solid #333",
                      borderRadius: "4px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--primary)"
                    fillOpacity={1}
                    fill="url(#colorReading)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center flex-col">
                <BarChart3 className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
                <p className="text-muted-foreground text-sm">
                  No monthly data yet
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Read more documents to track your progress
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Category Insights */}
      <Card className="p-4 border-primary/10">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium flex items-center">
            <Filter className="h-4 w-4 mr-2 text-primary" />
            Category Insights
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="space-y-2">
            <h5 className="text-xs uppercase text-muted-foreground font-medium">
              Distribution
            </h5>

            <div className="h-48">
              {categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 30 : 40}
                      outerRadius={isMobile ? 60 : 70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number, name: string) => [
                        `${value} documents (${Math.round(
                          (value / readingHistory.length) * 100
                        )}%)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: "rgba(22, 22, 22, 0.9)",
                        border: "1px solid #333",
                        borderRadius: "4px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center flex-col">
                  <PieChartIcon className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No category data yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Categories Explored */}
          <div className="space-y-2">
            <h5 className="text-xs uppercase text-muted-foreground font-medium">
              Categories Explored
            </h5>

            <div className="h-48 overflow-auto">
              {stats.categoriesExplored.size > 0 ? (
                <div className="space-y-2">
                  {Array.from(stats.categoriesExplored).map(
                    (category, index) => {
                      const categoryDocs = readingHistory.filter((item) =>
                        item.path.startsWith(category)
                      ).length;

                      const percentage = Math.round(
                        (categoryDocs / readingHistory.length) * 100
                      );

                      return (
                        <div key={category} className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <div className="text-sm truncate">{category}</div>
                              <div className="text-xs text-muted-foreground">
                                {categoryDocs} docs
                              </div>
                            </div>
                            <Progress
                              value={percentage}
                              className="h-1.5 mt-1"
                              style={
                                {
                                  backgroundColor: `${
                                    COLORS[index % COLORS.length]
                                  }33`,
                                  "--progress-value": `${
                                    COLORS[index % COLORS.length]
                                  }`,
                                } as React.CSSProperties
                              }
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center flex-col">
                  <BookText className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No categories explored yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Insights;
