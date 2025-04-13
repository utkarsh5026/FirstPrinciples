import { Zap, Flame, Clock, BookOpenCheck } from "lucide-react";
import { formatReadingTime, formatNumber, getStreakEmoji } from "../utils";
import StatCard from "./StatCard";
import { useReadingMetrics, useXP } from "@/context";
import { useHistoryStore, useDocumentStore } from "@/stores";

const AnalyticsHeader: React.FC = () => {
  const { metrics } = useReadingMetrics();
  const { totalTimeSpent, totalWordsRead, documentsCompleted } = metrics;
  const { xpStats } = useXP();
  const { currentStreak, longestStreak } = useHistoryStore(
    (state) => state.streak
  );

  const availableDocuments = useDocumentStore(
    (state) => state.availableDocuments
  );

  const completionPercentage =
    availableDocuments.length > 0
      ? Math.round((documentsCompleted / availableDocuments.length) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 animate-in fade-in duration-500">
      {/* Level and XP */}
      <StatCard
        title="Reading Level"
        value={xpStats.level}
        subtitle={`${xpStats.totalXP} XP total`}
        progressValue={(xpStats.currentLevelXP / xpStats.nextLevelXP) * 100}
        progressLabels={{
          left: `${xpStats.currentLevelXP} XP`,
          right: `${xpStats.nextLevelXP} XP needed`,
        }}
        icon={Zap}
        colorScheme="primary"
      />

      {/* Reading Streak */}
      <StatCard
        title="Current Streak"
        value={
          <div className="flex items-center">
            {currentStreak}
            <span className="text-xl ml-1">
              {getStreakEmoji(currentStreak)}
            </span>
            <span className="text-muted-foreground text-xs ml-1">days</span>
          </div>
        }
        additionalInfo={[
          <div key="streak-info" className="flex justify-between">
            <span>Best streak: {longestStreak} days</span>
            {currentStreak > 0 && <span>Keep it up!</span>}
          </div>,
        ]}
        icon={Flame}
        colorScheme="warning"
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
        colorScheme="info"
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
        colorScheme="success"
      />
    </div>
  );
};

export default AnalyticsHeader;
