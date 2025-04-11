import React from "react";
import type {
  ReadingChallenge,
  ReadingStats,
} from "@/utils/ReadingAnalyticsService";
import { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import ReadingProgress from "./ReadingProgress";
import DailyChallenges from "./DailyChallenges";
import CategoryBreakDown from "./CategoryBreakdown";
import ReadingTrends from "./ReadingTrends";
import RecentReads from "./RecentReads";

interface AnalyticsOverviewProps {
  stats: ReadingStats;
  isMobile: boolean;
  xpProgress: number;
  xpToNextLevel: number;
  currentLevelXP: number;
  thisWeekReadingCount: number;
  readingHistory: ReadingHistoryItem[];
  weeklyActivity: { name: string; count: number }[];
  monthlyReadingData: { name: string; count: number }[];
  categoryBreakdown: { name: string; value: number }[];
  readingByHour: { hour: number; count: number }[];
  recentActivity: ReadingHistoryItem[];
  challenges: ReadingChallenge[];
  actions: {
    refreshChallenges: () => void;
  };
  onSelectDocument: (path: string, title: string) => void;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  stats,
  isMobile,
  xpProgress,
  xpToNextLevel,
  currentLevelXP,
  thisWeekReadingCount,
  weeklyActivity,
  monthlyReadingData,
  categoryBreakdown,
  readingByHour,
  recentActivity,
  challenges,
  actions,
  readingHistory,
  onSelectDocument,
}) => {
  return (
    <div className="space-y-6">
      {/* Progress Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Summary and stats */}
        <div className="space-y-4">
          <ReadingProgress
            stats={stats}
            currentLevelXP={currentLevelXP}
            xpToNextLevel={xpToNextLevel}
            xpProgress={xpProgress}
            thisWeekReadingCount={thisWeekReadingCount}
            readingHistory={readingHistory}
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
          <ReadingTrends
            weeklyActivity={weeklyActivity}
            monthlyReadingData={monthlyReadingData}
          />
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
