import { xpService } from "@/services/analytics/XpService";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { XPContext } from "./XpContext";
import { type XPStats } from "@/services/analytics/XpService";
import { databaseService } from "@/infrastructure/storage";

interface XPProviderProps {
  children: ReactNode;
}

export const XPProvider: React.FC<XPProviderProps> = ({ children }) => {
  const [xpStats, setXPStats] = useState<XPStats>({
    id: "user_xp_stats",
    totalXP: 0,
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: 500,
    xpProgress: 0,
    recentXPGained: [],
    lastLevelUp: null,
  });

  console.log("XPProvider");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load XP stats on mount
  useEffect(() => {
    const loadXPStats = async () => {
      await databaseService.initDatabase();
      setIsLoading(true);
      try {
        const stats = await xpService.getXPStats();
        setXPStats(stats);
        setError(null);
      } catch (err) {
        console.error("Error loading XP stats:", err);
        setError("Failed to load XP stats");
      } finally {
        setIsLoading(false);
      }
    };

    loadXPStats();
  }, [xpService]);

  // Add XP to user's total
  const addXP = useCallback(
    async (amount: number) => {
      try {
        const updatedStats = await xpService.addXP(amount);
        setXPStats(updatedStats);
        return updatedStats;
      } catch (err) {
        console.error("Error adding XP:", err);
        setError("Failed to add XP");
        throw err;
      }
    },
    [xpService]
  );

  // Refresh XP stats
  const refreshXPStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const stats = await xpService.getXPStats();
      setXPStats(stats);
      setError(null);
    } catch (err) {
      console.error("Error refreshing XP stats:", err);
      setError("Failed to refresh XP stats");
    } finally {
      setIsLoading(false);
    }
  }, [xpService]);

  // Format XP numbers for display
  const formatXP = useCallback((xp: number) => {
    return xp.toLocaleString();
  }, []);

  // Acknowledge level up notification
  const acknowledgeLevelUp = useCallback(async () => {
    try {
      await xpService.acknowledgeLevelUp();
      setXPStats((prev) => ({
        ...prev,
        lastLevelUp: null,
      }));
    } catch (err) {
      console.error("Error acknowledging level up:", err);
      setError("Failed to acknowledge level up");
    }
  }, [xpService]);

  // Check if there's a recent level up
  const hasRecentLevelUp = useMemo(() => {
    return xpStats.lastLevelUp !== null;
  }, [xpStats.lastLevelUp]);

  // Create context value
  const value = useMemo(
    () => ({
      xpStats,
      isLoading,
      error,
      addXP,
      refreshXPStats,
      formatXP,
      acknowledgeLevelUp,
      hasRecentLevelUp,
    }),
    [
      xpStats,
      isLoading,
      error,
      addXP,
      refreshXPStats,
      formatXP,
      acknowledgeLevelUp,
      hasRecentLevelUp,
    ]
  );

  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
};
