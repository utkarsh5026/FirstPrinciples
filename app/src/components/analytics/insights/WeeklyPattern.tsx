import React from "react";
import { Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";

interface WeekilyPatternProps {
  weeklyActivity: { day: string; count: number }[];
}

const WeekilyPattern: React.FC<WeekilyPatternProps> = ({ weeklyActivity }) => {
  return (
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
                formatter={(value: number) => [`${value} documents`, "Read"]}
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
  );
};

export default WeekilyPattern;
