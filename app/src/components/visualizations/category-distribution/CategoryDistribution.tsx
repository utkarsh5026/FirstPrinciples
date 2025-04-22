import { PieChart, BookOpen } from "lucide-react";
import CardContainer, {
  CardContainerInsight,
} from "@/components/container/CardContainer";
import CategoryDistributionPieChart from "./CategoryDistributionPieChart";
import { useCategoryMetrics, useDocumentList } from "@/hooks";
import { memo, useEffect, useMemo, useState } from "react";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import type { CategoryBreakdown } from "@/stores/categoryStore";

interface CategoryBreakDownProps {
  history: ReadingHistoryItem[];
  compact?: boolean;
}

const CategoryDistribution: React.FC<CategoryBreakDownProps> = memo(
  ({ history, compact = false }) => {
    const [categoryBreakdown, setCategoryBreakdown] = useState<
      CategoryBreakdown[]
    >([]);
    const { createCategoryBreakdown, calculateCategoryMetrics } =
      useCategoryMetrics();
    const { documents } = useDocumentList();

    useEffect(() => {
      createCategoryBreakdown(history, documents).then(setCategoryBreakdown);
    }, [history, createCategoryBreakdown, documents]);

    const metrics = useMemo(
      () => calculateCategoryMetrics(categoryBreakdown),
      [categoryBreakdown, calculateCategoryMetrics]
    );

    const insights: CardContainerInsight[] = [
      {
        label: "Total Categories",
        value: metrics?.totalCategories.toString() ?? "0",
        icon: BookOpen,
      },
      {
        label: "Most Read",
        value: metrics?.mostRead?.category ?? "None",
        icon: BookOpen,
        highlight: true,
      },
      {
        label: "Least Read",
        value: metrics?.leastRead?.category ?? "None",
        icon: BookOpen,
      },
      {
        label: "Reader Pattern",
        value: metrics?.readingPattern ?? "None",
        icon: BookOpen,
      },
    ];

    return (
      <CardContainer
        title="Categories Breakdown"
        icon={PieChart}
        insights={insights}
        description="What do you read the most? 🤔"
        variant="subtle"
        compact={compact}
      >
        <div className="h-56 w-full">
          <CategoryDistributionPieChart
            descriptive={false}
            categoryBreakdown={categoryBreakdown}
            categoryMetrics={metrics}
          />
        </div>
      </CardContainer>
    );
  }
);

export default CategoryDistribution;
