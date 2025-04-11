import React from "react";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";
import { useReadingMetrics } from "@/context";
import ChartsToolTip from "@/components/analytics/tooltip/ChartsToolTip";

/**
 * 🚀 ProgressOverTime Component
 *
 * This component visualizes the user's progress over time, providing a graphical representation
 * of their monthly reading activity. It aims to help users track their progress, identify patterns,
 * and stay motivated to read more. 📚💡
 *
 * If there's no data available, it encourages users to start reading to uncover their progress
 * patterns. 🚫
 */
const ProgressOverTime: React.FC = () => {
  const { monthlyData } = useReadingMetrics();

  if (monthlyData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center flex-col">
        <BarChart3 className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
        <p className="text-muted-foreground text-sm">No monthly data yet</p>
        <p className="text-muted-foreground text-xs mt-1">
          Read more documents to track your progress
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={monthlyData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
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
          <ChartsToolTip
            formatter={(value: number) => [`${value} documents`, "Read"]}
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
    </div>
  );
};

export default ProgressOverTime;
