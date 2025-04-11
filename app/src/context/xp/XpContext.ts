// src/context/xp/XPContext.ts

import { createContext, useContext } from "react";
import { type XPStats } from "@/services/analytics/XpService";

export type XPContextType = {
  xpStats: XPStats;
  isLoading: boolean;
  error: string | null;
  addXP: (amount: number, source: string) => Promise<XPStats>;
  refreshXPStats: () => Promise<void>;
  formatXP: (xp: number) => string;
  acknowledgeLevelUp: () => Promise<void>;
  hasRecentLevelUp: boolean;
};

// Create the context with an undefined default value
export const XPContext = createContext<XPContextType | undefined>(undefined);

/**
 * useXP - Custom hook to access XP functionality
 */
export const useXP = (): XPContextType => {
  const context = useContext(XPContext);

  if (context === undefined) {
    throw new Error("useXP must be used within an XPProvider");
  }

  return context;
};
