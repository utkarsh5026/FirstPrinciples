import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AchievementsContext } from "./AchievmentsContext";
import {
  enhancedAchievementService,
  type EnhancedAchievement,
} from "@/services/analytics/AchievmentService";
import { AchievementNotification } from "@/components/achievements/AchievmentsNotification";
import { useXP } from "../xp/XpContext";
import { readingStatsService } from "@/services/analytics/ReadingStatsService";

interface EnhancedAchievementsProviderProps {
  children: ReactNode;
}

/**
 * Enhanced Achievements Provider
 *
 * This provider manages the state of achievements, handles notifications for new achievements,
 * and provides achievement-related functions to the entire application through context.
 */
export const EnhancedAchievementsProvider: React.FC<
  EnhancedAchievementsProviderProps
> = ({ children }) => {
  const { addXP, refreshXPStats } = useXP();

  // State for achievements and stats
  const [achievements, setAchievements] = useState<EnhancedAchievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<EnhancedAchievement[]>(
    []
  );
  const [currentLevelUp, setCurrentLevelUp] = useState<{
    previousLevel: number;
    newLevel: number;
    xpGained: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAchievementNotification, setShowAchievementNotification] =
    useState(false);
  const [currentNotification, setCurrentNotification] =
    useState<EnhancedAchievement | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<
    EnhancedAchievement[]
  >([]);

  const formatedAchievements = useCallback(
    (achievements: EnhancedAchievement[]) => {
      return achievements.map((achievement) => ({
        ...achievement,
        tier: achievement.tier !== undefined ? achievement.tier : "bronze",
        category:
          achievement.category !== undefined
            ? achievement.category
            : "challenges",
      }));
    },
    []
  );

  /**
   * Load achievements data and stats
   */
  const loadAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const allAchievements = formatedAchievements(
        await enhancedAchievementService.getAchievements()
      );
      setAchievements(allAchievements);

      const newlyUnlocked = formatedAchievements(
        await enhancedAchievementService.getNewAchievements()
      );

      setNewAchievements(newlyUnlocked);

      const stats = await readingStatsService.getStats();
      if (stats.recentLevelUp) {
        setCurrentLevelUp({
          previousLevel: stats.recentLevelUp.previousLevel,
          newLevel: stats.recentLevelUp.newLevel,
          xpGained: stats.recentLevelUp.xpGained,
        });
      }

      console.log(newlyUnlocked);
      if (newlyUnlocked.length > 0) {
        setNotificationQueue(newlyUnlocked);
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  }, [enhancedAchievementService, formatedAchievements]);

  /**
   * Check for new achievements based on recent activity
   */
  const checkAchievements = useCallback(async () => {
    try {
      const result = await enhancedAchievementService.checkAchievements();

      // If new achievements were unlocked, update state and show notifications
      if (result.newlyUnlockedAchievements.length > 0) {
        setAchievements(result.updatedAchievements);
        setNewAchievements((prev) => [
          ...prev,
          ...result.newlyUnlockedAchievements,
        ]);
        setNotificationQueue((prev) => [
          ...prev,
          ...result.newlyUnlockedAchievements,
        ]);

        for (const achievement of result.newlyUnlockedAchievements) {
          await addXP(achievement.xpReward, `achievement_${achievement.id}`);
        }
      } else if (result.totalXpEarned > 0) {
        // If XP was earned but no new achievements, still update achievements
        setAchievements(result.updatedAchievements);
        await refreshXPStats();

        // Check if level up occurred
        const stats = await readingStatsService.getStats();
        if (stats.recentLevelUp) {
          setCurrentLevelUp({
            previousLevel: stats.recentLevelUp.previousLevel,
            newLevel: stats.recentLevelUp.newLevel,
            xpGained: stats.recentLevelUp.xpGained,
          });
        }
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  }, [enhancedAchievementService, addXP, refreshXPStats]);

  /**
   * Handle achievement notifications
   */
  useEffect(() => {
    // If we have notifications in the queue and aren't currently showing one
    if (notificationQueue.length > 0 && !showAchievementNotification) {
      // Get the next achievement to show
      const nextAchievement = notificationQueue[0];
      setCurrentNotification(nextAchievement);
      setShowAchievementNotification(true);

      // Remove from queue
      setNotificationQueue((prev) => prev.slice(1));
    }
  }, [notificationQueue, showAchievementNotification]);

  /**
   * Load achievements on mount
   */
  useEffect(() => {
    loadAchievements();

    // Set up event listener for page visibility to check achievements when user returns
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAchievements();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadAchievements, checkAchievements]);

  /**
   * Mark an achievement as acknowledged
   */
  const acknowledgeAchievement = useCallback(
    async (id: string) => {
      try {
        await enhancedAchievementService.acknowledgeAchievement(id);
        setNewAchievements((prev) => prev.filter((a) => a.id !== id));
      } catch (error) {
        console.error("Error acknowledging achievement:", error);
      }
    },
    [enhancedAchievementService]
  );

  /**
   * Mark all achievements as acknowledged
   */
  const acknowledgeAllAchievements = useCallback(async () => {
    try {
      await Promise.all(
        newAchievements.map((a) =>
          enhancedAchievementService.acknowledgeAchievement(a.id)
        )
      );
      setNewAchievements([]);
    } catch (error) {
      console.error("Error acknowledging all achievements:", error);
    }
  }, [newAchievements, enhancedAchievementService]);

  /**
   * Acknowledge level up notification
   */
  const acknowledgeLevelUp = useCallback(() => {
    setCurrentLevelUp(null);
  }, []);

  /**
   * Handle when an achievement notification is closed
   */
  const handleNotificationClosed = useCallback(() => {
    setShowAchievementNotification(false);

    // Auto-acknowledge the achievement
    if (currentNotification) {
      acknowledgeAchievement(currentNotification.id);
    }
  }, [currentNotification, acknowledgeAchievement]);

  /**
   * Get achievements filtered by category
   */
  const getAchievementsByCategory = useCallback(
    async (category: string) => {
      return achievements.filter((a) => a.category === category);
    },
    [achievements]
  );

  /**
   * Calculate category completion percentages
   */
  const getCategoryCompletion = useCallback(() => {
    const categories = {} as Record<
      string,
      {
        total: number;
        completed: number;
        percentage: number;
      }
    >;

    achievements.forEach((achievement) => {
      if (!categories[achievement.category]) {
        categories[achievement.category] = {
          total: 0,
          completed: 0,
          percentage: 0,
        };
      }

      categories[achievement.category].total++;

      if (achievement.unlockedAt !== null) {
        categories[achievement.category].completed++;
      }
    });

    // Calculate percentages
    Object.keys(categories).forEach((category) => {
      const { total, completed } = categories[category];
      categories[category].percentage = Math.round((completed / total) * 100);
    });

    return categories;
  }, [achievements]);

  /**
   * Reset all achievements (for testing)
   */
  const resetAchievements = useCallback(async () => {
    try {
      await enhancedAchievementService.resetAchievements();
      loadAchievements();
    } catch (error) {
      console.error("Error resetting achievements:", error);
    }
  }, [enhancedAchievementService, loadAchievements]);

  /**
   * Create context value
   */
  const contextValue = useMemo(
    () => ({
      achievements,
      newAchievements,
      currentLevelUp,
      loading,
      hasNewAchievements: newAchievements.length > 0 || currentLevelUp !== null,
      loadAchievements,
      checkAchievements,
      acknowledgeAchievement,
      acknowledgeLevelUp,
      acknowledgeAllAchievements,
      getAchievementsByCategory,
      getCategoryCompletion,
      resetAchievements,
    }),
    [
      achievements,
      newAchievements,
      currentLevelUp,
      loading,
      loadAchievements,
      checkAchievements,
      acknowledgeAchievement,
      acknowledgeLevelUp,
      acknowledgeAllAchievements,
      getAchievementsByCategory,
      getCategoryCompletion,
      resetAchievements,
    ]
  );

  console.log(currentNotification);

  return (
    <AchievementsContext.Provider value={contextValue}>
      {children}

      {/* Achievement notification popup */}
      {showAchievementNotification && currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          onClose={handleNotificationClosed}
        />
      )}
    </AchievementsContext.Provider>
  );
};

export default EnhancedAchievementsProvider;
