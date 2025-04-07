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

interface DashboardProps {
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

const Dashboard: React.FC<DashboardProps> = ({
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

  const handleRefreshChallenges = () => {
    onRefreshChallenges();
  };

  const tabs = ["overview", "achievements", "activity", "insights"];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <ProfileSummary
        stats={stats}
        level={level}
        nextLevel={nextLevel}
        progress={progress}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 mb-4">
          <TabsList className="w-full grid grid-cols-4 h-10 rounded-4xl p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={`rounded-4xl text-xs ${
                  activeTab === tab ? "bg-primary/10 text-primary" : ""
                }`}
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          <OverView
            analyticsData={analyticsData}
            onSelectDocument={onSelectDocument}
          />
        </TabsContent>

        <TabsContent value="achievements" className="mt-0 px-4">
          <Achievements
            achievements={achievements}
            challenges={challenges}
            handleRefreshChallenges={handleRefreshChallenges}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-0 px-4">
          <Activity
            analyticsData={analyticsData}
            stats={stats}
            readingHistory={readingHistory}
          />
        </TabsContent>

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

export default Dashboard;
