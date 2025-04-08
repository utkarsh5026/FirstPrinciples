import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { COLORS } from "../../utils";
import useMobile from "@/hooks/useMobile";
import { fromSnakeToTitleCase } from "@/utils/string";
import RadarChart from "./RadarChart";
import StatCard from "./StatCard";

interface CategoryRadarData {
  name: string;
  fullName?: string;
  value: number;
  totalValue: number;
  percentage: number;
  fillColor?: string;
}

interface CategoryCoverageMapProps {
  data: CategoryRadarData[];
  title?: string;
}

/**
 * 🌟 CategoryCoverageMap is a vibrant visualization tool that brings your category coverage to life!
 * It creates a stunning radar/spider chart that allows users to easily see how well they are doing across different categories.
 * Each category shines as an axis, with the distance from the center representing reading completion.
 * 📊 This component is perfect for quickly grasping your strengths and areas that need a little extra love! 💖
 */
const CategoryCoverageMap: React.FC<CategoryCoverageMapProps> = ({
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
        name: fromSnakeToTitleCase(item.name),
        fullName: item.fullName
          ? fromSnakeToTitleCase(item.fullName)
          : undefined,
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
            <RadarChart chartData={chartData} />
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              title="Average Coverage"
              value={`${Math.round(averageCoverage)}%`}
            />

            {topCategory && (
              <StatCard
                title="Top Category"
                value={topCategory.name}
                footer={`${Math.round(topCategory.percentage)}% complete`}
              />
            )}

            {weakestCategory && (
              <StatCard
                title="Needs Attention"
                value={fromSnakeToTitleCase(weakestCategory.name)}
                footer={`${Math.round(weakestCategory.percentage)}% complete`}
              />
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

export default CategoryCoverageMap;
