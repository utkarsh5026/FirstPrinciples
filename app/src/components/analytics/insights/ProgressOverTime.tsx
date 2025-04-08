import React from "react";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";

interface ProgressOverTimeProps {
  monthlyReadingData: { name: string; count: number }[];
}

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
const ProgressOverTime: React.FC<ProgressOverTimeProps> = ({
  monthlyReadingData,
}) => {
  return (
    <div className="mt-6 pt-6 border-t border-border/40">
      <h5 className="text-xs uppercase text-muted-foreground font-medium mb-3">
        Progress Over Time
      </h5>

      <div className="h-64">
        {monthlyReadingData.some((month) => month.count > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyReadingData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
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
              <RechartsTooltip
                formatter={(value: number) => [`${value} documents`, "Read"]}
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
                fill="url(#colorReading)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center flex-col">
            <BarChart3 className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
            <p className="text-muted-foreground text-sm">No monthly data yet</p>
            <p className="text-muted-foreground text-xs mt-1">
              Read more documents to track your progress
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressOverTime;
