import { createContext, useContext } from "react";
import type { ReadingAchievement } from "@/services/analytics/ReadingStatsService";

export type AchievementsContextType = {
  achievements: ReadingAchievement[];
  newAchievements: ReadingAchievement[];
  currentLevelUp: {
    previousLevel: number;
    newLevel: number;
    xpGained: number;
  } | null;
  loading: boolean;
  loadAchievements: () => Promise<void>;
  acknowledgeAchievement: (id: string) => Promise<void>;
  acknowledgeLevelUp: () => void;
  acknowledgeAll: () => Promise<void>;
  hasNewAchievements: boolean;
};

// Create the context with an undefined default value
export const AchievementsContext = createContext<
  AchievementsContextType | undefined
>(undefined);

/**
 * useAchievements - Custom hook to use the achievements context
 *
 * This hook provides access to achievements data and functions.
 * It must be used within an AchievementsProvider.
 */
export const useAchievements = (): AchievementsContextType => {
  const context = useContext(AchievementsContext);

  if (context === undefined) {
    throw new Error(
      "useAchievements must be used within an AchievementsProvider"
    );
  }

  return context;
};
