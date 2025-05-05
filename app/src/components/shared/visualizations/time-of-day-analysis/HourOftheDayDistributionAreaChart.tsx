import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import {
  ChartContainer as ChartContainerUI,
  ChartTooltip,
} from "@/components/ui/chart";
import ChartContainer from "@/components/shared/chart/ChartContainer";
import { Clock, Clipboard, Book } from "lucide-react";
import { motion } from "framer-motion";
import type { HourlyActivity } from "@/services/analytics/activity-analyzer";
import { fromSnakeToTitleCase } from "@/utils/string";
import useChartTooltip from "@/components/shared/chart/tooltip/use-chart-tooltip";

type RenderHourData = HourlyActivity & {
  period: string;
  icon: React.ElementType;
  textcolorClass: string;
  formmattedTime: string;
  comparedToAverage: number;
};

interface TimeOfDayPreferenceProps {
  metrics: {
    totalReadings: number;
    peak: RenderHourData;
    preferredPeriod: {
      period: string;
      count: number;
    };
  } | null;

  periodData: {
    period: string;
    count: number;
    range: number[];
    render: {
      icon: React.ElementType;
      textcolorClass: string;
    };
  }[];

  readingByHour: RenderHourData[];
}

/**
 * 📅 TimeOfDayPreference Component
 *
 * This component visualizes the user's reading activity throughout the day with a beautiful
 * and informative chart. It helps users understand when they typically read and identify
 * their peak reading hours for optimal productivity. 📈✨
 *
 * Key features:
 * - Smooth gradient area chart showing reading intensity by hour
 * - Time period indicators (morning, afternoon, evening, night)
 * - Peak reading time highlight with visual indicators
 * - Detailed tooltips with time context
 * - Responsive design for both mobile and desktop
 * - Empty state with helpful prompts
 */
const TimeOfDayPreference: React.FC<TimeOfDayPreferenceProps> = ({
  metrics,
  periodData,
  readingByHour,
}) => {
  const renderTooltip = useChartTooltip<RenderHourData>({
    getTitle: (data) => {
      const period = periodData.find((p) => p.period === data.period);
      const periodColor = period?.render.textcolorClass;
      const timePeriod = period?.period;

      return (
        <div className="text-sm font-medium flex items-center">
          {period?.render.icon && (
            <period.render.icon className="w-4 h-4 mr-2" />
          )}
          <span className={periodColor}>
            {fromSnakeToTitleCase(timePeriod ?? "")}
          </span>
          <span className="mx-1 opacity-60">·</span>
          <span>{data.formmattedTime}</span>
        </div>
      );
    },
    getSections: (data) => {
      const percentage = data.comparedToAverage * 100;

      return [
        { label: "Documents read:", value: data.count, highlight: true },
        { label: "Percent of total:", value: `${percentage.toFixed(2)}%` },
      ];
    },
    getFooter: (data) => {
      if (metrics?.peak.hour === data.hour) {
        return {
          message: "Peak reading hour",
          icon: Clipboard,
          className: "text-green-400",
        };
      }
      return undefined;
    },
    className: "bg-popover/95 backdrop-blur-sm",
  });

  // If there's no data, show an empty state
  if (!metrics?.totalReadings) {
    return (
      <motion.div
        className="h-full flex items-center justify-center flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Clock className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
        <p className="text-sm text-muted-foreground">No time data yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Read more documents to reveal your time preferences
        </p>
      </motion.div>
    );
  }

  const left = {
    icon: metrics?.peak.icon,
    label: "Peak: ",
    value: metrics?.peak.hour.toString() ?? "None",
    className: metrics?.peak.textcolorClass,
  };

  const right = {
    icon: Book,
    value: `${fromSnakeToTitleCase(metrics.preferredPeriod.period)}`,
  };

  return (
    <ChartContainer left={left} right={right}>
      <ChartContainerUI config={{}} className="h-full w-full">
        <AreaChart
          data={readingByHour}
          margin={{ top: 10, right: 0, bottom: 0, left: 0 }}
        >
          <ChartTooltip content={renderTooltip} />
          <defs>
            <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.5}
            vertical={false}
          />

          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickFormatter={(hour) => {
              if (hour % 4 === 0) {
                if (hour === 0) return "12am";
                if (hour === 12) return "12pm";
                return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
              }
              return "";
            }}
            axisLine={{ stroke: "var(--border)", opacity: 0.2 }}
            tickLine={false}
            padding={{ left: 10, right: 10 }}
          />

          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            width={25}
          />

          {metrics && (
            <ReferenceLine
              x={metrics?.peak.hour}
              stroke="var(--primary)"
              strokeDasharray="3 3"
              strokeOpacity={0.7}
            />
          )}

          {/* Time period labels */}
          {readingByHour.map((item) => {
            if (item.hour % 6 === 0) {
              return (
                <ReferenceLine
                  key={item.hour}
                  x={item.hour}
                  stroke="var(--border)"
                  strokeOpacity={0.2}
                  label={{
                    value: item.period,
                    position: "insideTopLeft",
                    fill: "var(--muted-foreground)",
                    fontSize: 9,
                    offset: 10,
                  }}
                />
              );
            }
            return null;
          })}

          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--primary)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#timeGradient)"
            animationDuration={1000}
            animationBegin={300}
            dot={{
              r: 3,
              strokeWidth: 1,
              fill: "var(--background)",
              stroke: "var(--primary)",
            }}
            activeDot={{
              r: 5,
              strokeWidth: 1,
              fill: "var(--primary)",
              stroke: "var(--background)",
            }}
          />
        </AreaChart>
      </ChartContainerUI>
    </ChartContainer>
  );
};

export default TimeOfDayPreference;
