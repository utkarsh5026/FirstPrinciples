import { useTheme } from "@/components/theme/context/ThemeContext";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import ChartContainer from "../chart/ChartContainer";
import {
  ChartContainer as ChartContainerUI,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { useActivityStore } from "@/stores";
import { useMemo } from "react";
import { generateThemeColors } from "@/utils/colors";
import { Book, Clock } from "lucide-react";

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
const TimeOfTheDay: React.FC = () => {
  const { currentTheme } = useTheme();
  const analyticsData = useActivityStore((state) => state.totalReadingByHour);

  /**
   * 📊 Processes hourly reading data into time-of-day categories
   *
   * Takes raw hourly reading data and transforms it into four meaningful
   * time periods that represent different parts of the day. Each category
   * gets its own distinctive color to create a visually appealing chart.
   */
  const timeOfDayData = useMemo(() => {
    const colors = generateThemeColors(currentTheme.primary, 4);
    const timeOfDayData = [
      { name: "Morning", count: 0, color: colors[0] },
      { name: "Afternoon", count: 0, color: colors[1] },
      { name: "Evening", count: 0, color: colors[2] },
      { name: "Night", count: 0, color: colors[3] },
    ];

    analyticsData.forEach(({ hour }) => {
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
  }, [analyticsData, currentTheme.primary]);

  const peak = timeOfDayData.reduce((acc, curr) => {
    return acc.count > curr.count ? acc : curr;
  }, timeOfDayData[0]);

  return (
    <ChartContainer
      left={{
        icon: Clock,
        label: "Peak: ",
        value: peak.name ?? "None",
      }}
      right={{
        icon: Book,
        value: `${timeOfDayData.reduce(
          (acc, curr) => acc + curr.count,
          0
        )} documents`,
      }}
    >
      <ChartContainerUI config={{}} className="h-full w-full">
        <BarChart
          data={timeOfDayData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
        >
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(value) => [`${value} documents`, "Read"]}
          />
          <XAxis
            type="number"
            tick={{ fill: currentTheme.foreground + "80" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: currentTheme.foreground + "80" }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="count" radius={5}>
            {timeOfDayData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainerUI>
    </ChartContainer>
  );
};

export default TimeOfTheDay;
