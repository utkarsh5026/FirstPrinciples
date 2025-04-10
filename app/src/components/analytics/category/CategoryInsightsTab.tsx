import React from "react";
import { ReadingStats } from "@/utils/ReadingAnalyticsService";
import { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import { FileMetadata } from "@/utils/MarkdownLoader";
import CategoryAnalytics from "./CategoryAnalytics";

interface CategoryInsightTabProps {
  stats: ReadingStats;
  readingHistory: ReadingHistoryItem[];
  availableDocuments: FileMetadata[];
  onSelectDocument: (path: string, title: string) => void;
}

/**
 * The CategoryInsightTab component serves as the entry point for the enhanced
 * category analytics features. It uses the EnhancedCategoryAnalytics component
 * which contains multiple visualizations and insights.
 */
const CategoryInsightTab: React.FC<CategoryInsightTabProps> = ({
  stats,
  readingHistory,
  availableDocuments,
  onSelectDocument,
}) => {
  return (
    <CategoryAnalytics
      readingHistory={readingHistory}
      availableDocuments={availableDocuments}
      stats={stats}
      onSelectDocument={onSelectDocument}
    />
  );
};

export default CategoryInsightTab;
