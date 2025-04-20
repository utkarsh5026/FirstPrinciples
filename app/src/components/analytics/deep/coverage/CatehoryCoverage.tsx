import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Target, PieChart } from "lucide-react";
import useMobile from "@/hooks/device/use-mobile";
import getIconForTech from "@/components/icons";
import StatCard from "./StatCard";
import CategoryRadarChart from "@/components/insights/RadarChart";
import { useHistoryStore, useDocumentStore } from "@/stores";
import CardContainer from "@/components/container/CardContainer";

interface CategoryCoverageMapProps {
  compact: boolean;
}

/**
 * 🌟 CategoryCoverageMap is a vibrant visualization tool that brings your category coverage to life!
 * It creates a stunning radar/spider chart that allows users to easily see how well they are doing across different categories.
 * Each category shines as an axis, with the distance from the center representing reading completion.
 * 📊 This component is perfect for quickly grasping your strengths and areas that need a little extra love! 💖
 */
const CategoryCoverageMap: React.FC<CategoryCoverageMapProps> = ({
  compact = false,
}) => {
  const { isMobile } = useMobile();
  const availableDocuments = useDocumentStore(
    (state) => state.availableDocuments
  );
  const readingHistory = useHistoryStore((state) => state.readingHistory);

  /* 
  🎯 Creates data for the radar visualization showing your category coverage
  */
  const radarData = useMemo(() => {
    const categoryMap = new Map<string, { read: number; total: number }>();

    availableDocuments.forEach((doc) => {
      const category = doc.path.split("/")[0];
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { read: 0, total: 0 });
      }
      const current = categoryMap.get(category)!;
      categoryMap.set(category, { ...current, total: current.total + 1 });
    });

    readingHistory.forEach((item) => {
      const category = item.path.split("/")[0];
      if (categoryMap.has(category)) {
        const current = categoryMap.get(category)!;
        const uniqueReads = new Set(
          readingHistory
            .filter((h) => h.path.startsWith(category))
            .map((h) => h.path)
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
  }, [availableDocuments, readingHistory, isMobile]);

  const { topCategory, weakestCategory, averageCoverage, totalCategories } =
    useMemo(() => {
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

  const TopCategoryIcon = topCategory ? getIconForTech(topCategory.name) : null;
  const WeakestCategoryIcon = weakestCategory
    ? getIconForTech(weakestCategory.name)
    : null;

  return (
    <CardContainer
      title="Category Coverage Map"
      icon={PieChart}
      variant="subtle"
      description="See the coverage of your Reading Journey 😊"
      headerAction={
        <Badge variant="outline" className="text-xs font-normal">
          {totalCategories} {totalCategories === 1 ? "Category" : "Categories"}
        </Badge>
      }
      baseColor="pink"
    >
      <div className="p-4 space-y-4">
        {radarData.length > 0 ? (
          <div className="space-y-4">
            <motion.div
              className={isMobile ? "h-64" : "h-80"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CategoryRadarChart radarData={radarData} />
            </motion.div>

            {!compact && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-20">
                <StatCard
                  title="Average Coverage"
                  value={`${Math.round(averageCoverage)}%`}
                  footer={`Across ${totalCategories} ${
                    totalCategories === 1 ? "category" : "categories"
                  }`}
                  icon={<Target className="h-4 w-4 text-primary/80" />}
                />

                {topCategory && (
                  <StatCard
                    title="Top Category"
                    value={topCategory.name}
                    footer={`${Math.round(topCategory.percentage)}% complete`}
                    icon={
                      TopCategoryIcon ? (
                        <TopCategoryIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      )
                    }
                    highlight={true}
                  />
                )}

                {weakestCategory && (
                  <StatCard
                    title="Needs Attention"
                    value={weakestCategory.name}
                    footer={`${Math.round(
                      weakestCategory.percentage
                    )}% complete`}
                    icon={
                      WeakestCategoryIcon ? (
                        <WeakestCategoryIcon className="h-4 w-4 text-amber-500" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                      )
                    }
                  />
                )}
              </div>
            )}
          </div>
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
