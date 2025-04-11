// src/services/analytics/XPService.ts

import { databaseService } from "../database/DatabaseService";
import { readingStatsService } from "./ReadingStatsService";

export interface XPStats {
  id: string;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpProgress: number;
  recentXPGained: number[];
  lastLevelUp: {
    previousLevel: number;
    newLevel: number;
    xpGained: number;
    timestamp: number;
  } | null;
}

export class XPService {
  private static readonly XP_STATS_ID = "user_xp_stats";
  private static readonly XP_PER_LEVEL = 500; // 500 XP to reach each level

  /**
   * Get current XP stats for the user
   */
  public async getXPStats(): Promise<XPStats> {
    try {
      const stats = await databaseService.getByKey<XPStats>(
        "stats",
        XPService.XP_STATS_ID
      );

      if (stats) {
        return stats;
      }

      // If no stats exist, create default ones
      const defaultStats: XPStats = {
        id: XPService.XP_STATS_ID,
        totalXP: 0,
        level: 1,
        currentLevelXP: 0,
        nextLevelXP: XPService.XP_PER_LEVEL,
        xpProgress: 0,
        recentXPGained: [],
        lastLevelUp: null,
      };

      await databaseService.add("stats", defaultStats);
      return defaultStats;
    } catch (error) {
      console.error("Error getting XP stats:", error);
      throw error;
    }
  }

  /**
   * Add XP to the user's total
   * @param amount Amount of XP to add
   * @param source Source of the XP (achievement, reading, etc.)
   * @returns Updated XP stats with level up info if applicable
   */
  public async addXP(amount: number): Promise<XPStats> {
    try {
      const stats = await this.getXPStats();
      const oldLevel = stats.level;

      // Update total XP
      const totalXP = stats.totalXP + amount;

      // Calculate new level
      const newLevel = Math.floor(totalXP / XPService.XP_PER_LEVEL) + 1;

      // Calculate level-specific XP values
      const currentLevelXP = totalXP - (newLevel - 1) * XPService.XP_PER_LEVEL;
      const nextLevelXP = newLevel * XPService.XP_PER_LEVEL;
      const xpProgress = (currentLevelXP / XPService.XP_PER_LEVEL) * 100;

      // Keep track of recent XP gains (last 10)
      const recentXPGained = [amount, ...stats.recentXPGained].slice(0, 10);

      // Check for level up
      let lastLevelUp = stats.lastLevelUp;
      if (newLevel > oldLevel) {
        lastLevelUp = {
          previousLevel: oldLevel,
          newLevel: newLevel,
          xpGained: amount,
          timestamp: Date.now(),
        };
      }

      // Update stats
      const updatedStats: XPStats = {
        ...stats,
        totalXP,
        level: newLevel,
        currentLevelXP,
        nextLevelXP,
        xpProgress,
        recentXPGained,
        lastLevelUp,
      };

      await databaseService.update("stats", updatedStats);

      // Also update the regular reading stats for compatibility
      await readingStatsService.addXP(amount);

      return updatedStats;
    } catch (error) {
      console.error("Error adding XP:", error);
      throw error;
    }
  }

  /**
   * Calculate how much XP is needed to reach the next level
   */
  public async getXPToNextLevel(): Promise<number> {
    const stats = await this.getXPStats();
    return stats.nextLevelXP - stats.currentLevelXP;
  }

  /**
   * Acknowledge level up notification
   */
  public async acknowledgeLevelUp(): Promise<void> {
    try {
      const stats = await this.getXPStats();

      if (stats.lastLevelUp) {
        const updatedStats = {
          ...stats,
          lastLevelUp: null,
        };

        await databaseService.update("stats", updatedStats);
      }
    } catch (error) {
      console.error("Error acknowledging level up:", error);
      throw error;
    }
  }

  /**
   * Get XP reward values for different actions
   */
  public getXPRewards() {
    return {
      DOCUMENT_READ: 50,
      SECTION_COMPLETED: 15,
      STREAK_DAY: 25,
      ACHIEVEMENT_UNLOCKED: {
        bronze: 75,
        silver: 150,
        gold: 300,
        platinum: 500,
      },
      CHALLENGE_COMPLETED: 100,
    };
  }
}

// Create and export a singleton instance
export const xpService = new XPService();
