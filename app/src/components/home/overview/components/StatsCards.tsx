import React from "react";
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
  const { currentTheme } = useTheme();
  const milestoneProgress =
    (nextMilestone.progress / nextMilestone.target) * 100;
  const streakEmoji =
    stats.currentStreak >= 7 ? "🔥" : stats.currentStreak >= 3 ? "🔆" : "✨";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Reading Progress */}
      <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
        {/* Decorative accent */}
        <div
          className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primary}, transparent)`,
          }}
        ></div>

        <div className="flex items-center mb-2">
          <div className="mr-2 p-1.5 rounded-md bg-primary/10">
            <BookCopy className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xs text-muted-foreground">Overall Progress</div>
        </div>

        <div className="flex items-baseline mb-1">
          <span className="text-2xl font-bold">{completionPercentage}%</span>
          <span className="text-muted-foreground text-xs ml-1">complete</span>
        </div>

        <Progress
          value={completionPercentage}
          className="h-1.5 mb-2"
          style={{
            background: `${currentTheme.secondary}`,
            overflow: "hidden",
          }}
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{readingHistory.length} read</span>
          <span>{unreadDocs} left</span>
        </div>
      </Card>

      {/* Reading Streak */}
      <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
        {/* Decorative accent */}
        <div
          className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primary}, transparent)`,
          }}
        ></div>

        <div className="flex items-center mb-2">
          <div className="mr-2 p-1.5 rounded-md bg-primary/10">
            <Flame className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xs text-muted-foreground">Current Streak</div>
        </div>

        <div className="flex items-center mb-3">
          <span className="text-2xl font-bold">{stats.currentStreak}</span>
          <span className="text-xl ml-1">{streakEmoji}</span>
          <span className="text-muted-foreground text-xs ml-1">days</span>
        </div>

        <div className="text-xs text-muted-foreground flex justify-between">
          <span>Best: {stats.longestStreak} days</span>
          {stats.currentStreak > 0 && <span>Keep it up!</span>}
        </div>
      </Card>

      {/* Reading Time */}
      <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
        {/* Decorative accent */}
        <div
          className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primary}, transparent)`,
          }}
        ></div>

        <div className="flex items-center mb-2">
          <div className="mr-2 p-1.5 rounded-md bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xs text-muted-foreground">Total Reading</div>
        </div>

        <div className="flex mb-3">
          <span className="text-2xl font-bold">
            {formatReadingTime(stats.totalReadingTime)}
          </span>
        </div>

        <div className="text-xs text-muted-foreground flex justify-between">
          <span>~{formatNumber(stats.estimatedWordsRead)} words</span>
          <span>
            Today: {formatReadingTime(stats.lastSessionDuration || 0)}
          </span>
        </div>
      </Card>

      {/* Next Milestone */}
      <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
        {/* Decorative accent */}
        <div
          className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primary}, transparent)`,
          }}
        ></div>

        <div className="flex items-center mb-2">
          <div className="mr-2 p-1.5 rounded-md bg-primary/10">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xs text-muted-foreground">Next Milestone</div>
        </div>

        <div className="flex items-baseline mb-1">
          <span className="text-2xl font-bold">{nextMilestone.target}</span>
          <span className="text-muted-foreground text-xs ml-1">docs</span>
        </div>

        <Progress
          value={milestoneProgress}
          className="h-1.5 mb-2"
          style={{
            background: `${currentTheme.secondary}`,
            overflow: "hidden",
          }}
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {nextMilestone.progress} / {nextMilestone.target}
          </span>
          <span>{nextMilestone.target - nextMilestone.progress} to go</span>
        </div>
      </Card>
    </div>
  );
};

export default StatsCards;
