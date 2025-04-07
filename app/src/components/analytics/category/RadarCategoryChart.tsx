import React, { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { COLORS } from "../utils";
import useMobile from "@/hooks/useMobile";

interface CategoryRadarData {
  name: string;
  fullName?: string;
  value: number;
  totalValue: number;
  percentage: number;
  fillColor?: string;
}

interface RadarCategoryChartProps {
  data: CategoryRadarData[];
  title?: string;
}

/**
 * RadarCategoryChart creates a radar/spider chart visualization of category coverage.
 * Each category is represented as an axis, with distance from center showing reading completion.
 */
const RadarCategoryChart: React.FC<RadarCategoryChartProps> = ({
  data,
  title = "Category Coverage",
}) => {
  const { isMobile } = useMobile();

  const { topCategory, weakestCategory, averageCoverage, chartData } =
    useMemo(() => {
      const topCategory =
        data.length > 0
          ? data.reduce(
              (max, item) => (item.percentage > max.percentage ? item : max),
              data[0]
            )
          : null;

      const weakestCategory =
        data.length > 0
          ? data.reduce(
              (min, item) => (item.percentage < min.percentage ? item : min),
              data[0]
            )
          : null;

      const averageCoverage =
        data.reduce((sum, item) => sum + item.percentage, 0) /
        Math.max(data.length, 1);

      const chartData = data.map((item, index) => ({
        ...item,
        value: item.percentage,
        fillColor: COLORS[index % COLORS.length],
      }));

      return { topCategory, weakestCategory, averageCoverage, chartData };
    }, [data]);

  return (
    <Card className="p-4 border-primary/10 rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium flex items-center">
          <Target className="h-4 w-4 mr-2 text-primary" />
          {title}
        </h4>
        <Badge variant="outline" className="text-xs">
          {data.length} Categories
        </Badge>
      </div>

      {data.length > 0 ? (
        <div className="space-y-4">
          <div className={isMobile ? "h-64" : "h-80"}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid strokeDasharray="3 3" stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: isMobile ? 10 : 12,
                  }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "var(--muted-foreground)" }}
                  tickCount={5}
                  stroke="var(--border)"
                />
                <RechartsTooltip
                  formatter={(
                    value: number,
                    _name: string,
                    props: {
                      payload?: {
                        name: string;
                        fullName?: string;
                        value: number;
                        totalValue: number;
                      };
                    }
                  ) => {
                    const item = props.payload;
                    if (!item) return ["N/A", "Unknown"];
                    return [
                      `${Math.round(value)}% Complete (${item.value}/${
                        item.totalValue
                      })`,
                      item.fullName ?? item.name,
                    ];
                  }}
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    border: "1px solid #333",
                    borderRadius: "4px",
                  }}
                />
                <Radar
                  name="Coverage"
                  dataKey="value"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.4}
                  activeDot={{
                    r: 8,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary/10 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">
                Average Coverage
              </div>
              <div className="text-xl font-bold mt-1">
                {Math.round(averageCoverage)}%
              </div>
            </div>

            {topCategory && (
              <div className="bg-secondary/10 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">
                  Top Category
                </div>
                <div className="text-lg font-bold mt-1 truncate">
                  {topCategory.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(topCategory.percentage)}% complete
                </div>
              </div>
            )}

            {weakestCategory && (
              <div className="bg-secondary/10 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">
                  Needs Attention
                </div>
                <div className="text-lg font-bold mt-1 truncate">
                  {weakestCategory.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(weakestCategory.percentage)}% complete
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <Target className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>No category data available</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RadarCategoryChart;
