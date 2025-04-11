import { ReactNode } from "react";
import { useAchievements as useOriginalAchievements } from "@/hooks/reading/useAchievements";
import { AchievementsContext } from "./AchievmentsContext";

interface AchievementsProviderProps {
  children: ReactNode;
}

/**
 * AchievementsProvider - Provides achievements state and functions to the component tree
 *
 * This provider centralizes all achievements management, making data about unlocked
 * achievements and level-ups available throughout the application.
 */
export const AchievementsProvider: React.FC<AchievementsProviderProps> = ({
  children,
}) => {
  // Use the original hook inside the provider
  const achievementsData = useOriginalAchievements();

  // Provide the hook's return value as context
  return (
    <AchievementsContext.Provider value={achievementsData}>
      {children}
    </AchievementsContext.Provider>
  );
};
