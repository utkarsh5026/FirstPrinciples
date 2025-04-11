import { useTheme } from "@/components/theme/context/ThemeContext";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useReadingMetrics } from "@/context";
import { useMemo } from "react";

/**
 * 🕰️ TimeOfTheDay
 *
 * A beautiful visualization that shows when users prefer to read throughout the day!
 *
 * This chart breaks down reading activity into four time periods:
 * - 🌅 Morning (5am-12pm): Early bird reading sessions
 * - ☀️ Afternoon (12pm-5pm): Midday knowledge breaks
 * - 🌆 Evening (5pm-9pm): After-work unwinding with reading
 * - 🌙 Night (9pm-5am): Night owl reading habits
 *
 * The component uses color-coding to make each time period distinct and visually appealing,
 * with softer colors for daytime and deeper colors for evening/night reading.
 *
 * It analyzes the hourly reading data from analytics to generate meaningful insights
 * about user reading patterns throughout the day.
 */
const TimeOfTheDay = () => {
  const { currentTheme } = useTheme();
  const { analyticsData } = useReadingMetrics();

  /**
   * 📊 Processes hourly reading data into time-of-day categories
   *
   * Takes raw hourly reading data and transforms it into four meaningful
   * time periods that represent different parts of the day. Each category
   * gets its own distinctive color to create a visually appealing chart.
   */
  const timeOfDayData = useMemo(() => {
    const timeOfDayData = [
      { name: "Morning", count: 0, color: "#FFCB8E" },
      { name: "Afternoon", count: 0, color: "#FFE07D" },
      { name: "Evening", count: 0, color: "#B39DDB" },
      { name: "Night", count: 0, color: "#7986CB" },
    ];

    analyticsData.readingByHour.forEach(({ hour }) => {
      switch (true) {
        case hour >= 5 && hour < 12:
          timeOfDayData[0].count++;
          break;
        case hour >= 12 && hour < 17:
          timeOfDayData[1].count++;
          break;
        case hour >= 17 && hour < 21:
          timeOfDayData[2].count++;
          break;
        default:
          timeOfDayData[3].count++;
          break;
      }
    });

    return timeOfDayData;
  }, [analyticsData.readingByHour]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={timeOfDayData}
        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
      >
        <XAxis
          dataKey={(item) => item.name}
          tick={{ fill: currentTheme.foreground + "80" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: currentTheme.foreground + "80" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <RechartsTooltip
          cursor={{ fill: currentTheme.primary + "10" }}
          contentStyle={{
            backgroundColor: currentTheme.cardBg || "#ffffff",
            border: `1px solid ${currentTheme.border}`,
            borderRadius: "4px",
            color: currentTheme.foreground,
          }}
          formatter={(value) => [`${value} documents`, "Read"]}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {timeOfDayData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TimeOfTheDay;
