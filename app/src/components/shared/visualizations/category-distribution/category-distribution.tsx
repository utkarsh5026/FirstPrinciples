import { PieChart, BookOpen } from "lucide-react";
import CardContainer, {
  CardContainerInsight,
} from "@/components/shared/container/CardContainer";
import CategoryDistributionPieChart from "./category-distribution-pie-chart";
import { useCategoryMetrics, useDocumentList } from "@/hooks";
import { memo, useEffect, useMemo, useState } from "react";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import type { CategoryBreakdown } from "@/stores/analytics/category-store";
import CategoryHorizontalBarChart from "./category-horizontal-bar-chart";

interface CategoryBreakDownProps {
  history: ReadingHistoryItem[];
  compact?: boolean;
  typeOfChart?: "pie" | "bar";
}

const CategoryDistribution: React.FC<CategoryBreakDownProps> = memo(
  ({ history, compact = false, typeOfChart = "pie" }) => {
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

    const barChartData = useMemo(() => {
      if (typeOfChart === "pie") return [];

      const getDocumentCount = (category: string) => {
        return documents.filter((document) =>
          document.path.startsWith(category)
        ).length;
      };

      return categoryBreakdown.map(({ category, count }) => {
        const totalDocuments = getDocumentCount(category);
        const percentage =
          totalDocuments > 0 ? (count / totalDocuments) * 100 : 0;
        return {
          name: category,
          displayName: category,
          count,
          totalDocuments,
          path: category,
          percentage,
        };
      });
    }, [categoryBreakdown, typeOfChart, documents]);

    return (
      <CardContainer
        title="Categories Breakdown"
        icon={PieChart}
        insights={insights}
        description="What do you read the most? 🤔"
        variant="subtle"
        compact={compact}
      >
        {typeOfChart === "pie" ? (
          <CategoryDistributionPieChart
            descriptive={false}
            categoryBreakdown={categoryBreakdown}
            categoryMetrics={metrics}
          />
        ) : (
          <CategoryHorizontalBarChart
            data={barChartData}
            onSelectDocument={() => {}}
            selectedSubcategory={null}
          />
        )}
      </CardContainer>
    );
  }
);

export default CategoryDistribution;
