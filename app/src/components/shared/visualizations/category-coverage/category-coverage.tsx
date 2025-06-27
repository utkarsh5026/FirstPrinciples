import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { PieChart, Award, AlertCircle } from "lucide-react";
import useMobile from "@/hooks/device/use-mobile";
import getIconForTech from "@/components/shared/icons";
import CategoryRadarChart from "./category-radar-chart";
import CardContainer from "@/components/shared/container/CardContainer";
import { fromSnakeToTitleCase } from "@/utils/string";
import { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import { useDocumentList } from "@/hooks";

interface CategoryCoverageMapProps {
  history: ReadingHistoryItem[];
}

/**
 * 🌟 CategoryCoverageMap is a vibrant visualization tool that brings your category coverage to life!
 * It creates a stunning radar/spider chart that allows users to easily see how well they are doing across different categories.
 * Each category shines as an axis, with the distance from the center representing reading completion.
 * 📊 This component is perfect for quickly grasping your strengths and areas that need a little extra love! 💖
 */
const CategoryCoverageMap: React.FC<CategoryCoverageMapProps> = ({
  history,
}) => {
  const { isMobile } = useMobile();
  const { documents } = useDocumentList();

  /* 
  🎯 Creates data for the radar visualization showing your category coverage
  */
  const radarData = useMemo(() => {
    const categoryMap = new Map<string, { read: number; total: number }>();

    documents.forEach((doc) => {
      const category = doc.path.split("/")[0];
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { read: 0, total: 0 });
      }
      const current = categoryMap.get(category)!;
      categoryMap.set(category, { ...current, total: current.total + 1 });
    });

    history.forEach((item) => {
      const category = item.path.split("/")[0];
      if (categoryMap.has(category)) {
        const current = categoryMap.get(category)!;
        const uniqueReads = new Set(
          history.filter((h) => h.path.startsWith(category)).map((h) => h.path)
        ).size;
        categoryMap.set(category, { ...current, read: uniqueReads });
      }
    });

    const chartData = Array.from(categoryMap.entries())
      .map(([name, { read, total }]) => ({
        name,
        fullName: name,
        value: read,
        totalValue: total,
        percentage: total > 0 ? (read / total) * 100 : 0,
      }))
      .filter((item) => item.totalValue > 0)
      .sort((a, b) => b.percentage - a.percentage);

    return chartData.map((item) => ({
      ...item,
      value: item.percentage,
      displayName: item.fullName ?? item.name,
      shortName: item.name.substring(0, isMobile ? 1 : 3).toUpperCase(),
    }));
  }, [documents, history, isMobile]);

  const { topCategory, weakestCategory, totalCategories } = useMemo(() => {
    const topCategory =
      radarData.length > 0
        ? radarData.reduce(
            (max, item) => (item.percentage > max.percentage ? item : max),
            radarData[0]
          )
        : null;

    const weakestCategory =
      radarData.length > 0
        ? radarData.reduce(
            (min, item) => (item.percentage < min.percentage ? item : min),
            radarData[0]
          )
        : null;

    const averageCoverage =
      radarData.reduce((sum, item) => sum + item.percentage, 0) /
      Math.max(radarData.length, 1);

    const totalCategories = radarData.length;

    return { topCategory, weakestCategory, averageCoverage, totalCategories };
  }, [radarData]);

  const TopCategoryIcon = topCategory
    ? getIconForTech(topCategory.name) || Award
    : Award;
  const WeakestCategoryIcon = weakestCategory
    ? getIconForTech(weakestCategory.name) || AlertCircle
    : AlertCircle;

  return (
    <CardContainer
      title="Category Coverage Map"
      icon={PieChart}
      variant="subtle"
      description="See the coverage of your Reading Journey 😊"
      headerAction={
        <Badge variant="outline" className="text-xs font-normal rounded-full">
          {totalCategories} {totalCategories === 1 ? "Category" : "Categories"}
        </Badge>
      }
      insights={[
        {
          label: "Top Category",
          value: fromSnakeToTitleCase(topCategory?.name ?? ""),
          icon: TopCategoryIcon,
          highlight: true,
        },
        {
          label: "Weakest Category",
          value: fromSnakeToTitleCase(weakestCategory?.name ?? ""),
          icon: WeakestCategoryIcon,
        },
      ]}
      baseColor="pink"
    >
      <div className="p-4 space-y-4">
        {radarData.length > 0 ? (
          <CategoryRadarChart radarData={radarData} />
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PieChart className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No category data available</p>
              <p className="text-xs mt-2">
                Start reading to build your coverage map
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </CardContainer>
  );
};

export default CategoryCoverageMap;
