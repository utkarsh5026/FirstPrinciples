import { useTheme } from "@/hooks/ui/use-theme";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import ChartContainer from "@/components/chart/ChartContainer";
import {
  ChartContainer as ChartContainerUI,
  ChartTooltip,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { generateThemeColors } from "@/utils/colors";
import { Book, TrendingUp } from "lucide-react";
import useChartTooltip from "@/components/chart/tooltip/use-chart-tooltip";
import { fromSnakeToTitleCase } from "@/utils/string";
import { cn } from "@/lib/utils";

type TimeOfDayData = {
  period: string;
  count: number;
  range: number[];
  render: {
    icon: React.ElementType;
    textcolorClass: string;
  };
};
interface TimeOfTheDayProps {
  periodData: TimeOfDayData[];
}

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
const TimeOfTheDay: React.FC<TimeOfTheDayProps> = ({ periodData }) => {
  const { currentTheme } = useTheme();

  /**
   * 📊 Processes hourly reading data into time-of-day categories
   *
   * Takes raw hourly reading data and transforms it into four meaningful
   * time periods that represent different parts of the day. Each category
   * gets its own distinctive color to create a visually appealing chart.
   */
  const timeOfDayData = useMemo(() => {
    const colors = generateThemeColors(currentTheme.primary, 4);
    return periodData.map((period, index) => ({
      ...period,
      color: colors[index],
    }));
  }, [periodData, currentTheme.primary]);

  const peak =
    timeOfDayData.length > 0
      ? timeOfDayData.reduce((acc, curr) => {
          return acc.count > curr.count ? acc : curr;
        }, timeOfDayData[0])
      : null;

  const renderTooltip = useChartTooltip<TimeOfDayData>({
    getTitle: (data) => {
      const formattedRange = data.range.map((range: number) => {
        if (range <= 12) return `${range} AM`;
        if (range > 12) return `${range - 12} PM`;
      });

      return (
        <div className="flex items-center gap-2">
          <data.render.icon
            className={cn("w-4 h-4", data.render.textcolorClass)}
          />
          {fromSnakeToTitleCase(data.period)}
          <span className="text-xs text-muted-foreground">
            {formattedRange[0]} - {formattedRange[1]}
          </span>
        </div>
      );
    },
    getSections: (data) => [
      { label: "Documents read", value: data.count },
      {
        label: "Percentage of total reading",
        value: `${(
          (data.count /
            timeOfDayData.reduce((acc, curr) => acc + curr.count, 0)) *
          100
        ).toFixed(2)}%`,
      },
    ],
    getFooter: (data) => {
      return data.period === peak?.period
        ? {
            message: "Peak reading time",
            icon: TrendingUp,
            className: "text-green-400",
          }
        : undefined;
    },
  });

  return (
    <ChartContainer
      left={{
        icon: peak?.render.icon,
        label: "Peak: ",
        value: peak?.period ?? "None",
        className: peak?.render.textcolorClass,
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
            content={renderTooltip}
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
            dataKey="period"
            tick={{ fill: currentTheme.foreground + "80" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => fromSnakeToTitleCase(value)}
          />
          <Bar dataKey="count" radius={5}>
            {timeOfDayData.map((entry) => (
              <Cell key={entry.period} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainerUI>
    </ChartContainer>
  );
};

export default TimeOfTheDay;
