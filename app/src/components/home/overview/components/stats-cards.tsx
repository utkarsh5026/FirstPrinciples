import { useEffect, useState, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { BookCopy, Flame, Clock, Trophy, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/hooks/ui/use-theme";
import { formatNumber } from "@/components/analytics/utils";
import useGlobalMetrics from "@/hooks/section/useGlobalMetrics";
import { formatTimeInMs } from "@/utils/time";
import { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import { useReadingHistory } from "@/hooks";

interface StatsCardsProps {
  nextMilestone: { target: number; progress: number };
}

/**
 * 📊 StatsCards Component
 *
 * A sleek, minimalist dashboard component that displays key reading statistics.
 * Features elegant animations, responsive design, and clear visual hierarchy.
 */
const StatsCards: React.FC<StatsCardsProps> = ({ nextMilestone }) => {
  const [todayTimeSpent, setTodayTimeSpent] = useState(0);
  const { history } = useReadingHistory();
  const { totalWordsRead, streak, documents } = useGlobalMetrics();
  const { currentTheme } = useTheme();

  useEffect(() => {
    const fetchTodayTimeSpent = async () => {
      const today = new Date();
      const timeSpent = getTimeSpentOnDay(today, history);
      setTodayTimeSpent(timeSpent);
    };
    fetchTodayTimeSpent();
  }, [history]);

  const totalTimeSpent = useMemo(
    () => history.reduce((total, reading) => total + reading.timeSpent, 0),
    [history]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Reading Progress */}
      <StatCard
        variants={itemVariants}
        icon={<BookCopy className="h-4 w-4" />}
        title="Progress"
        value={`${Math.round((documents.read / documents.available) * 100)}%`}
        progressValue={(documents.read / documents.available) * 100}
        firstDetail={`${documents.read} read`}
        secondDetail={`${documents.available - documents.read} left`}
        accentColor={currentTheme.primary}
      />

      {/* Reading Streak */}
      <StatCard
        variants={itemVariants}
        icon={<Flame className="h-4 w-4" />}
        title="Streak"
        value={streak.currentStreak.toString()}
        suffix="days"
        firstDetail={`Best: ${streak.longestStreak} days`}
        secondDetail={streak.currentStreak > 0 ? "Keep it up!" : "Start today!"}
        showShine={streak.currentStreak >= 3}
        accentColor="#FF5757"
      />

      <StatCard
        variants={itemVariants}
        icon={<Clock className="h-4 w-4" />}
        title="Reading Time"
        value={formatTimeInMs(totalTimeSpent || 0)}
        firstDetail={`~${formatNumber(totalWordsRead)} words`}
        secondDetail={`Today: ${formatTimeInMs(todayTimeSpent || 0)}`}
        accentColor="#3B82F6"
      />

      {/* Next Milestone */}
      <StatCard
        variants={itemVariants}
        icon={<Trophy className="h-4 w-4" />}
        title="Next Goal"
        value={nextMilestone.target.toString()}
        suffix="docs"
        progressValue={(nextMilestone.progress / nextMilestone.target) * 100}
        firstDetail={`${nextMilestone.progress}/${nextMilestone.target}`}
        secondDetail={`${nextMilestone.target - nextMilestone.progress} to go`}
        accentColor="#FFAD33"
      />
    </motion.div>
  );
};

interface StatCardProps {
  variants: Variants;
  icon: React.ReactNode;
  title: string;
  value: string;
  suffix?: string;
  progressValue?: number;
  firstDetail: string;
  secondDetail: string;
  showShine?: boolean;
  accentColor: string;
}

/**
 * Individual stat card with clean design and subtle animations
 */
const StatCard: React.FC<StatCardProps> = ({
  variants,
  icon,
  title,
  value,
  suffix,
  progressValue,
  firstDetail,
  secondDetail,
  showShine = false,
  accentColor,
}) => {
  return (
    <motion.div
      variants={variants}
      className="overflow-hidden relative bg-card rounded-2xl border border-border/40 p-3 h-full hover:border-primary/20 transition-colors duration-200 group"
    >
      {/* Card header with icon and title */}
      <div className="flex items-center mb-2">
        <div
          className="mr-2 p-1.5 rounded-md flex-shrink-0"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
        <div className="text-xs text-muted-foreground font-medium">{title}</div>
      </div>

      {/* Main value with optional suffix */}
      <div className="flex items-baseline mb-2 relative font-cascadia-code">
        <span className="text-lg font-bold">{value}</span>
        {suffix && (
          <span className="text-muted-foreground text-xs ml-1">{suffix}</span>
        )}

        {/* Shine effect for streak */}
        {showShine && (
          <motion.div
            className="absolute -right-1 -top-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
          </motion.div>
        )}
      </div>

      {/* Progress bar if needed */}
      {progressValue !== undefined && (
        <div className="mb-2">
          <Progress value={progressValue} className="h-1.5 opacity-50" />
        </div>
      )}

      {/* Card footer with details */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{firstDetail}</span>
        <span
          className="group-hover:text-primary transition-colors duration-200"
          style={{
            color: secondDetail.includes("to go") ? `${accentColor}90` : "",
          }}
        >
          {secondDetail}
        </span>
      </div>

      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${accentColor}40 0%, transparent 70%)`,
          borderRadius: "inherit",
        }}
      />
    </motion.div>
  );
};

const getTimeSpentOnDay = (date: Date, readings: ReadingHistoryItem[]) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return readings
    .filter((reading) => {
      const readDate = new Date(reading.lastReadAt);
      return readDate >= startOfDay && readDate <= endOfDay;
    })
    .reduce((total, reading) => total + reading.timeSpent, 0);
};

export default StatsCards;
