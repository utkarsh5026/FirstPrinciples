import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LineChart } from "lucide-react";
import { useState, memo } from "react";

type Period = "week" | "month" | "all";

interface ReadingTrendsProps {
  weeklyActivity: { name: string; count: number }[];
  monthlyReadingData: { name: string; count: number }[];
}

const ReadingTrends: React.FC<ReadingTrendsProps> = memo(
  ({ weeklyActivity, monthlyReadingData }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>("week");
    return (
      <Card className="p-4 border-primary/10 rounded-2xl">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium flex items-center">
            <LineChart className="h-4 w-4 mr-2 text-primary" />
            Reading Trends
          </h4>
          <div className="flex bg-secondary/20 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 text-xs rounded-md",
                selectedPeriod === "week" && "bg-card"
              )}
              onClick={() => setSelectedPeriod("week")}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 text-xs rounded-md",
                selectedPeriod === "month" && "bg-card"
              )}
              onClick={() => setSelectedPeriod("month")}
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 text-xs rounded-md",
                selectedPeriod === "all" && "bg-card"
              )}
              onClick={() => setSelectedPeriod("all")}
            >
              All
            </Button>
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={
                selectedPeriod === "week" ? weeklyActivity : monthlyReadingData
              }
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
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
                labelStyle={{ color: "#888" }}
                contentStyle={{
                  backgroundColor: "rgba(22, 22, 22, 0.9)",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
                name="Documents Read"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  }
);

export default ReadingTrends;
