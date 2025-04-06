// src/components/analytics/AnalyticsPage.tsx
import React from "react";
import { useReadingAnalytics } from "@/hooks/useReadingAnalytics";
import ReadingAnalyticsDashboard from "@/components/analytics/Dashboard";
import { FileMetadata } from "@/utils/MarkdownLoader";
import LoadingScreen from "@/components/core/LoadingScreen";

interface AnalyticsPageProps {
  availableDocuments: FileMetadata[];
  onSelectDocument: (path: string, title: string) => void;
}

/**
 * Analytics Page Component
 *
 * This is the main container for the reading analytics dashboard.
 * It manages state and data fetching via the useReadingAnalytics hook.
 */
const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  availableDocuments,
  onSelectDocument,
}) => {
  // Use our custom hook to get analytics data and actions
  const {
    stats,
    achievements,
    challenges,
    readingHistory,
    todoList,
    data,
    actions,
    isLoading,
    error,
  } = useReadingAnalytics(availableDocuments);

  // If loading, show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If error, show error message
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="bg-red-900/10 border border-red-800/30 text-red-600 p-4 rounded-lg max-w-md">
          <h3 className="font-medium mb-2">Error Loading Analytics</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ReadingAnalyticsDashboard
      // Pass data
      stats={stats}
      achievements={achievements}
      challenges={challenges}
      readingHistory={readingHistory}
      todoList={todoList}
      availableDocuments={availableDocuments}
      analyticsData={data}
      // Pass actions
      onSelectDocument={onSelectDocument}
      onResetProgress={actions.resetProgress}
      onRefreshChallenges={actions.refreshChallenges}
    />
  );
};

export default AnalyticsPage;
