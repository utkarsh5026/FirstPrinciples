import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Flame, Clock, BookOpenCheck, LucideIcon } from "lucide-react";
import { formatReadingTime, formatNumber } from "../utils";
import { ReadingStats } from "@/utils/ReadingAnalyticsService";
import { FileMetadata } from "@/utils/MarkdownLoader";

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  additionalInfo?: ReactNode[];
  progressValue?: number;
  progressLabels?: { left?: ReactNode; right?: ReactNode };
  icon: LucideIcon;
}

/**
 * StatCard component displays a card with a title, value, and optional subtitle, progress bar, and additional information.
 * It also includes a decorative icon.
 *
 * @param {StatCardProps} props - The props for the component.
 * @param {string} props.title - The title of the card.
 * @param {ReactNode} props.value - The value to be displayed on the card.
 * @param {ReactNode} [props.subtitle] - The subtitle of the card.
 * @param {ReactNode[]} [props.additionalInfo] - Additional information to be displayed on the card.
 * @param {number} [props.progressValue] - The value for the progress bar.
 * @param {{ left?: ReactNode; right?: ReactNode }} [props.progressLabels] - Labels for the progress bar.
 * @param {LucideIcon} props.icon - The icon to be displayed on the card.
 *
 * @returns {React.ReactElement} The StatCard component.
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  additionalInfo,
  progressValue,
  progressLabels,
  icon: Icon,
}) => {
  return (
    <Card className="p-4 border-primary/10 relative overflow-hidden rounded-2xl border-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-2 flex items-baseline">
        <span className="text-2xl font-bold">{value}</span>
        {subtitle && (
          <span className="ml-2 text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>

      {progressValue !== undefined && (
        <div className="mt-2">
          <Progress value={progressValue} className="h-1.5" />
        </div>
      )}

      {progressLabels && (
        <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
          {progressLabels.left && <span>{progressLabels.left}</span>}
          {progressLabels.right && <span>{progressLabels.right}</span>}
        </div>
      )}

      {additionalInfo?.map((info, index) => {
        const itemIndex = typeof info === "string" ? info : index;
        const itemKey =
          React.isValidElement(info) && info.key
            ? info.key
            : `info-item-${itemIndex}`;

        return (
          <div key={itemKey} className="mt-2 text-xs text-muted-foreground">
            {info}
          </div>
        );
      })}

      {/* Decorative element */}
      <div className="absolute -right-3 -top-3 opacity-10">
        <Icon className="h-16 w-16 text-primary" />
      </div>
    </Card>
  );
};

interface AnalyticsHeaderProps {
  stats: ReadingStats;
  xpProgress: number;
  xpToNextLevel: number;
  streakEmoji: string;
  completionPercentage: number;
  currentLevelXP: number;
  availableDocuments: FileMetadata[];
}

/**
 * AnalyticsHeader component displays the analytics header.
 * @param {AnalyticsHeaderProps} props - The props for the component.
 * @param {ReadingStats} props.stats - The reading stats.
 * @param {number} props.xpProgress - The XP progress.
 * @param {number} props.xpToNextLevel - The XP to next level.
 * @param {string} props.streakEmoji - The streak emoji.
 * @param {number} props.completionPercentage - The completion percentage.
 * @param {number} props.currentLevelXP - The current level XP.
 * @param {FileMetadata[]} props.availableDocuments - The available documents.
 */
const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  stats,
  xpProgress,
  xpToNextLevel,
  streakEmoji,
  completionPercentage,
  currentLevelXP,
  availableDocuments,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Level and XP */}
      <StatCard
        title="Reading Level"
        value={stats.level}
        subtitle="Level"
        progressValue={xpProgress}
        progressLabels={{
          left: `${currentLevelXP} XP`,
          right: `${xpToNextLevel} XP`,
        }}
        icon={Zap}
      />

      {/* Reading Streak */}
      <StatCard
        title="Current Streak"
        value={
          <div className="flex items-center">
            {stats.currentStreak}
            <span className="text-xl ml-1">{streakEmoji}</span>
            <span className="text-muted-foreground text-xs ml-1">days</span>
          </div>
        }
        additionalInfo={[
          <div key="streak-info" className="flex justify-between">
            <span>Best: {stats.longestStreak} days</span>
            {stats.currentStreak > 0 && <span>Keep it up!</span>}
          </div>,
        ]}
        icon={Flame}
      />

      {/* Total Reading Time */}
      <StatCard
        title="Reading Time"
        value={formatReadingTime(stats.totalReadingTime)}
        additionalInfo={[
          <span key="words-read">
            ~{formatNumber(stats.estimatedWordsRead)} words read
          </span>,
        ]}
        icon={Clock}
      />

      {/* Documents Completed */}
      <StatCard
        title="Documents Read"
        value={stats.documentsCompleted}
        subtitle={`of ${availableDocuments.length}`}
        progressValue={completionPercentage}
        additionalInfo={[
          <span key="completion">{completionPercentage}% complete</span>,
        ]}
        icon={BookOpenCheck}
      />
    </div>
  );
};

export default AnalyticsHeader;
