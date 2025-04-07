import React, { ReactNode } from "react";
import { BookCopy, Flame, Clock, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { ReadingHistoryItem } from "@/components/home/types";

interface StatsCardsProps {
  stats: {
    currentStreak: number;
    longestStreak: number;
    totalReadingTime: number;
    estimatedWordsRead: number;
    lastSessionDuration: number;
  };
  readingHistory: ReadingHistoryItem[];
  formatReadingTime: (minutes: number) => string;
  formatNumber: (num: number) => string;
  nextMilestone: { target: number; progress: number };
  unreadDocs: number;
  completionPercentage: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  readingHistory,
  formatReadingTime,
  formatNumber,
  nextMilestone,
  unreadDocs,
  completionPercentage,
}) => {
  const milestoneProgress =
    (nextMilestone.progress / nextMilestone.target) * 100;
  const streakEmoji =
    stats.currentStreak >= 7 ? "🔥" : stats.currentStreak >= 3 ? "🔆" : "✨";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Reading Progress */}
      <StatsCard
        icon={<BookCopy className="h-4 w-4 text-primary" />}
        title="Overall Progress"
        mainContent={
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">{completionPercentage}%</span>
            <span className="text-muted-foreground text-xs ml-1">complete</span>
          </div>
        }
        progressValue={completionPercentage}
        footerContent={
          <>
            <span>{readingHistory.length} read</span>
            <span>{unreadDocs} left</span>
          </>
        }
      />

      {/* Reading Streak */}
      <StatsCard
        icon={<Flame className="h-4 w-4 text-primary" />}
        title="Current Streak"
        mainContent={
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold">{stats.currentStreak}</span>
            <span className="text-xl ml-1">{streakEmoji}</span>
            <span className="text-muted-foreground text-xs ml-1">days</span>
          </div>
        }
        footerContent={
          <>
            <span>Best: {stats.longestStreak} days</span>
            {stats.currentStreak > 0 && <span>Keep it up!</span>}
          </>
        }
      />

      {/* Reading Time */}
      <StatsCard
        icon={<Clock className="h-4 w-4 text-primary" />}
        title="Total Reading"
        mainContent={
          <div className="flex mb-2">
            <span className="text-2xl font-bold">
              {formatReadingTime(stats.totalReadingTime)}
            </span>
          </div>
        }
        footerContent={
          <>
            <span>~{formatNumber(stats.estimatedWordsRead)} words</span>
            <span>
              Today: {formatReadingTime(stats.lastSessionDuration || 0)}
            </span>
          </>
        }
      />

      {/* Next Milestone */}
      <StatsCard
        icon={<Trophy className="h-4 w-4 text-primary" />}
        title="Next Milestone"
        mainContent={
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">{nextMilestone.target}</span>
            <span className="text-muted-foreground text-xs ml-1">docs</span>
          </div>
        }
        progressValue={milestoneProgress}
        footerContent={
          <>
            <span>
              {nextMilestone.progress} / {nextMilestone.target}
            </span>
            <span>{nextMilestone.target - nextMilestone.progress} to go</span>
          </>
        }
      />
    </div>
  );
};

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  mainContent: ReactNode;
  progressValue?: number;
  footerContent: ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  title,
  mainContent,
  progressValue,
  footerContent,
}) => {
  const { currentTheme } = useTheme();

  return (
    <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors rounded-3xl">
      {/* Decorative accent */}
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.primary}, transparent)`,
        }}
      ></div>

      <div className="flex items-center mb-2">
        <div className="mr-2 p-1.5 rounded-md bg-primary/10">{icon}</div>
        <div className="text-xs text-muted-foreground">{title}</div>
      </div>

      <div className="mb-1">{mainContent}</div>

      {progressValue !== undefined && (
        <Progress
          value={progressValue}
          className="h-1.5 mb-2"
          style={{
            background: `${currentTheme.secondary}`,
            overflow: "hidden",
          }}
        />
      )}

      <div className="flex justify-between text-xs text-muted-foreground">
        {footerContent}
      </div>
    </Card>
  );
};

export default StatsCards;
