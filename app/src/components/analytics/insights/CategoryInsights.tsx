import { CategoryPieChart } from "@/components/insights";
import { BookOpen } from "lucide-react";
import { memo, useMemo } from "react";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import InsightCard from "./InsightCard";
import { useCategoryStore } from "@/stores/categoryStore";

interface CategoryDistributionInsightCardProps {
  history: ReadingHistoryItem[];
}

/**
 * 📊 CategoryDistributionInsightCard
 *
 * A delightful visualization of your reading categories! ✨
 * Shows which topics you love to read the most and how diverse
 * your reading habits are across different categories.
 *
 * Features:
 * - 🍩 Beautiful pie chart showing category distribution
 * - 🏆 Highlights your favorite reading category
 * - 🌈 Color-coded with pretty gradients based on your diversity
 * - 📚 Counts how many different categories you've explored
 */
const CategoryDistributionInsightCard: React.FC<CategoryDistributionInsightCardProps> =
  memo(({ history }) => {
    const createCategoryBreakdown = useCategoryStore(
      (state) => state.createCategoryBreakdown
    );

    /**
     * 🔍 Discovers your favorite category and counts how many you've explored!
     */
    const { topCategory, categoriesCount } = useMemo(() => {
      const categoryBreakDown = createCategoryBreakdown(history);
      const topCategory = categoryBreakDown.find(
        (category) =>
          category.count === Math.max(...categoryBreakDown.map((c) => c.count))
      );
      return {
        topCategory: topCategory?.category,
        categoriesCount: categoryBreakDown.length,
      };
    }, [history, createCategoryBreakdown]);

    /**
     * 🎨 Creates beautiful color themes based on your reading diversity!
     * More categories = violet, fewer categories = amber! ✨
     */
    const getCategoryStyles = (categoryCount: number) => {
      if (categoryCount > 3) {
        return {
          gradient: "from-violet-500/5 to-violet-500/10",
          iconColor: "text-violet-500",
        };
      }
      return {
        gradient: "from-amber-500/5 to-amber-500/10",
        iconColor: "text-amber-500",
      };
    };

    const { gradient, iconColor } = getCategoryStyles(categoriesCount);

    const insights = topCategory
      ? [
          { label: "Top category", value: topCategory, highlight: true },
          { label: "Categories explored", value: categoriesCount.toString() },
        ]
      : [];

    return (
      <InsightCard
        title="Category Distribution"
        description="How your reading is distributed across categories"
        icon={BookOpen}
        insights={insights}
        gradient={gradient}
        iconColor={iconColor}
        delay={0.3}
      >
        <div className="h-52 w-full">
          <CategoryPieChart showLegend={true} />
        </div>
      </InsightCard>
    );
  });

export default CategoryDistributionInsightCard;
