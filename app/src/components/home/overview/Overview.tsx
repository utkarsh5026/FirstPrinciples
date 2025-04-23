import React, { useState, useEffect } from "react";
import { Zap, Activity } from "lucide-react";
import { useTheme } from "@/hooks/ui/use-theme";
import type { FileMetadata } from "@/services/document";

import StatsCards from "./components/StatsCards";
import RecentActivity from "./components/RecentActivity";
import RecommendedReads from "./components/RecommendedReads";
import UpcomingReads from "./components/UpcomingReads";
import DailyChallenge from "./components/DailyChallenge";
import {
  WeeklyReadingPattern,
  CategoryDistribution,
  TimeOfTheDayDistribution,
} from "@/components/visualizations";
import { useReadingHistory, useDocumentList } from "@/hooks";
import { ReadingHistoryItem } from "@/services/reading/reading-history-service";

interface OverviewProps {
  handleSelectDocument: (path: string, title: string) => void;
  setShowAddTodoModal: () => void;
}

const Overview: React.FC<OverviewProps> = ({
  handleSelectDocument,
  setShowAddTodoModal,
}) => {
  const { currentTheme } = useTheme();
  const { history, filterHistory } = useReadingHistory();
  const { documents } = useDocumentList();
  const [featuredDocs, setFeaturedDocs] = useState<FileMetadata[]>([]);
  const [todayHistory, setTodayHistory] = useState<ReadingHistoryItem[]>([]);

  const [mostReadCategory, setMostReadCategory] = useState<string>("None yet");

  useEffect(() => {
    // Generate category data for pie chart
    const categories: Record<string, number> = {};
    history.forEach((item) => {
      const category = item.path.split("/")[0] ?? "uncategorized";
      categories[category] = (categories[category] || 0) + 1;
    });

    const categoriesArray = Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));

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

    history.forEach((item) => {
      const day = new Date(item.lastReadAt).getDay();
      // Convert from 0-6 (Sunday-Saturday) to weekdays array index
      const index = day === 0 ? 6 : day - 1;
      weekdays[index].count++;
    });

    // Get featured/recommended documents
    if (documents.length > 0) {
      // Try to recommend based on most read category
      let recommended: FileMetadata[] = [];

      if (categoriesArray.length > 0) {
        const topCategory = categoriesArray[0].name;
        // Find unread docs from top category
        recommended = documents
          .filter(
            (doc) =>
              doc.path.startsWith(topCategory) &&
              !history.some((item) => item.path === doc.path)
          )
          .slice(0, 4);
      }

      // If not enough recommended docs, add some random ones
      if (recommended.length < 4) {
        const remaining = 4 - recommended.length;
        const otherDocs = documents
          .filter(
            (doc) =>
              !recommended.includes(doc) &&
              !history.some((item) => item.path === doc.path)
          )
          .sort(() => 0.5 - Math.random())
          .slice(0, remaining);

        recommended = [...recommended, ...otherDocs];
      }

      setFeaturedDocs(recommended);
    }
  }, [history, documents, currentTheme]);

  useEffect(() => {
    filterHistory({
      category: "all",
      timePeriod: "today",
    }).then((history) => {
      setTodayHistory(history);
    });
  }, [filterHistory]);

  const getNextMilestone = () => {
    const completedCount = history.length;
    if (completedCount < 5) return { target: 5, progress: completedCount };
    if (completedCount < 10) return { target: 10, progress: completedCount };
    if (completedCount < 20) return { target: 20, progress: completedCount };
    if (completedCount < 50) return { target: 50, progress: completedCount };
    return { target: 100, progress: completedCount };
  };

  const nextMilestone = getNextMilestone();

  console.dir(todayHistory, { depth: null });

  return (
    <div className="space-y-6">
      <StatsCards nextMilestone={nextMilestone} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center">
            <Activity className="mr-2 h-4 w-4 text-primary" />
            Reading Insights
          </h3>

          <div className="flex flex-col gap-4">
            <CategoryDistribution history={history} compact />
            <WeeklyReadingPattern history={history} compact />
            <TimeOfTheDayDistribution
              history={todayHistory}
              typeOfChart="bar"
            />
          </div>
        </div>
        <div className="space-y-4 flex flex-col gap-4">
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
            handleSelectDocument={handleSelectDocument}
            setShowAddTodoModal={setShowAddTodoModal}
          />

          <RecentActivity handleSelectDocument={handleSelectDocument} />
        </div>
      </div>

      <DailyChallenge />
    </div>
  );
};

export default Overview;
