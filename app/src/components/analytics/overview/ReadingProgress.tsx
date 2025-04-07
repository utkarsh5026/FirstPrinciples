import { Card } from "@/components/ui/card";
import { formatReadingTime, formatNumber } from "../utils";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ReadingStats } from "@/utils/ReadingAnalyticsService";
import React from "react";
import { Progress } from "@/components/ui/progress";
import type { ReadingHistoryItem } from "@/hooks/useDocumentManager";

interface ReadingProgressProps {
  stats: ReadingStats;
  currentLevelXP: number;
  xpToNextLevel: number;
  xpProgress: number;
  thisWeekReadingCount: number;
  readingHistory: ReadingHistoryItem[];
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({
  stats,
  currentLevelXP,
  xpToNextLevel,
  xpProgress,
  thisWeekReadingCount,
  readingHistory,
}) => {
  const summary = [
    {
      heading: "This Week",
      value: thisWeekReadingCount,
      description: "Documents read",
    },
    {
      heading: "Categories",
      value: stats.categoriesExplored.size,
      description: "Explored",
    },
    {
      heading: "Reading Time",
      value: formatReadingTime(stats.totalReadingTime),
      description: "Total time",
    },
    {
      heading: "Avg. Session",
      value:
        readingHistory.length > 0
          ? formatReadingTime(
              Math.round(stats.totalReadingTime / readingHistory.length)
            )
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
          Level {stats.level}
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
              Estimated based on reading time
            </div>
          </div>
          <div className="text-xl font-bold">
            {formatNumber(stats.estimatedWordsRead)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReadingProgress;
