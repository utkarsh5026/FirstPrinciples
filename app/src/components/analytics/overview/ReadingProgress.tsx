import { Card } from "@/components/ui/card";
import { formatNumber } from "../utils";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React, { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { useHistoryStore, useCategoryStore } from "@/stores";
import useGlobalMetrics from "@/hooks/section/useGlobalMetrics";
import { formatTimeInMs } from "@/utils/time";

interface ReadingProgressProps {
  currentLevelXP: number;
  xpToNextLevel: number;
  xpProgress: number;
}

/**
 * 🚀 ReadingProgress Component
 *
 * This component displays the user's reading progress, including their current level, XP progress, and various reading statistics.
 * It's designed to be a fun and engaging way to track your reading journey! 📚
 *
 * It fetches data from the history store, category store, and global metrics hook to display:
 * - The number of documents read in the current week 📆
 * - The number of categories explored 🌍
 * - The total time spent reading ⏰
 * - The average session time per document 🕒
 * - The total words read 📖
 *
 * The component also includes a progress bar to show the user's XP progress towards the next level. 🚀
 *
 * The intention behind this component is to provide a motivating and informative snapshot of the user's reading activity, encouraging them to keep reading and exploring! 📚💪
 */
const ReadingProgress: React.FC<ReadingProgressProps> = ({
  currentLevelXP,
  xpToNextLevel,
  xpProgress,
}) => {
  const readingHistory = useHistoryStore((state) => state.readingHistory);
  const categoryBreakdown = useCategoryStore(
    (state) => state.categoryBreakdown
  );

  const { totalWordsRead, totalTimeSpent, documents } = useGlobalMetrics();

  /**
   * 🔄 currentWeekReadingCount Function
   *
   * This function calculates the number of documents read in the current week.
   * It filters the reading history to include only documents read since the start of the week. 🔄
   */
  const currentWeekReadingCount = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return readingHistory.filter(
      (item) => new Date(item.lastReadAt) >= startOfWeek
    ).length;
  }, [readingHistory]);

  const summary = [
    {
      heading: "This Week",
      value: currentWeekReadingCount,
      description: "Documents read",
    },
    {
      heading: "Categories",
      value: categoryBreakdown.length,
      description: "Explored",
    },
    {
      heading: "Reading Time",
      value: formatTimeInMs(totalTimeSpent),
      description: "Total time",
    },
    {
      heading: "Avg. Session",
      value:
        documents.read > 0
          ? formatTimeInMs(Math.round(totalTimeSpent / documents.read))
          : "0 min",
      description: "Per document",
    },
  ];

  return (
    <Card className="p-4 border-primary/10 bg-gradient-to-r from-primary/5 to-transparent rounded-3xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium flex items-center">
          <User className="h-4 w-4 mr-2 text-primary" />
          Reading Progress
        </h4>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-none rounded-2xl"
        >
          Level 1
        </Badge>
      </div>

      <div className="space-y-4">
        {/* XP Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>XP Progress</span>
            <span>
              {currentLevelXP} / {xpToNextLevel} XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>

        {/* Reading Stats */}
        <div className="grid grid-cols-2 gap-3">
          {summary.map((item) => (
            <div
              key={item.heading}
              className="rounded-2xl border border-primary/10 bg-card p-3"
            >
              <div className="text-xs text-muted-foreground">
                {item.heading}
              </div>
              <div className="font-bold text-xl mt-1">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {item.description}
              </div>
            </div>
          ))}
        </div>

        {/* Words Read */}
        <div className="bg-primary/5 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Total Words Read</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Calculated based on sections read
            </div>
          </div>
          <div className="text-xl font-bold">
            {formatNumber(totalWordsRead)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReadingProgress;
