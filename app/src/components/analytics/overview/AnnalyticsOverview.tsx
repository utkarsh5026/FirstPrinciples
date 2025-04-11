import React from "react";
import type { ReadingChallenge } from "@/utils/ReadingAnalyticsService";
import ReadingProgress from "./ReadingProgress";
import DailyChallenges from "./DailyChallenges";
import CategoryBreakDown from "./CategoryBreakdown";
import ReadingTrends from "./ReadingTrends";
import RecentReads from "./RecentReads";
import useMobile from "@/hooks/useMobile";
import { useReadingMetrics } from "@/context/metrics/MetricsContext";

interface AnalyticsOverviewProps {
  xpProgress: number;
  xpToNextLevel: number;
  currentLevelXP: number;
  challenges: ReadingChallenge[];
  actions: {
    refreshChallenges: () => void;
  };
  onSelectDocument: (path: string, title: string) => void;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  xpProgress,
  xpToNextLevel,
  currentLevelXP,
  challenges,
  actions,
  onSelectDocument,
}) => {
  const { isMobile } = useMobile();
  const { analyticsData } = useReadingMetrics();

  const { categoryBreakdown, readingByHour, recentActivity } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Progress Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Summary and stats */}
        <div className="space-y-4">
          <ReadingProgress
            currentLevelXP={currentLevelXP}
            xpToNextLevel={xpToNextLevel}
            xpProgress={xpProgress}
          />

          <DailyChallenges
            refreshChallenges={actions.refreshChallenges}
            challenges={challenges}
          />
        </div>

        {/* Right column: Activity overview */}
        <div className="space-y-4">
          <RecentReads
            recentActivity={recentActivity.map((item) => ({
              path: item.path,
              title: item.title,
              lastReadAt: new Date(item.lastReadAt).toLocaleString(),
              readCount: item.readCount,
            }))}
            onSelectDocument={onSelectDocument}
          />

          {/* Reading Trends - Bar Chart */}
          <ReadingTrends />
        </div>
      </div>

      {/* Category Breakdown and Time of Day */}
      <CategoryBreakDown
        categoryBreakdown={categoryBreakdown}
        isMobile={isMobile}
        readingByHour={readingByHour}
      />
    </div>
  );
};

export default AnalyticsOverview;
