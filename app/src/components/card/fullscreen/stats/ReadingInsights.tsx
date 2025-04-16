import { Info, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface ReadingInsightsProps {
  timeSpentBySection: Array<{
    sectionTitle: string;
    minutes: number;
    wordCount: number;
  }>;
}

const ReadingInsights: React.FC<ReadingInsightsProps> = ({
  timeSpentBySection,
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3 flex items-center">
        <Clock className="h-4 w-4 text-primary mr-2" />
        Time Spent by Section
      </h3>

      <div
        className={cn(
          "bg-secondary/5 border border-border/20 rounded-lg p-4",
          "h-64 sm:h-72"
        )}
      >
        {timeSpentBySection.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timeSpentBySection}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="sectionTitle"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                dy={10}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={40}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "minutes")
                    return [`${value} minutes`, "Time Spent"];
                  return [`${value} words`, "Word Count"];
                }}
                labelFormatter={(value) => `Section: ${value}`}
              />
              <Bar
                name="minutes"
                dataKey="minutes"
                radius={[4, 4, 0, 0]}
                fill="var(--primary)"
                fillOpacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Info className="h-8 w-8 mb-2 text-primary/30" />
            <p>Start reading to see time data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingInsights;
