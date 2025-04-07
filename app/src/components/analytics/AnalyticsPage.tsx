import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Calendar,
  Trophy,
  PieChart as PieChartIcon,
} from "lucide-react";
import { FileMetadata } from "@/utils/MarkdownLoader";
import useReadingAnalytics from "@/hooks/useReadingAnalytics";
import useMobile from "@/hooks/useMobile";
import AnalyticsHeader from "./components/AnalyticsHeader";
import Insights from "./components/Insights";
import Achievements from "./components/Achievments";
import Activity from "./components/Activity";
import AnalyticsOverview from "./overview";

interface AnalyticsPageProps {
  availableDocuments: FileMetadata[];
  onSelectDocument: (path: string, title: string) => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  availableDocuments,
  onSelectDocument,
}) => {
  const { isMobile } = useMobile();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const {
    stats,
    achievements,
    challenges,
    readingHistory,
    data: analyticsData,
    actions,
  } = useReadingAnalytics(availableDocuments);

  const {
    weeklyActivity,
    categoryBreakdown,
    readingByHour,
    readingHeatmap,
    recentActivity,
  } = analyticsData;

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (stats.documentsCompleted / Math.max(availableDocuments.length, 1)) * 100
  );

  // Calculate XP to next level
  const xpToNextLevel = 500;
  const currentLevelXP = stats.totalXP % xpToNextLevel;
  const xpProgress = (currentLevelXP / xpToNextLevel) * 100;

  // Get unfinished challenges
  const activeAchievements = achievements
    .filter(
      (achievement) =>
        achievement.unlockedAt === null && achievement.progress > 0
    )
    .sort((a, b) => b.progress / b.maxProgress - a.progress / a.maxProgress);

  // Calculate current week's reading total
  const getThisWeekReading = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return readingHistory.filter(
      (item) => new Date(item.lastReadAt) >= startOfWeek
    ).length;
  };

  const thisWeekReadingCount = getThisWeekReading();

  // Calculate reading streak info
  const streakEmoji =
    stats.currentStreak >= 7 ? "🔥" : stats.currentStreak >= 3 ? "🔆" : "✨";

  // Prepare monthly reading data
  const getMonthlyReadingData = () => {
    // Create a map to count readings by month
    const monthlyData: Record<string, number> = {};

    // Go back 6 months
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthlyData[monthKey] = 0;
    }

    // Count readings by month
    readingHistory.forEach((item) => {
      const date = new Date(item.lastReadAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey]++;
      }
    });

    // Convert to array format for charts
    return Object.entries(monthlyData)
      .map(([yearMonth, count]) => {
        const [, month] = yearMonth.split("-");
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return {
          name: `${monthNames[parseInt(month) - 1]}`,
          count,
        };
      })
      .reverse();
  };

  const monthlyReadingData = getMonthlyReadingData();

  // Transform heatmap data for the component
  const transformHeatmapData = () => {
    return readingHeatmap.map((item) => ({
      date: item.date,
      count: item.count,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}

      <AnalyticsHeader
        stats={stats}
        xpProgress={xpProgress}
        xpToNextLevel={xpToNextLevel}
        streakEmoji={streakEmoji}
        completionPercentage={completionPercentage}
        currentLevelXP={currentLevelXP}
        availableDocuments={availableDocuments}
      />

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Activity</span>
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Achievements</span>
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <PieChartIcon className="h-3.5 w-3.5" />
            <span>Insights</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <AnalyticsOverview
          stats={stats}
          xpProgress={xpProgress}
          xpToNextLevel={xpToNextLevel}
          currentLevelXP={currentLevelXP}
          isMobile={isMobile}
          thisWeekReadingCount={thisWeekReadingCount}
          readingHistory={readingHistory}
          weeklyActivity={weeklyActivity.map((activity) => ({
            name: activity.day,
            count: activity.count,
          }))}
          monthlyReadingData={monthlyReadingData}
          categoryBreakdown={categoryBreakdown}
          readingByHour={readingByHour}
          recentActivity={recentActivity}
          challenges={challenges}
          actions={actions}
          onSelectDocument={onSelectDocument}
        />
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <Activity
          stats={stats}
          streakEmoji={streakEmoji}
          thisWeekReadingCount={thisWeekReadingCount}
          weeklyActivity={weeklyActivity}
          monthlyReadingData={monthlyReadingData}
          heatMapData={transformHeatmapData()}
        />
      )}

      {/* Achievements Tab */}
      {activeTab === "achievements" && (
        <Achievements
          stats={stats}
          xpProgress={xpProgress}
          xpToNextLevel={xpToNextLevel}
          currentLevelXP={currentLevelXP}
          activeAchievements={activeAchievements}
          achievements={achievements}
        />
      )}

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <Insights
          stats={stats}
          readingHistory={readingHistory}
          analyticsData={analyticsData}
          isMobile={isMobile}
          monthlyReadingData={monthlyReadingData}
        />
      )}
    </div>
  );
};

export default AnalyticsPage;
