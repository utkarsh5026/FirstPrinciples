import React from "react";
import ReadingProgress from "./ReadingProgress";
import DailyChallenges from "./DailyChallenges";
import CategoryBreakDown from "./CategoryBreakdown";
import ReadingTrends from "./ReadingTrends";
import RecentReads from "./RecentReads";
import useMobile from "@/hooks/useMobile";
import { useActivityStore, useCategoryStore, useHistoryStore } from "@/stores";
import Activity from "./Activity";
import { useXP } from "@/context";

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

interface AnalyticsOverviewProps {
  challenges: ReadingChallenge[];
  actions: {
    refreshChallenges: () => void;
  };
  onSelectDocument: (path: string, title: string) => void;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  challenges,
  actions,
  onSelectDocument,
}) => {
  const { isMobile } = useMobile();
  const { xpStats } = useXP();
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
        <div className="space-y-4">
          <ReadingProgress
            currentLevelXP={xpStats.currentLevelXP}
            xpToNextLevel={xpStats.nextLevelXP}
            xpProgress={xpStats.currentLevelXP / xpStats.nextLevelXP}
          />

          <DailyChallenges
            refreshChallenges={actions.refreshChallenges}
            challenges={challenges}
          />
        </div>

        {/* Right column: Activity overview */}
        <div className="space-y-4">
          <RecentReads
            recentActivity={readingHistory.map((item) => ({
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

      <CategoryBreakDown
        categoryBreakdown={categoryBreakdown.map((item) => ({
          name: item.category,
          value: item.count,
        }))}
        isMobile={isMobile}
        readingByHour={readingByHour}
      />

      <Activity />
    </div>
  );
};

export default AnalyticsOverview;
