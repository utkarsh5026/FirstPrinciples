import React from "react";
import ReadingProgress from "./ReadingProgress";
import CategoryBreakDown from "./CategoryBreakdown";
import ReadingTrends from "./ReadingTrends";
import { useActivityStore, useCategoryStore, useHistoryStore } from "@/stores";
import Activity from "./Activity";
import HeatMapView from "../../deep/timeline/HeatMapView";
import CategoryCoverageMap from "@/components/analytics/components/insights/CategoryCoverage";

export interface ReadingChallenge {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: number;
  reward: number;
  expiresAt: number | null;
  completed: boolean;
}

const AnalyticsOverview: React.FC = () => {
  const readingHistory = useHistoryStore((state) => state.readingHistory);
  const categoryBreakdown = useCategoryStore(
    (state) => state.categoryBreakdown
  );
  const readingByHour = useActivityStore((state) => state.totalReadingByHour);

  return (
    <div className="space-y-6">
      {/* Progress Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Summary and stats */}
        <div className="space-y-4 flex flex-col gap-4">
          <ReadingProgress />

          <CategoryCoverageMap compact={true} />
        </div>

        <div className="space-y-4 flex flex-col gap-4">
          <HeatMapView
            filteredHistory={readingHistory}
            usePrevNextButtons={false}
            compact={true}
          />

          <ReadingTrends />
        </div>
      </div>

      <CategoryBreakDown
        categoryBreakdown={categoryBreakdown}
        readingByHour={readingByHour}
      />

      <Activity />
    </div>
  );
};

export default AnalyticsOverview;
