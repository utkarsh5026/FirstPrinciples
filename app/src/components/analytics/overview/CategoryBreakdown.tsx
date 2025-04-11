import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookText, PieChart as PieChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";
import { CategoryPieChart } from "@/components/insights";

interface CategoryBreakDownProps {
  categoryBreakdown: { name: string; value: number }[];
  isMobile: boolean;
  readingByHour: { hour: number; count: number }[];
}

const CategoryBreakDown: React.FC<CategoryBreakDownProps> = ({
  categoryBreakdown,
  readingByHour,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category Breakdown */}
      <Card className="p-4 border-primary/10 rounded-2xl">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium flex items-center">
            <BookText className="h-4 w-4 mr-2 text-primary" />
            Reading by Category
          </h4>
          <Badge variant="outline" className="text-xs">
            {categoryBreakdown.length} Categories
          </Badge>
        </div>

        {categoryBreakdown.length > 0 ? (
          <div className="h-64 md:h-72">
            <CategoryPieChart />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center flex-col">
            <PieChartIcon className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
            <p className="text-muted-foreground text-sm">
              No category data yet
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Read more documents to see category breakdowns
            </p>
          </div>
        )}
      </Card>

      {/* Time of Day */}
      <Card className="p-4 border-primary/10 rounded-2xl">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            Reading by Time of Day
          </h4>
        </div>

        {readingByHour.some((item) => item.count > 0) ? (
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={readingByHour}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="hour"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(hour) => {
                    if (hour === 0) return "12am";
                    if (hour === 12) return "12pm";
                    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
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
                  formatter={(value: number) => [`${value} documents`, "Read"]}
                  labelFormatter={(hour) => {
                    if (hour === 0) return "12:00 AM";
                    if (hour === 12) return "12:00 PM";
                    return hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
                  }}
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
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center flex-col">
            <Clock className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
            <p className="text-muted-foreground text-sm">No time data yet</p>
            <p className="text-muted-foreground text-xs mt-1">
              Read more documents to see your reading schedule
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CategoryBreakDown;
