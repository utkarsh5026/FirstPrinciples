import React, { ReactNode, useEffect, useState } from "react";
import { BookCopy, Flame, Clock, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/hooks/ui/use-theme";
import { formatNumber, getStreakEmoji } from "@/components/analytics/utils";
import useGlobalMetrics from "@/hooks/section/useGlobalMetrics";
import { useSectionStore } from "@/stores";
import { formatTimeInMs } from "@/utils/time";

interface StatsCardsProps {
  nextMilestone: { target: number; progress: number };
}

/**
 * 📊 StatsCards
 *
 * A dashboard component that displays key reading statistics in a visually appealing grid.
 * Shows reading progress, streaks, time spent, and milestone tracking to help users
 * visualize their learning journey and stay motivated! ✨
 */
const StatsCards: React.FC<StatsCardsProps> = ({ nextMilestone }) => {
  const [todayTimeSpent, setTodayTimeSpent] = useState(0);
  const { totalWordsRead, totalTimeSpent, streak, documents } =
    useGlobalMetrics();

  const calculateTodayTimeSpent = useSectionStore(
    (state) => state.getTimeSpentOnDay
  );

  useEffect(() => {
    const fetchTodayTimeSpent = async () => {
      const today = new Date();
      const timeSpent = await calculateTodayTimeSpent(today);
      setTodayTimeSpent(timeSpent);
    };
    fetchTodayTimeSpent();
  }, [calculateTodayTimeSpent]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Reading Progress */}
      <ReadingProgress
        completionPercentage={Math.round(
          (documents.read / documents.available) * 100
        )}
        readDocs={documents.read}
        unreadDocs={documents.available - documents.read}
      />

      {/* Reading Streak */}
      <ReadingSreak streak={streak} />

      {/* Reading Time */}
      <ReadingTime
        totalTimeSpent={totalTimeSpent}
        totalWordsRead={totalWordsRead}
        todayTimeSpent={todayTimeSpent}
      />

      {/* Next Milestone */}
      <NextMilestone nextMilestone={nextMilestone} />
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

/**
 * 🎴 StatsCard
 *
 * A beautiful card component used as the building block for all statistics displays.
 * Features a subtle hover effect, decorative accent, and organized layout for
 * displaying metrics in a consistent, attractive way! 💅
 */
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

interface ReadingSreakProps {
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
}
/**
 * 🔥 ReadingSreak
 *
 * Tracks and celebrates the user's consistent reading habits!
 * Shows current streak with fun emoji that changes based on streak length,
 * and displays the user's best streak to encourage beating their record! 💪
 */
const ReadingSreak: React.FC<ReadingSreakProps> = ({ streak }) => {
  const streakEmoji = getStreakEmoji(streak.currentStreak);

  return (
    <StatsCard
      icon={<Flame className="h-4 w-4 text-primary" />}
      title="Current Streak"
      mainContent={
        <div className="flex items-center mb-2">
          <span className="text-2xl font-bold">{streak.currentStreak}</span>
          <span className="text-xl ml-1">{streakEmoji}</span>
          <span className="text-muted-foreground text-xs ml-1">days</span>
        </div>
      }
      footerContent={
        <>
          <span>Best: {streak.longestStreak} days</span>
          {streak.currentStreak > 0 && <span>Keep it up!</span>}
        </>
      }
    />
  );
};

interface ReadingTimeProps {
  totalTimeSpent: number;
  totalWordsRead: number;
  todayTimeSpent: number;
}

/**
 * ⏱️ ReadingTime
 *
 * Showcases the user's dedication to learning through time metrics!
 * Displays total reading time, estimated words read, and today's reading time
 * to help users track their daily and overall investment in knowledge! 📚
 */
const ReadingTime: React.FC<ReadingTimeProps> = ({
  totalTimeSpent,
  totalWordsRead,
  todayTimeSpent,
}) => {
  return (
    <StatsCard
      icon={<Clock className="h-4 w-4 text-primary" />}
      title="Total Reading"
      mainContent={
        <div className="flex mb-2">
          <span className="text-2xl font-bold">
            {formatTimeInMs(totalTimeSpent || 0)}
          </span>
        </div>
      }
      footerContent={
        <>
          <span>~{formatNumber(totalWordsRead)} words</span>
          <span>Today: {formatTimeInMs(todayTimeSpent || 0)}</span>
        </>
      }
    />
  );
};

interface ReadingProgressProps {
  completionPercentage: number;
  readDocs: number;
  unreadDocs: number;
}

/**
 * 📖 ReadingProgress
 *
 * Visualizes the user's journey through their document collection!
 * Shows completion percentage with a progress bar and counts of read vs. unread
 * documents to give a clear picture of overall learning progress! 🎯
 */
const ReadingProgress: React.FC<ReadingProgressProps> = ({
  completionPercentage,
  readDocs,
  unreadDocs,
}) => {
  return (
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
          <span>{readDocs} read</span>
          <span>{unreadDocs} left</span>
        </>
      }
    />
  );
};

interface NextMilestoneProps {
  nextMilestone: { target: number; progress: number };
}

/**
 * 🏆 NextMilestone
 *
 * Gamifies the reading experience with achievement tracking!
 * Shows progress toward the next document count milestone with a visual
 * progress bar to motivate users to keep reading and learning! 🚀
 */
const NextMilestone: React.FC<NextMilestoneProps> = ({ nextMilestone }) => {
  const milestoneProgress =
    (nextMilestone.progress / nextMilestone.target) * 100;

  return (
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
  );
};

export default StatsCards;
