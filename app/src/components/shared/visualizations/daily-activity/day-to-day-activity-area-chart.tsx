import { memo } from "react";
import { Calendar, ArrowUp, ArrowDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import ChartContainer from "@/components/shared/chart/chart-container";
import {
  ChartContainer as ChartContainerUI,
  ChartTooltip,
} from "@/components/ui/chart";

import { motion } from "framer-motion";
import { useTheme } from "@/hooks/ui/use-theme";
import { cn } from "@/lib/utils";
import useMobile from "@/hooks/device/use-mobile";
import useChartTooltip from "@/components/shared/chart/tooltip/use-chart-tooltip";

interface DaytoDayActivityAreaChartProps {
  data: {
    isPeak: boolean;
    isSpecialDay: boolean;
    comparedToAvg: number;
    day: number;
    count: number;
  }[];
}

/**
 * 📅 DayOfMonthActivityInsight
 *
 * A beautiful visualization showing which days of the month
 * you prefer for reading! Are you an early-month reader,
 * mid-month enthusiast, or end-of-month crammer?
 *
 * This component analyzes your reading patterns across monthly cycles
 * and highlights your most active days.
 */
const DaytoDayActivityAreaChart: React.FC<DaytoDayActivityAreaChartProps> =
  memo(({ data }) => {
    const { currentTheme } = useTheme();
    const { isMobile } = useMobile();

    const average =
      data.reduce((acc, curr) => acc + curr.count, 0) / data.length;

    // Replace custom tooltip with useChartTooltip
    const renderTooltip = useChartTooltip({
      icon: Calendar,
      getTitle: (data) => {
        return (
          <div className="flex items-center">
            <span>Day {data.day}</span>
            {data.isPeak && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                Peak
              </span>
            )}
          </div>
        );
      },
      getSections: (data) => [
        {
          label: "Documents read:",
          value: data.count,
          highlight: true,
        },
        ...(data.comparedToAvg !== 0
          ? [
              {
                label: "Compared to average:",
                value: (
                  <span
                    className={cn(
                      "font-medium flex items-center",
                      data.comparedToAvg > 0 ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {data.comparedToAvg > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(data.comparedToAvg)}%
                  </span>
                ),
              },
            ]
          : []),
      ],
      className: "bg-popover/95 backdrop-blur-sm",
    });

    if (!data.length) {
      return (
        <motion.div
          className="h-full flex items-center justify-center flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Calendar className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
          <p className="text-sm text-muted-foreground">No monthly data yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Read more documents to reveal your monthly patterns
          </p>
        </motion.div>
      );
    }

    return (
      <ChartContainer>
        <ChartContainerUI config={{}} className="h-full w-full">
          <AreaChart
            data={data}
            margin={{ top: 15, right: 5, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={currentTheme.border || "#333"}
              opacity={0.15}
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tick={{
                fill: currentTheme.foreground + "80",
                fontSize: 10,
              }}
              axisLine={false}
              tickLine={true}
              interval={isMobile ? 4 : 2}
              padding={{ left: 10, right: 10 }}
            />

            <YAxis
              tick={{
                fill: currentTheme.foreground + "80",
                fontSize: 10,
              }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={25}
            />

            <ChartTooltip
              content={renderTooltip}
              cursor={{
                stroke: currentTheme.primary,
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
            />

            {/* Average reading reference line */}
            <ReferenceLine
              y={average}
              stroke={currentTheme.foreground}
              strokeDasharray="3 3"
              label={{
                value: "Avg",
                position: "right",
                fill: currentTheme.foreground,
                fontSize: 18,
              }}
              strokeOpacity={0.4}
            />

            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={currentTheme.primary}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={currentTheme.primary}
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>

            <Area
              type="monotone"
              dataKey="count"
              stroke={currentTheme.primary}
              strokeWidth={2}
              fill="url(#colorCount)"
              animationDuration={1500}
              animationBegin={200}
              dot={(props) => {
                const { cx, cy, payload } = props;
                return payload.isPeak ? (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={currentTheme.background}
                    stroke={currentTheme.primary}
                    strokeWidth={2}
                  />
                ) : (
                  <></>
                );
              }}
            />
          </AreaChart>
        </ChartContainerUI>
      </ChartContainer>
    );
  });

export default DaytoDayActivityAreaChart;
