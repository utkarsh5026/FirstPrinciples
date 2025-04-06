import React from "react";
import { BookOpen, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { COLORS, formatDate } from "../utils";
import type { AnalyticsData } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface OverViewProps {
  analyticsData: AnalyticsData;
  onSelectDocument: (path: string, title: string) => void;
}

const OverView: React.FC<OverViewProps> = ({
  analyticsData,
  onSelectDocument,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
      {/* Weekly Reading Activity */}
      <Card className="p-4 border-primary/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Weekly Reading</h3>
          <Badge variant="outline" className="text-xs">
            This Week
          </Badge>
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="day"
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
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

      {/* Category Breakdown */}
      <Card className="p-4 border-primary/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Category Breakdown</h3>
          <Badge variant="outline" className="text-xs">
            All Time
          </Badge>
        </div>

        <div className="h-40 flex items-center justify-center">
          {analyticsData.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {analyticsData.categoryBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground text-sm">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>Read some documents to see your category breakdown</p>
            </div>
          )}
        </div>
      </Card>

      {/* Reading Heatmap */}
      <Card className="p-4 border-primary/10 md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Reading Activity</h3>
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
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={day.date}
                    className="w-3 h-3 rounded-sm tooltip-container"
                    style={{
                      backgroundColor:
                        intensity === 0
                          ? "var(--secondary)"
                          : `rgba(var(--primary-rgb), ${intensity / 100})`,
                    }}
                    title={`${formattedDate}: ${day.count} documents`}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
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

      {/* Recent Activity */}
      <Card className="p-4 border-primary/10 md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Recent Activity</h3>
          <Badge variant="outline" className="text-xs">
            Last 5 Documents
          </Badge>
        </div>

        {analyticsData.recentActivity.length > 0 ? (
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {analyticsData.recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/10 transition-colors cursor-pointer"
                  onClick={() =>
                    onSelectDocument(activity.path, activity.title)
                  }
                >
                  <div className="mt-0.5 flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>

                  <div className="flex-grow min-w-0">
                    <p className="font-medium text-sm truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1 inline" />
                      <span>{formatDate(activity.lastReadAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-48 flex items-center justify-center text-center text-muted-foreground text-sm">
            <div>
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No reading activity yet</p>
              <p className="text-xs mt-1">
                Start reading to track your progress
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OverView;
