import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { type EnhancedAchievement } from "@/services/analytics/AchievmentService";
import { Badge } from "@/components/ui/badge";
import { categoryStyles, getAchievementIcon, tierStyles } from "./assets";

interface AchievementCardProps {
  achievement: EnhancedAchievement;
  className?: string;
  onClick?: () => void;
  showAnimation?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  className,
  onClick,
  showAnimation = true,
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(showAnimation);
  const isUnlocked = achievement.unlockedAt !== null;
  const tierStyle = tierStyles[achievement.tier];

  const categoryStyle = categoryStyles[achievement.category];

  const progressPercentage = Math.min(
    100,
    Math.round((achievement.progress / achievement.maxProgress) * 100)
  );

  const formatUnlockDate = (timestamp: number | null) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
    });
  };

  const isHidden = achievement.secret && !isUnlocked;

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showAnimation]);

  return (
    <motion.div
      initial={shouldAnimate ? { y: 20, opacity: 0 } : false}
      animate={shouldAnimate ? { y: 0, opacity: 1 } : false}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
      className={cn(
        "border rounded-2xl p-4 relative overflow-hidden transition-all shadow-sm",
        isUnlocked
          ? `${tierStyle.border} ${tierStyle.background} ${tierStyle.shadow}`
          : "bg-card border-border",
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className={cn(
            "p-2 rounded-lg",
            isUnlocked
              ? `${categoryStyle.color} bg-background/80`
              : "bg-secondary/80"
          )}
        >
          <div className="h-6 w-6">{getAchievementIcon(achievement.icon)}</div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3
              className={cn(
                "font-semibold text-base",
                isUnlocked ? tierStyle.textColor : "text-foreground/90"
              )}
            >
              {isHidden ? "Hidden Achievement" : achievement.title}
            </h3>

            <Badge
              variant="outline"
              className={cn("ml-2 text-xs", tierStyle.badgeColor)}
            >
              {achievement.tier}
            </Badge>
          </div>

          <p className="text-sm text-foreground/70 mt-1">
            {isHidden
              ? "Complete special actions to unlock this achievement"
              : achievement.description}
          </p>

          {isUnlocked && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
              <Clock className="h-3.5 w-3.5" />
              <span>Unlocked {formatUnlockDate(achievement.unlockedAt)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-background rounded-full h-2.5 mb-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={cn(
            "h-full rounded-full",
            isUnlocked ? categoryStyle.color : "bg-primary/40"
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
            isUnlocked ? tierStyle.textColor : "text-foreground/60"
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

      {shouldAnimate && isUnlocked && (
        <motion.div
          className="absolute inset-0 bg-white dark:bg-white pointer-events-none"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        />
      )}
    </motion.div>
  );
};

export default AchievementCard;
