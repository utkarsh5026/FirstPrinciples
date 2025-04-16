import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
} from "recharts";
import { cn } from "@/lib/utils";
import { BarChart2 } from "lucide-react";

interface ReadingSpeedCurveProps {
  readingCurve: { index: number; wpm: number }[];
}

const ReadingSpeedCurve: React.FC<ReadingSpeedCurveProps> = ({
  readingCurve,
}) => {
  return (
    <div className="my-8">
      <h3 className="text-sm font-medium mb-3 flex items-center font-cascadia-code">
        <BarChart2 className="h-4 w-4 text-primary mr-2" />
        Reading Speed Pattern
      </h3>

      <div
        className={cn(
          "bg-secondary/5 border border-border/20 rounded-lg p-4",
          "h-56 transition-all hover:shadow-md hover:border-border/40"
        )}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={readingCurve}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
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
              vertical={false}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth={0.8}
            />
            <XAxis
              dataKey="index"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              label={{
                value: "Section Number",
                position: "bottom",
                fontSize: 11,
                fill: "var(--muted-foreground)",
                fontFamily: "Cascadia Code",
                dy: 10,
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={40}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={(value) => `${value}`}
              label={{
                value: "(W P M)",
                angle: -90,
                position: "insideLeft",
                fontSize: 11,
                fill: "var(--muted-foreground)",
                fontFamily: "Cascadia Code",
                dx: -15,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "Cascadia Code",
                padding: "8px 12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number) => [
                <span style={{ color: "var(--primary)", fontWeight: "bold" }}>
                  {value} WPM
                </span>,
                "Reading Speed",
              ]}
              labelFormatter={(value) => `Section ${value}`}
              animationDuration={200}
            />
            <Area
              type="monotone"
              dataKey="wpm"
              stroke="none"
              fillOpacity={1}
              fill="url(#colorWpm)"
            />
            <Line
              type="natural"
              dataKey="wpm"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={{
                fill: "var(--background)",
                r: 4,
                strokeWidth: 2,
                stroke: "var(--primary)",
              }}
              activeDot={{
                fill: "var(--background)",
                r: 6,
                strokeWidth: 2.5,
                stroke: "var(--primary)",
                strokeOpacity: 0.9,
              }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReadingSpeedCurve;
