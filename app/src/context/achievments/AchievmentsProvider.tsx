import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useServices } from "../services/ServiceContext";
import { AchievementsContext } from "./AchievmentsContext";
import { ReadingAchievement } from "@/services/analytics/ReadingStatsService";

interface AchievementsProviderProps {
  children: ReactNode;
}

/**
 * 🏆 AchievementsProvider
 *
 * This magical component keeps track of all your reading accomplishments!
 *
 * It's like having a personal trophy case that celebrates your reading journey.
 * Whenever you unlock new achievements or level up, this provider makes sure
 * those special moments are captured and displayed throughout the app.
 *
 * Think of it as your achievement headquarters - tracking your progress,
 * managing notifications for new accomplishments, and letting you acknowledge
 * when you've seen your awesome new badges and level-ups!
 */
export const AchievementsProvider: React.FC<AchievementsProviderProps> = ({
  children,
}) => {
  const { readingStatsService } = useServices();

  /**
   * 🎖️ Tracks all achievements you've earned on your reading journey
   */
  const [achievements, setAchievements] = useState<ReadingAchievement[]>([]);

  /**
   * ✨ Keeps track of newly unlocked achievements you haven't seen yet
   */
  const [newAchievements, setNewAchievements] = useState<ReadingAchievement[]>(
    []
  );

  /**
   * 📈 Remembers when you've recently leveled up your reading skills
   */
  const [currentLevelUp, setCurrentLevelUp] = useState<{
    previousLevel: number;
    newLevel: number;
    xpGained: number;
  } | null>(null);

  /**
   * ⏳ Tracks when we're fetching your latest achievements
   */
  const [loading, setLoading] = useState(true);

  /**
   * 🔄 Refreshes all your achievement data
   *
   * Like checking your mailbox for exciting achievement notifications!
   * This function fetches your complete achievement collection, any new
   * unlocks you haven't seen yet, and checks if you've recently leveled up.
   */
  const loadAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const allAchievements = await readingStatsService.getAchievements();
      setAchievements(allAchievements);

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

  /**
   * 🔍 Automatically loads your achievements when the app starts
   *
   * Like having your trophy case automatically updated with your latest wins!
   */
  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  /**
   * 👀 Marks a specific achievement as seen
   *
   * Like nodding to say "I've seen this shiny new badge, thanks!"
   * This removes it from your notification queue.
   */
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

  /**
   * 🎉 Marks your level up celebration as seen
   *
   * Like saying "Thanks for the confetti, I'm ready to continue reading!"
   */
  const acknowledgeLevelUp = useCallback(() => {
    setCurrentLevelUp(null);
  }, []);

  /**
   * 🧹 Clears all your achievement notifications at once
   *
   * Like sweeping all your notification cards into a "seen" pile
   * so you can start fresh!
   */
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

  const achievementsData = useMemo(
    () => ({
      achievements,
      newAchievements,
      currentLevelUp,
      loading,
      loadAchievements,
      acknowledgeAchievement,
      acknowledgeLevelUp,
      acknowledgeAll,
      hasNewAchievements: newAchievements.length > 0 || currentLevelUp !== null,
    }),
    [
      achievements,
      newAchievements,
      currentLevelUp,
      loading,
      loadAchievements,
      acknowledgeAchievement,
      acknowledgeLevelUp,
      acknowledgeAll,
    ]
  );

  return (
    <AchievementsContext.Provider value={achievementsData}>
      {children}
    </AchievementsContext.Provider>
  );
};
