import React, { useCallback, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import Insights from "./insights";
import Achievements from "./components/Achievments";
import Activity from "./components/Activity";
import AnalyticsOverview from "./overview";
import CategoryInsightTab from "./category/CategoryInsightsTab";
import { SiDeepl } from "react-icons/si";
import { getStreakEmoji, monthNames } from "./utils";
import { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import { AnalyticsData } from "./types";

const xpToNextLevel = 500;
interface AnalyticsPageProps {
  availableDocuments: FileMetadata[];
  onSelectDocument: (path: string, title: string) => void;
}

const tabs = [
  {
    title: "Overview",
    icon: <BarChart3 className="h-3.5 w-3.5" />,
  },
  {
    title: "Activity",
    icon: <Calendar className="h-3.5 w-3.5" />,
  },
  {
    title: "Achievements",
    icon: <Trophy className="h-3.5 w-3.5" />,
  },
  {
    title: "Insights",
    icon: <PieChartIcon className="h-3.5 w-3.5" />,
  },
  {
    title: "Deep",
    icon: <SiDeepl className="h-3.5 w-3.5" />,
  },
];

/**
 * AnalyticsPage Component
 *
 * A comprehensive analytics dashboard that displays user reading statistics,
 * achievements, activity patterns, and content insights.
 *
 * The component is organized into multiple tabs:
 * - Overview: General statistics and summary of user activity
 * - Activity: Detailed breakdown of reading patterns over time
 * - Achievements: User accomplishments and progress
 * - Insights: In-depth analysis of reading habits
 * - Deep: Category-specific insights and document recommendations
 *
 * @param {FileMetadata[]} availableDocuments - List of all available documents in the system
 * @param {Function} onSelectDocument - Callback function when a document is selected
 */
const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  availableDocuments,
  onSelectDocument,
}) => {
  /**
   * Detects if the user is on a mobile device
   */
  const { isMobile } = useMobile();

  /**
   * Controls which analytics tab is currently active
   */
  const [activeTab, setActiveTab] = useState<string>("overview");

  /**
   * Fetches and manages all reading analytics data
   * - stats: Overall user statistics
   * - achievements: User accomplishments
   * - challenges: Current active challenges
   * - readingHistory: Historical reading data
   * - data: Processed analytics data for visualization
   * - actions: Functions to interact with analytics
   */
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

  /**
   * Calculates the percentage of documents completed by the user
   */
  const completionPercentage = Math.round(
    (stats.documentsCompleted / Math.max(availableDocuments.length, 1)) * 100
  );

  /**
   * Calculates XP progress towards the next level
   */
  const currentLevelXP = stats.totalXP % xpToNextLevel;
  const xpProgress = (currentLevelXP / xpToNextLevel) * 100;

  /**
   * Filters and sorts achievements that are in progress but not yet completed
   */
  const activeAchievements = useMemo(() => {
    return achievements
      .filter(
        (achievement) =>
          achievement.unlockedAt === null && achievement.progress > 0
      )
      .sort((a, b) => b.progress / b.maxProgress - a.progress / a.maxProgress);
  }, [achievements]);

  /**
   * Calculates the number of documents read in the current week
   */
  const thisWeekReadingCount = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return readingHistory.filter(
      (item) => new Date(item.lastReadAt) >= startOfWeek
    ).length;
  }, [readingHistory]);

  /**
   * Processes reading history into monthly data for the past 6 months
   */
  const monthlyReadingData = useMemo(() => {
    const monthlyData: Record<string, number> = {};

    const collectPastSixMontsData = () => {
      const today = new Date();
      for (let i = 0; i < 6; i++) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        monthlyData[monthKey] = 0;
      }
    };

    const countReadingsByMonth = () => {
      readingHistory.forEach((item) => {
        const date = new Date(item.lastReadAt);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey]++;
        }
      });
    };

    collectPastSixMontsData();
    countReadingsByMonth();

    return Object.entries(monthlyData)
      .map(([yearMonth, count]) => {
        const [, month] = yearMonth.split("-");
        return {
          name: `${monthNames[parseInt(month) - 1]}`,
          count,
        };
      })
      .reverse();
  }, [readingHistory]);

  /**
   * Transforms heatmap data into the format required by the visualization component
   */
  const transformHeatmapData = useCallback(() => {
    return readingHeatmap.map((item) => ({
      date: item.date,
      count: item.count,
    }));
  }, [readingHeatmap]);

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        stats={stats}
        xpProgress={xpProgress}
        xpToNextLevel={xpToNextLevel}
        streakEmoji={getStreakEmoji(stats.currentStreak)}
        completionPercentage={completionPercentage}
        currentLevelXP={currentLevelXP}
        availableDocuments={availableDocuments}
      />

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start mb-6 overflow-x-auto">
          {tabs.map(({ title, icon }) => (
            <TabsTrigger
              key={title}
              value={title.toLowerCase()}
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              {icon}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <AnalyticsOverview
            stats={stats}
            xpProgress={xpProgress}
            xpToNextLevel={xpToNextLevel}
            currentLevelXP={currentLevelXP}
            isMobile={isMobile}
            thisWeekReadingCount={thisWeekReadingCount}
            readingHistory={readingHistory as ReadingHistoryItem[]}
            weeklyActivity={weeklyActivity.map((activity) => ({
              name: activity.day,
              count: activity.count,
            }))}
            monthlyReadingData={monthlyReadingData}
            categoryBreakdown={categoryBreakdown}
            readingByHour={readingByHour}
            recentActivity={recentActivity as ReadingHistoryItem[]}
            challenges={challenges}
            actions={actions}
            onSelectDocument={onSelectDocument}
          />
        </TabsContent>

        <TabsContent value="activity">
          <Activity
            stats={stats}
            streakEmoji={getStreakEmoji(stats.currentStreak)}
            thisWeekReadingCount={thisWeekReadingCount}
            weeklyActivity={weeklyActivity}
            monthlyReadingData={monthlyReadingData}
            heatMapData={transformHeatmapData()}
          />
        </TabsContent>

        <TabsContent value="achievements">
          <Achievements
            stats={stats}
            xpProgress={xpProgress}
            xpToNextLevel={xpToNextLevel}
            currentLevelXP={currentLevelXP}
            activeAchievements={activeAchievements}
            achievements={achievements}
          />
        </TabsContent>

        <TabsContent value="insights">
          <Insights
            stats={stats}
            readingHistory={readingHistory as ReadingHistoryItem[]}
            analyticsData={analyticsData as AnalyticsData}
            monthlyReadingData={monthlyReadingData}
          />
        </TabsContent>

        <TabsContent value="deep">
          <CategoryInsightTab
            stats={stats}
            readingHistory={readingHistory as ReadingHistoryItem[]}
            availableDocuments={availableDocuments}
            onSelectDocument={onSelectDocument}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
