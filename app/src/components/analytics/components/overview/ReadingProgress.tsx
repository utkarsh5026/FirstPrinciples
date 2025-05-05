import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  User,
  BookOpen,
  Clock,
  BookText,
  Award,
  Flame,
  BarChart2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useHistoryStore } from "@/stores";
import useGlobalMetrics from "@/hooks/section/useGlobalMetrics";
import { formatTimeInMs } from "@/utils/time";
import { formatNumber, getStreakEmoji } from "@/components/analytics/utils";
import CardContainer from "@/components/shared/container/CardContainer";

/**
 * 📊 Enhanced Reading Progress Component
 *
 * A visually appealing dashboard that displays key reading statistics with beautiful
 * animations and a mobile-optimized layout.
 *
 * This component displays reading progress stats including:
 * - Documents read and completion percentage
 * - Reading time statistics
 * - User's current reading level and XP progress
 * - Reading streak information
 * - Word count statistics
 */

// Create a reusable StatCard component
interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  value: React.ReactNode;
  valueAddon?: React.ReactNode;
  subtitle: string;
  valueClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconColor,
  title,
  value,
  valueAddon,
  subtitle,
  valueClassName = "text-2xl font-bold",
}) => (
  <motion.div
    className="bg-card rounded-2xl p-4 border border-primary/10 hover:border-primary/30 transition-colors"
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center mb-2">
      <Icon className={`h-4 w-4 mr-2 ${iconColor}`} />
      <span className="text-xs text-muted-foreground">{title}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className={valueClassName}>{value}</span>
      {valueAddon}
    </div>
    <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
  </motion.div>
);

const ReadingProgress: React.FC = () => {
  const readingHistory = useHistoryStore((state) => state.readingHistory);
  const { currentStreak, longestStreak } = useHistoryStore(
    (state) => state.streak
  );
  const { totalWordsRead, totalTimeSpent, documents } = useGlobalMetrics();

  // Calculate reading level based on words read
  const readingLevel = useMemo(() => {
    if (totalWordsRead < 5000) return 1;
    if (totalWordsRead < 15000) return 2;
    if (totalWordsRead < 30000) return 3;
    if (totalWordsRead < 50000) return 4;
    if (totalWordsRead < 100000) return 5;
    return Math.floor(1 + Math.log(totalWordsRead / 1000) / Math.log(2));
  }, [totalWordsRead]);

  // Calculate XP and progress to next level
  const { xp, nextLevelXp, progressPercentage } = useMemo(() => {
    const baseXp = totalWordsRead / 100;
    const currentLevelXp = Math.pow(2, readingLevel - 1) * 1000;
    const nextLevelXp = Math.pow(2, readingLevel) * 1000;
    const progressPercentage = Math.min(
      100,
      ((baseXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
    );

    return {
      xp: Math.floor(baseXp),
      nextLevelXp: Math.floor(nextLevelXp),
      progressPercentage: Math.max(0, Math.floor(progressPercentage)),
    };
  }, [totalWordsRead, readingLevel]);

  // Calculate average session time
  const avgSessionTime = useMemo(() => {
    if (documents.read === 0) return 0;
    return Math.round(totalTimeSpent / documents.read);
  }, [totalTimeSpent, documents.read]);

  // Calculate reading frequency
  const readingFrequency = useMemo(() => {
    if (readingHistory.length === 0) return "New Reader";

    const now = Date.now();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

    const uniqueDaysRead = new Set(
      readingHistory
        .filter((item) => now - item.lastReadAt < ONE_WEEK)
        .map((item) => new Date(item.lastReadAt).toDateString())
    ).size;

    if (uniqueDaysRead >= 5) return "Daily Reader";
    if (uniqueDaysRead >= 3) return "Frequent Reader";
    if (uniqueDaysRead >= 1) return "Casual Reader";
    return "Occasional Reader";
  }, [readingHistory]);

  return (
    <CardContainer
      title="Reading Progress"
      icon={User}
      variant="subtle"
      description="Track your reading progress and achievements"
      headerAction={
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-none rounded-2xl"
        >
          Level {readingLevel}
        </Badge>
      }
    >
      <div className="space-y-6">
        {/* XP Progress Bar */}
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Reader Progress</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatNumber(xp)} / {formatNumber(nextLevelXp)} XP
            </span>
          </div>

          <Progress value={progressPercentage} className="h-2 bg-primary/10" />

          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Level {readingLevel}</span>
            <span>Level {readingLevel + 1}</span>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Reading Streak */}
          <StatCard
            icon={Flame}
            iconColor="text-amber-500"
            title="Current Streak"
            value={currentStreak}
            valueClassName="text-lg font-bold"
            valueAddon={
              <span className="text-sm">{getStreakEmoji(currentStreak)}</span>
            }
            subtitle={`Best: ${longestStreak} days`}
          />

          {/* Reading Frequency */}
          <StatCard
            icon={BarChart2}
            iconColor="text-violet-500"
            title="Reading Habit"
            value={readingFrequency}
            valueClassName="text-lg font-bold"
            subtitle="Based on your weekly activity"
          />

          {/* Documents Read */}
          <StatCard
            icon={BookOpen}
            iconColor="text-blue-500"
            title="Documents"
            value={documents.read}
            valueAddon={
              <span className="text-sm text-muted-foreground">
                / {documents.available}
              </span>
            }
            subtitle={`${Math.round(
              (documents.read / documents.available) * 100
            )}% completion`}
          />

          {/* Reading Time */}
          <StatCard
            icon={Clock}
            iconColor="text-green-500"
            title="Time Spent"
            value={formatTimeInMs(totalTimeSpent)}
            valueClassName="text-lg font-bold truncate"
            subtitle={`Avg: ${formatTimeInMs(avgSessionTime)} per document`}
          />
        </div>

        {/* Words Read - Highlight Box */}
        <motion.div
          className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center justify-between"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <div>
            <div className="flex items-center">
              <BookText className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Total Words Read</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Keep reading to increase your knowledge
            </div>
          </div>
          <div className="text-2xl font-bold">
            {formatNumber(totalWordsRead)}
          </div>
        </motion.div>
      </div>
    </CardContainer>
  );
};

export default ReadingProgress;
