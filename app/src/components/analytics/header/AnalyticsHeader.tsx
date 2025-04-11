import { Zap, Flame, Clock, BookOpenCheck } from "lucide-react";
import { formatReadingTime, formatNumber } from "../utils";
import StatCard from "./StatCard";
import { useReadingMetrics, useDocumentManager } from "@/context";

interface AnalyticsHeaderProps {
  xpProgress: number;
  xpToNextLevel: number;
  streakEmoji: string;
  currentLevelXP: number;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  xpProgress,
  xpToNextLevel,
  streakEmoji,
  currentLevelXP,
}) => {
  const { metrics } = useReadingMetrics();
  const {
    currentStreak,
    longestStreak,
    totalTimeSpent,
    totalWordsRead,
    documentsCompleted,
  } = metrics;
  const { availableDocuments } = useDocumentManager();

  const completionPercentage =
    (documentsCompleted / availableDocuments.length) * 100;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Level and XP */}
      <StatCard
        title="Reading Level"
        value={-1}
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
            {currentStreak}
            <span className="text-xl ml-1">{streakEmoji}</span>
            <span className="text-muted-foreground text-xs ml-1">days</span>
          </div>
        }
        additionalInfo={[
          <div key="streak-info" className="flex justify-between">
            <span>Best: {longestStreak} days</span>
            {currentStreak > 0 && <span>Keep it up!</span>}
          </div>,
        ]}
        icon={Flame}
      />

      {/* Total Reading Time */}
      <StatCard
        title="Reading Time"
        value={formatReadingTime(totalTimeSpent)}
        additionalInfo={[
          <span key="words-read">
            ~{formatNumber(totalWordsRead)} words read
          </span>,
        ]}
        icon={Clock}
      />

      {/* Documents Completed */}
      <StatCard
        title="Documents Read"
        value={documentsCompleted}
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
