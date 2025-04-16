import React, { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/context/ThemeProvider";
import { EnhancedAchievementsProvider } from "@/context/achievments/AchievmentsProvider";
import { XPProvider } from "@/context/xp/XpProvider";

interface GlobalProvidersProps {
  children: ReactNode;
}

export const GlobalProviders: React.FC<GlobalProvidersProps> = ({
  children,
}) => {
  return (
    <ThemeProvider>
      <XPProvider>
        <EnhancedAchievementsProvider>{children}</EnhancedAchievementsProvider>
      </XPProvider>
    </ThemeProvider>
  );
};

export default GlobalProviders;
