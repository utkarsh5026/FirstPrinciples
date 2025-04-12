import { useCallback, useMemo } from "react";
import { useDocumentManager } from "@/context/document/DocumentContext";
import { useReadingHistory } from "@/context/history/HistoryContext";
import { AnalyticsContext } from "./AnalyticsContext";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { availableDocuments } = useDocumentManager();
  const { readingHistory } = useReadingHistory();

  const createCatgegoryBreakDown = useCallback(
    (readingHistory: ReadingHistoryItem[]) => {
      const categoryMap: Record<string, number> = {};
      readingHistory.forEach((item) => {
        const category = item.path.split("/")[0] || "uncategorized";
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      });

      const total = Object.values(categoryMap).reduce(
        (sum, count) => sum + count,
        0
      );

      const result = Object.entries(categoryMap);
      return result
        .map(([category, count]) => ({
          category,
          count,
          categoryCount: availableDocuments.filter(
            (doc) => doc.path.split("/")[0] === category
          ).length,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },
    [availableDocuments]
  );

  const totalCategoryBreakdown = useMemo(() => {
    return createCatgegoryBreakDown(readingHistory);
  }, [createCatgegoryBreakDown, readingHistory]);

  const data = useMemo(
    () => ({ createCatgegoryBreakDown, totalCategoryBreakdown }),
    [createCatgegoryBreakDown, totalCategoryBreakdown]
  );

  return (
    <AnalyticsContext.Provider value={data}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;
