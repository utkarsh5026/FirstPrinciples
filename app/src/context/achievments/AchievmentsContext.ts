// src/context/achievements/EnhancedAchievementsContext.ts
import { createContext, useContext } from "react";
import { type EnhancedAchievement } from "@/services/analytics/AchievmentService";

export type AchievementsContextType = {
  achievements: EnhancedAchievement[];
  newAchievements: EnhancedAchievement[];
  currentLevelUp: {
    previousLevel: number;
    newLevel: number;
    xpGained: number;
  } | null;
  loading: boolean;
  hasNewAchievements: boolean;
  loadAchievements: () => Promise<void>;
  checkAchievements: () => Promise<void>;
  acknowledgeAchievement: (id: string) => Promise<void>;
  acknowledgeLevelUp: () => void;
  acknowledgeAllAchievements: () => Promise<void>;
  getAchievementsByCategory: (
    category: string
  ) => Promise<EnhancedAchievement[]>;
  getCategoryCompletion: () => Record<
    string,
    {
      total: number;
      completed: number;
      percentage: number;
    }
  >;
  resetAchievements: () => Promise<void>;
};

// Create the context with a default undefined value
export const AchievementsContext = createContext<
  AchievementsContextType | undefined
>(undefined);

/**
 * useEnhancedAchievements - Custom hook to use the enhanced achievements context
 *
 * This hook provides access to the rich achievements system, including:
 * - Tiered achievements (bronze, silver, gold, platinum)
 * - Achievement categories
 * - Notifications for newly unlocked achievements
 * - Progress tracking and statistics
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
