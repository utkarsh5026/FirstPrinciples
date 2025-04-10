import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/context/ServiceContext";
import type { ReadingAchievement } from "@/services/analytics/ReadingStatsService";

export const useAchievements = () => {
  const { readingStatsService } = useServices();

  const [achievements, setAchievements] = useState<ReadingAchievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<ReadingAchievement[]>(
    []
  );
  const [currentLevelUp, setCurrentLevelUp] = useState<{
    previousLevel: number;
    newLevel: number;
    xpGained: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const allAchievements = await readingStatsService.getAchievements();
      setAchievements(allAchievements);

      // Get newly unlocked achievements
      const newlyUnlocked = await readingStatsService.getNewAchievements();
      setNewAchievements(newlyUnlocked);

      // Check for level up
      const stats = await readingStatsService.getStats();
      if (stats.recentLevelUp) {
        setCurrentLevelUp({
          previousLevel: stats.recentLevelUp.previousLevel,
          newLevel: stats.recentLevelUp.newLevel,
          xpGained: stats.recentLevelUp.xpGained,
        });
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  }, [readingStatsService]);

  // Initial load
  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Acknowledge an achievement
  const acknowledgeAchievement = useCallback(
    async (id: string) => {
      try {
        await readingStatsService.acknowledgeAchievement(id);
        setNewAchievements((prev) => prev.filter((a) => a.id !== id));
      } catch (error) {
        console.error("Error acknowledging achievement:", error);
      }
    },
    [readingStatsService]
  );

  // Acknowledge level up
  const acknowledgeLevelUp = useCallback(() => {
    setCurrentLevelUp(null);
  }, []);

  // Acknowledge all new achievements and level ups
  const acknowledgeAll = useCallback(async () => {
    try {
      await Promise.all(
        newAchievements.map((a) =>
          readingStatsService.acknowledgeAchievement(a.id)
        )
      );
      setNewAchievements([]);
      setCurrentLevelUp(null);
    } catch (error) {
      console.error("Error acknowledging all achievements:", error);
    }
  }, [newAchievements, readingStatsService]);

  return {
    achievements,
    newAchievements,
    currentLevelUp,
    loading,
    loadAchievements,
    acknowledgeAchievement,
    acknowledgeLevelUp,
    acknowledgeAll,
    hasNewAchievements: newAchievements.length > 0 || currentLevelUp !== null,
  };
};
