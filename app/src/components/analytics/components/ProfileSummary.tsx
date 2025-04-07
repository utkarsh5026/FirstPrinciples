import React from "react";
import { BookOpen, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReadingStats } from "@/utils/ReadingAnalyticsService";
import type { ReadingLevel } from "@/components/analytics/levels";
import {
  formatDate,
  formatReadingTime,
  formatNumber,
  getStreakEmoji,
} from "@/components/analytics/utils";

interface ProfileSummaryProps {
  stats: ReadingStats;
  level: ReadingLevel;
  nextLevel?: ReadingLevel;
  progress: number;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({
  stats,
  level,
  nextLevel,
  progress,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 px-4">
      {/* Level & XP Card */}
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/5 border-primary/20 rounded-2xl">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Reading Level</span>
            <Badge
              variant="secondary"
              className="bg-primary/20 text-primary border-none"
            >
              Level {stats.level}
            </Badge>
          </div>

          <div className="mb-2">
            <h3 className="text-lg font-bold text-primary">{level.title}</h3>
            <div className="text-xs text-muted-foreground mb-1">
              {nextLevel
                ? `${stats.totalXP} / ${nextLevel.requiredXP} XP to Level ${
                    stats.level + 1
                  }`
                : `${stats.totalXP} XP - Max Level!`}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            <div className="font-semibold text-primary mb-1">
              Level Benefits:
            </div>
            <ul className="list-disc list-inside">
              {level.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Reading Stats Summary */}
      <Card className="p-4 border-primary/10 rounded-2xl">
        <div className="flex flex-col h-full justify-between">
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Reading Stats
              </span>
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-lg font-bold">
              {stats.documentsCompleted} Documents
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Total Time</div>
              <div className="font-medium">
                {formatReadingTime(stats.totalReadingTime)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Words Read</div>
              <div className="font-medium">
                {formatNumber(stats.estimatedWordsRead)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Last Session</div>
              <div className="font-medium">
                {formatReadingTime(stats.lastSessionDuration)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Completion</div>
              <div className="font-medium">{stats.percentComplete}%</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Streak Card */}
      <Card className="p-4 border-primary/10 rounded-2xl">
        <div className="flex flex-col h-full justify-between">
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Reading Streak
              </span>
              <Flame className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center mt-1">
              <h3 className="text-2xl font-bold">{stats.currentStreak}</h3>
              <span className="text-xl ml-1">
                {getStreakEmoji(stats.currentStreak)}
              </span>
              <span className="text-xs text-muted-foreground ml-2">days</span>
            </div>
          </div>

          <div className="flex flex-col text-sm">
            <div className="flex items-center justify-between border-t border-border/50 pt-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Longest Streak
              </span>
              <span className="font-medium">{stats.longestStreak} days</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">Categories</span>
              <span className="font-medium">
                {stats.categoriesExplored.size}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">Last Read</span>
              <span className="font-medium">
                {stats.lastReadAt ? formatDate(stats.lastReadAt) : "Never"}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSummary;
