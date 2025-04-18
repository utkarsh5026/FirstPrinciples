import { Info, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
      <h3 className="text-sm font-medium mb-3 flex items-center font-cascadia-code">
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
          <ChartContainer config={{}} className="h-full w-full">
            <BarChart
              data={timeSpentBySection}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <ChartTooltip
                content={<ChartTooltipContent className="font-cascadia-code" />}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                type="number"
                tick={{
                  fontSize: 12,
                  fill: "var(--muted-foreground)",
                  fontFamily: "Cascadia Code",
                }}
                tickFormatter={(value) => `${value}m`}
              />
              <YAxis
                type="category"
                dataKey="sectionTitle"
                width={100}
                tick={{
                  fontSize: 12,
                  fill: "var(--muted-foreground)",
                  fontFamily: "Cascadia Code",
                }}
                tickMargin={10}
              />
              <Bar
                name="minutes"
                dataKey="minutes"
                radius={5}
                fill="var(--primary)"
                fillOpacity={0.8}
              />
            </BarChart>
          </ChartContainer>
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
