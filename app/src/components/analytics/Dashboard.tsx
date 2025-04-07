import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type {
  ReadingHistoryItem,
  ReadingTodoItem,
} from "@/components/home/types";
import type { FileMetadata } from "@/utils/MarkdownLoader";
import type {
  ReadingStats,
  ReadingAchievement,
  ReadingChallenge,
} from "@/utils/ReadingAnalyticsService";
import { readingLevels } from "./levels";

import ProfileSummary from "./components/ProfileSummary";
import OverView from "./components/Overview";
import Activity from "./components/Activity";
import Insights from "./components/Insights";
import Achievements from "./components/Achievments";

interface AnalyticsData {
  weeklyActivity: { day: string; count: number }[];
  categoryBreakdown: { name: string; value: number }[];
  readingByHour: { hour: number; count: number }[];
  readingHeatmap: { date: string; count: number }[];
  recentActivity: ReadingHistoryItem[];
}

interface ReadingAnalyticsDashboardProps {
  stats: ReadingStats;
  achievements: ReadingAchievement[];
  challenges: ReadingChallenge[];
  readingHistory: ReadingHistoryItem[];
  todoList: ReadingTodoItem[];
  availableDocuments: FileMetadata[];
  analyticsData: AnalyticsData;

  onSelectDocument: (path: string, title: string) => void;
  onResetProgress: () => void;
  onRefreshChallenges: () => void;
}

// Main Dashboard Component
const ReadingAnalyticsDashboard: React.FC<ReadingAnalyticsDashboardProps> = ({
  stats,
  achievements,
  challenges,
  readingHistory,
  todoList,
  availableDocuments,
  analyticsData,
  onSelectDocument,
  onResetProgress,
  onRefreshChallenges,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Get current level information
  const getCurrentLevelInfo = () => {
    const level =
      readingLevels.find((l) => l.level === stats.level) || readingLevels[0];
    const nextLevel = readingLevels.find((l) => l.level === stats.level + 1);

    let progress = 100;
    if (nextLevel) {
      // Calculate progress to next level
      const currentLevelXP = level.requiredXP;
      const nextLevelXP = nextLevel.requiredXP;
      const xpForNextLevel = nextLevelXP - currentLevelXP;
      const xpProgress = stats.totalXP - currentLevelXP;
      progress = Math.min(Math.round((xpProgress / xpForNextLevel) * 100), 100);
    }

    return { level, nextLevel, progress };
  };

  const { level, nextLevel, progress } = getCurrentLevelInfo();

  // Handle refresh of challenges
  const handleRefreshChallenges = () => {
    onRefreshChallenges();
  };

  // Get achievement icon component

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Profile Summary */}
      <ProfileSummary
        stats={stats}
        level={level}
        nextLevel={nextLevel}
        progress={progress}
      />

      {/* Main Dashboard with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 mb-4">
          <TabsList className="w-full grid grid-cols-4 h-10 rounded-lg p-1">
            <TabsTrigger
              value="overview"
              className="rounded-md text-xs sm:text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="rounded-md text-xs sm:text-sm"
            >
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-md text-xs sm:text-sm"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="rounded-md text-xs sm:text-sm"
            >
              Insights
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0">
          <OverView
            analyticsData={analyticsData}
            onSelectDocument={onSelectDocument}
          />
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="mt-0 px-4">
          <Achievements
            achievements={achievements}
            challenges={challenges}
            handleRefreshChallenges={handleRefreshChallenges}
          />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-0 px-4">
          <Activity
            analyticsData={analyticsData}
            stats={stats}
            readingHistory={readingHistory}
          />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-0 px-4">
          <Insights
            stats={stats}
            analyticsData={analyticsData}
            availableDocuments={availableDocuments}
            todoList={todoList}
            achievements={achievements}
            challenges={challenges}
            readingHistory={readingHistory}
            onResetProgress={onResetProgress}
            onRefreshChallenges={onRefreshChallenges}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReadingAnalyticsDashboard;
