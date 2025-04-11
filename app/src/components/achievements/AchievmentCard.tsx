import React from "react";
import { ReadingAchievement } from "@/services/analytics/ReadingStatsService";
import {
  Award,
  BookOpen,
  BookText,
  Flame,
  Target,
  Zap,
  Clock,
  CheckCircle2,
  LockIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AchievementCardProps {
  achievement: ReadingAchievement;
  variant?: "default" | "compact" | "detailed";
  className?: string;
  onClick?: () => void;
}

/**
 * AchievementCard Component
 *
 * Displays an individual achievement with its icon, title, description, and progress.
 * Available in three variants: default, compact, and detailed.
 */
export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  variant = "default",
  className,
  onClick,
}) => {
  // Determine if the achievement is unlocked
  const isUnlocked = achievement.unlockedAt !== null;

  // Format the unlock date if available
  const formatUnlockDate = (timestamp: number | null) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // Get the appropriate icon based on achievement category
  const getAchievementIcon = () => {
    switch (achievement.icon) {
      case "BookOpen":
        return <BookOpen />;
      case "BookText":
        return <BookText />;
      case "Flame":
        return <Flame />;
      case "Target":
        return <Target />;
      case "Zap":
        return <Zap />;
      default:
        return <Award />;
    }
  };

  // Calculate progress percentage
  const progressPercentage = Math.min(
    100,
    Math.round((achievement.progress / achievement.maxProgress) * 100)
  );

  // Compact variant
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "border rounded-lg p-3 relative overflow-hidden transition-all",
          isUnlocked
            ? "bg-primary/5 border-primary/20"
            : "bg-card/80 border-border",
          onClick && "cursor-pointer hover:border-primary/30",
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className={cn(
              "p-1 rounded",
              isUnlocked ? "bg-primary/20" : "bg-secondary/80"
            )}
          >
            <div
              className={cn(
                "h-4 w-4",
                isUnlocked ? "text-primary" : "text-foreground/50"
              )}
            >
              {getAchievementIcon()}
            </div>
          </div>
          <h3
            className={cn(
              "font-medium text-sm truncate pr-6",
              !isUnlocked && "text-foreground/70"
            )}
          >
            {achievement.title}
          </h3>
          {isUnlocked ? (
            <div className="absolute top-3 right-3">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
          ) : (
            <div className="absolute top-3 right-3">
              <LockIcon className="h-4 w-4 text-foreground/30" />
            </div>
          )}
        </div>

        <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isUnlocked ? "bg-primary" : "bg-primary/40"
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs mt-1.5">
          <span className="text-foreground/60">
            {achievement.progress} / {achievement.maxProgress}
          </span>
          <span
            className={cn(
              "font-medium",
              isUnlocked ? "text-primary" : "text-foreground/60"
            )}
          >
            {progressPercentage}%
          </span>
        </div>
      </div>
    );
  }

  // Detailed variant
  if (variant === "detailed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "border rounded-xl p-4 relative overflow-hidden transition-all",
          isUnlocked
            ? "bg-primary/10 border-primary/30"
            : "bg-card border-border",
          onClick && "cursor-pointer hover:bg-primary/5",
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className={cn(
              "p-2 rounded-lg",
              isUnlocked ? "bg-primary/20" : "bg-secondary/80"
            )}
          >
            <div
              className={cn(
                "h-6 w-6",
                isUnlocked ? "text-primary" : "text-foreground/40"
              )}
            >
              {getAchievementIcon()}
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-base">{achievement.title}</h3>
            <p className="text-sm text-foreground/70 mt-0.5">
              {achievement.description}
            </p>

            {isUnlocked && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
                <Clock className="h-3.5 w-3.5" />
                <span>Unlocked {formatUnlockDate(achievement.unlockedAt)}</span>
              </div>
            )}
          </div>

          {isUnlocked ? (
            <div className="ml-auto">
              <div className="bg-primary/20 p-1.5 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          ) : (
            <div className="ml-auto">
              <div className="bg-secondary p-1.5 rounded-full">
                <LockIcon className="h-5 w-5 text-foreground/30" />
              </div>
            </div>
          )}
        </div>

        <div className="w-full bg-background rounded-full h-2.5 mb-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
              "h-full rounded-full",
              isUnlocked ? "bg-primary" : "bg-primary/40"
            )}
          />
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-foreground/70">
            Progress: {achievement.progress} / {achievement.maxProgress}
          </span>
          <span
            className={cn(
              "font-medium",
              isUnlocked ? "text-primary" : "text-foreground/60"
            )}
          >
            {progressPercentage}%
          </span>
        </div>

        {isUnlocked && !achievement.acknowledged && (
          <div className="absolute top-0 right-0">
            <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-bl-md">
              New!
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "border rounded-2xl p-4 relative overflow-hidden transition-colors",
        isUnlocked ? "bg-card border-primary/20" : "bg-card/50 border-border",
        onClick && "cursor-pointer hover:bg-primary/5",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "p-2 rounded-md",
            isUnlocked ? "bg-primary/20" : "bg-secondary/80"
          )}
        >
          <div
            className={cn(
              "h-5 w-5",
              isUnlocked ? "text-primary" : "text-foreground/40"
            )}
          >
            {getAchievementIcon()}
          </div>
        </div>

        <div>
          <h3 className="font-medium">{achievement.title}</h3>
          <p className="text-sm text-foreground/70">
            {achievement.description}
          </p>
        </div>

        {isUnlocked ? (
          <div className="ml-auto">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
        ) : (
          <div className="ml-auto">
            <LockIcon className="h-5 w-5 text-foreground/30" />
          </div>
        )}
      </div>

      <div className="w-full bg-secondary rounded-full h-2 mb-2 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isUnlocked ? "bg-primary" : "bg-primary/40"
          )}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-foreground/70">
          Progress: {achievement.progress} / {achievement.maxProgress}
        </span>
        <span className="font-medium">{progressPercentage}%</span>
      </div>

      {isUnlocked && (
        <div className="text-xs flex items-center gap-1.5 mt-2 text-foreground/70">
          <Clock className="h-3.5 w-3.5" />
          <span>Unlocked {formatUnlockDate(achievement.unlockedAt)}</span>
        </div>
      )}

      {isUnlocked && !achievement.acknowledged && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-bl-md">
            New!
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementCard;
