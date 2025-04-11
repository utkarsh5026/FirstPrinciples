import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Trophy,
  BookText,
  Flame,
  Compass,
  Clock,
  Zap,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type EnhancedAchievement } from "@/services/analytics/AchievmentService";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AchievementNotificationProps {
  achievement: EnhancedAchievement;
  onClose: () => void;
  autoCloseDelay?: number;
}

const tierColors = {
  bronze:
    "bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200",
  silver:
    "bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-800/30 dark:border-slate-600 dark:text-slate-200",
  gold: "bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-200",
  platinum:
    "bg-indigo-50 border-indigo-300 text-indigo-900 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-200",
};

const getIconForCategory = (category: string) => {
  switch (category) {
    case "reading_volume":
      return <BookText className="h-5 w-5" />;
    case "reading_streaks":
      return <Flame className="h-5 w-5" />;
    case "exploration":
      return <Compass className="h-5 w-5" />;
    case "mastery":
      return <Trophy className="h-5 w-5" />;
    case "time_spent":
      return <Clock className="h-5 w-5" />;
    case "challenges":
      return <Zap className="h-5 w-5" />;
    default:
      return <Award className="h-5 w-5" />;
  }
};

export const AchievementNotification = ({
  achievement,
  onClose,
  autoCloseDelay = 7000, // Default 7 seconds
}: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const tierColor = tierColors[achievement.tier];

  useEffect(() => {
    // Animation sequence: wait a moment, then become visible
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    // Auto-close after delay
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      // Wait for exit animation before calling onClose
      setTimeout(onClose, 500);
    }, autoCloseDelay);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [achievement, autoCloseDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for exit animation before calling onClose
    setTimeout(onClose, 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-x-0 bottom-0 sm:bottom-auto sm:top-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="pointer-events-auto w-full max-w-sm"
          >
            <Card
              className={cn("border-2 shadow-lg overflow-hidden", tierColor)}
            >
              <div className="relative p-4">
                {/* Animated background decorations */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.05, scale: 1.5 }}
                    transition={{ duration: 1.5 }}
                    className="absolute -right-20 -bottom-20"
                  >
                    <Trophy className="w-40 h-40" />
                  </motion.div>
                </div>

                {/* Close button */}
                <button
                  title="Close"
                  onClick={handleClose}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                  {/* Achievement icon with animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      delay: 0.2,
                      duration: 0.8,
                    }}
                    className={cn(
                      "p-3 rounded-full mb-3",
                      achievement.tier === "bronze"
                        ? "bg-amber-200 dark:bg-amber-800"
                        : achievement.tier === "silver"
                        ? "bg-slate-200 dark:bg-slate-700"
                        : achievement.tier === "gold"
                        ? "bg-yellow-200 dark:bg-yellow-800"
                        : "bg-indigo-200 dark:bg-indigo-800"
                    )}
                  >
                    {getIconForCategory(achievement.category)}
                  </motion.div>

                  {/* Achievement title with animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Badge className="mb-2 px-2 py-0.5 bg-background/80 text-foreground">
                      {achievement.tier.toUpperCase()} ACHIEVEMENT
                    </Badge>

                    <h3 className="text-lg font-bold mb-1">
                      {achievement.title}
                    </h3>

                    <p className="text-sm mb-2">{achievement.description}</p>

                    <div className="flex justify-center items-center gap-1 text-xs">
                      <Zap className="h-3.5 w-3.5" />
                      <span>+{achievement.xpReward} XP</span>
                    </div>
                  </motion.div>

                  {/* Completion animation */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="w-full mt-4"
                  >
                    <Progress value={100} className="h-1.5" />
                  </motion.div>
                </div>
              </div>

              {/* Button to acknowledge */}
              <div className="p-3 bg-background/50 flex justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={handleClose}
                >
                  <Trophy className="h-3.5 w-3.5 mr-1.5" />
                  Awesome!
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AchievementNotification;
