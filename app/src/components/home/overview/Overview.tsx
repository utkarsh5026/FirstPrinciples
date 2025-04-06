import React, { useState, useEffect } from "react";
import { Zap, Activity } from "lucide-react";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { ReadingHistoryItem, ReadingTodoItem } from "@/components/home/types";
import { FileMetadata } from "@/utils/MarkdownLoader";
import { ReadingAnalyticsService } from "@/utils/ReadingAnalyticsService";

import StatsCards from "./components/StatsCards";
import ReadingInsights from "./components/ReadingInsights";
import RecentActivity from "./components/RecentActivity";
import RecommendedReads from "./components/RecommendedReads";
import UpcomingReads from "./components/UpcomingReads";
import DailyChallenge from "./components/DailyChallenge";

interface EnhancedOverviewProps {
  todoList: ReadingTodoItem[];
  readingHistory: ReadingHistoryItem[];
  availableDocuments: FileMetadata[];
  handleSelectDocument: (path: string, title: string) => void;
  toggleTodoCompletion: (id: string) => void;
  formatDate: (timestamp: number) => string;
  setShowAddTodoModal: () => void;
}

const EnhancedOverview: React.FC<EnhancedOverviewProps> = ({
  todoList,
  readingHistory,
  availableDocuments,
  handleSelectDocument,
  toggleTodoCompletion,
  formatDate,
  setShowAddTodoModal,
}) => {
  const { currentTheme } = useTheme();

  // Reading stats from analytics service
  const [stats, setStats] = useState(() =>
    ReadingAnalyticsService.getReadingStats()
  );
  const [featuredDocs, setFeaturedDocs] = useState<FileMetadata[]>([]);
  const [categoryData, setCategoryData] = useState<
    { name: string; value: number }[]
  >([]);
  const [weekdayData, setWeekdayData] = useState<
    { name: string; count: number }[]
  >([]);
  const [mostReadCategory, setMostReadCategory] = useState<string>("None yet");

  // Generate dynamic chart colors based on theme
  const generateChartColors = () => {
    return [
      currentTheme.primary,
      `${currentTheme.primary}DD`,
      `${currentTheme.primary}BB`,
      `${currentTheme.primary}99`,
      `${currentTheme.primary}77`,
    ];
  };

  const COLORS = generateChartColors();

  useEffect(() => {
    // Update stats when history or todo list changes
    setStats(ReadingAnalyticsService.getReadingStats());

    // Generate category data for pie chart
    const categories: Record<string, number> = {};
    readingHistory.forEach((item) => {
      const category = item.path.split("/")[0] || "uncategorized";
      categories[category] = (categories[category] || 0) + 1;
    });

    const categoriesArray = Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
    setCategoryData(categoriesArray);

    // Find most read category
    if (categoriesArray.length > 0) {
      const sorted = [...categoriesArray].sort((a, b) => b.value - a.value);
      setMostReadCategory(sorted[0].name);
    }

    // Generate weekday data
    const weekdays = [
      { name: "Mon", count: 0 },
      { name: "Tue", count: 0 },
      { name: "Wed", count: 0 },
      { name: "Thu", count: 0 },
      { name: "Fri", count: 0 },
      { name: "Sat", count: 0 },
      { name: "Sun", count: 0 },
    ];

    readingHistory.forEach((item) => {
      const day = new Date(item.lastReadAt).getDay();
      // Convert from 0-6 (Sunday-Saturday) to weekdays array index
      const index = day === 0 ? 6 : day - 1;
      weekdays[index].count++;
    });

    setWeekdayData(weekdays);

    // Get featured/recommended documents
    if (availableDocuments.length > 0) {
      // Try to recommend based on most read category
      let recommended: FileMetadata[] = [];

      if (categoriesArray.length > 0) {
        const topCategory = categoriesArray[0].name;
        // Find unread docs from top category
        recommended = availableDocuments
          .filter(
            (doc) =>
              doc.path.startsWith(topCategory) &&
              !readingHistory.some((item) => item.path === doc.path)
          )
          .slice(0, 4);
      }

      // If not enough recommended docs, add some random ones
      if (recommended.length < 4) {
        const remaining = 4 - recommended.length;
        const otherDocs = availableDocuments
          .filter(
            (doc) =>
              !recommended.includes(doc) &&
              !readingHistory.some((item) => item.path === doc.path)
          )
          .sort(() => 0.5 - Math.random())
          .slice(0, remaining);

        recommended = [...recommended, ...otherDocs];
      }

      setFeaturedDocs(recommended);
    }
  }, [readingHistory, todoList, availableDocuments, currentTheme]);

  // Format reading time
  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate next milestone
  const getNextMilestone = () => {
    const completedCount = readingHistory.length;
    if (completedCount < 5) return { target: 5, progress: completedCount };
    if (completedCount < 10) return { target: 10, progress: completedCount };
    if (completedCount < 20) return { target: 20, progress: completedCount };
    if (completedCount < 50) return { target: 50, progress: completedCount };
    return { target: 100, progress: completedCount };
  };

  const nextMilestone = getNextMilestone();

  // Calculate today's reads for daily challenge
  const todayReadsCount = readingHistory.filter((item) => {
    const today = new Date().setHours(0, 0, 0, 0);
    return new Date(item.lastReadAt).setHours(0, 0, 0, 0) === today;
  }).length;

  // Get unread documents count
  const unreadDocs = availableDocuments.length - readingHistory.length;

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (readingHistory.length / Math.max(availableDocuments.length, 1)) * 100
  );

  return (
    <div className="space-y-6">
      <StatsCards
        stats={stats}
        readingHistory={readingHistory}
        formatReadingTime={formatReadingTime}
        formatNumber={formatNumber}
        nextMilestone={nextMilestone}
        unreadDocs={unreadDocs}
        completionPercentage={completionPercentage}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center">
            <Activity className="mr-2 h-4 w-4 text-primary" />
            Reading Insights
          </h3>

          <ReadingInsights
            categoryData={categoryData}
            weekdayData={weekdayData}
            mostReadCategory={mostReadCategory}
            COLORS={COLORS}
          />

          <RecentActivity
            readingHistory={readingHistory}
            handleSelectDocument={handleSelectDocument}
            formatDate={formatDate}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center">
            <Zap className="mr-2 h-4 w-4 text-primary" />
            Continue Learning
          </h3>

          <RecommendedReads
            featuredDocs={featuredDocs}
            mostReadCategory={mostReadCategory}
            handleSelectDocument={handleSelectDocument}
          />

          <UpcomingReads
            todoList={todoList}
            handleSelectDocument={handleSelectDocument}
            toggleTodoCompletion={toggleTodoCompletion}
            formatDate={formatDate}
            setShowAddTodoModal={setShowAddTodoModal}
          />
        </div>
      </div>

      <DailyChallenge todayReadsCount={todayReadsCount} />
    </div>
  );
};

export default EnhancedOverview;
