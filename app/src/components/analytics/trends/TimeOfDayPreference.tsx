import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Line,
  CartesianGrid,
  LineChart,
} from "recharts";
import { Clock } from "lucide-react";
import { useReadingMetrics } from "@/context";

/**
 * 📅 TimeOfDay Component
 *
 * This component visualizes the user's reading activity throughout the day.
 * It provides a line chart representation of how many documents were read
 * during each hour, helping users identify their most active reading times. 📈✨
 *
 * If there are no reading activities recorded, it encourages users to read more
 * to uncover their time patterns. 📖💡
 *
 * The component also highlights the peak reading hour, making it easy for users
 * to see when they are most engaged. 🌟
 *
 */
const TimeOfDay: React.FC = () => {
  const { analyticsData } = useReadingMetrics();

  const peakHour = useMemo(() => {
    if (analyticsData.readingByHour.length === 0) return null;
    const peak = analyticsData.readingByHour.reduce(
      (max, hour) => (hour.count > max.count ? hour : max),
      analyticsData.readingByHour[0]
    );

    const determineDisplayHour = () => {
      if (peak.hour === 0) return 12;
      if (peak.hour > 12) return peak.hour - 12;
      return peak.hour;
    };

    const displayHour = determineDisplayHour();
    const period = peak.hour >= 12 ? "PM" : "AM";
    return { displayHour, period };
  }, [analyticsData.readingByHour]);

  return (
    <div className="space-y-2">
      <h5 className="text-xs uppercase text-muted-foreground font-medium">
        Time of Day Preference
      </h5>

      <div className="h-48">
        {analyticsData.readingByHour.some((item) => item.count > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={analyticsData.readingByHour}
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
        {peakHour
          ? `${peakHour.displayHour} ${peakHour.period}`
          : "No data yet"}
      </div>
    </div>
  );
};

export default TimeOfDay;
