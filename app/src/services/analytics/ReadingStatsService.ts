// src/services/analytics/ReadingStatsService.ts

import { databaseService } from "../database/DatabaseService";
import { readingHistoryService } from "./ReadingHistoryService";
import { readingListService } from "./ReadingListService";

export interface ReadingStats {
  id: string;
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  documentsCompleted: number;
  categoriesExplored: string[];
  percentComplete: number;
  lastReadAt: number | null;
}

export interface ReadingAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  progress: number;
  maxProgress: number;
  category: string;
}

export interface ReadingChallenge {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: number;
  reward: number;
  expiresAt: number | null;
  completed: boolean;
}

/**
 * Service that manages reading stats, achievements, and challenges
 */
export class ReadingStatsService {
  private static readonly STATS_ID = "user_reading_stats";
  private static readonly XP_VALUES = {
    DOCUMENT_READ: 50,
    STREAK_DAY: 10,
    CHALLENGE_COMPLETED: 100,
    ACHIEVEMENT_UNLOCKED: 75,
  };

  /**
   * Get user reading stats
   * @returns Promise with reading stats
   */
  public async getStats(): Promise<ReadingStats> {
    try {
      const stats = await databaseService.getByKey<ReadingStats>(
        "stats",
        this.STATS_ID
      );

      if (stats) {
        return stats;
      }

      // If no stats exist, create default stats
      const defaultStats: ReadingStats = {
        id: this.STATS_ID,
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        documentsCompleted: 0,
        categoriesExplored: [],
        percentComplete: 0,
        lastReadAt: null,
      };

      await databaseService.add("stats", defaultStats);
      return defaultStats;
    } catch (error) {
      console.error("Error getting reading stats:", error);
      throw error;
    }
  }

  /**
   * Update reading stats with realtime data
   * @param availableDocuments Array of all available documents
   * @returns Promise with updated stats
   */
  public async updateStats(availableDocuments: any[]): Promise<ReadingStats> {
    try {
      // Get current stats
      const stats = await this.getStats();
      const history = await readingHistoryService.getAllHistory();

      // Calculate current stats
      const now = Date.now();

      // Calculate categories explored
      const categories = new Set<string>();
      history.forEach((item) => {
        const category = item.path.split("/")[0] || "uncategorized";
        categories.add(category);
      });

      // Calculate documents completed and percent complete
      const documentsCompleted = history.length;
      const percentComplete =
        availableDocuments.length > 0
          ? Math.round((documentsCompleted / availableDocuments.length) * 100)
          : 0;

      // Calculate streak (this is simplified, actual implementation would be more robust)
      const { currentStreak, longestStreak } =
        await this.calculateReadingStreak(history);

      // Update stats
      const updatedStats: ReadingStats = {
        ...stats,
        documentsCompleted,
        categoriesExplored: Array.from(categories),
        percentComplete,
        currentStreak,
        longestStreak,
        lastReadAt:
          history.length > 0
            ? Math.max(...history.map((item) => item.lastReadAt))
            : stats.lastReadAt,
      };

      // Save updated stats
      await databaseService.update("stats", updatedStats);

      return updatedStats;
    } catch (error) {
      console.error("Error updating reading stats:", error);
      throw error;
    }
  }

  /**
   * Calculate reading streak from history
   * @param history Array of reading history items
   * @returns Object with current and longest streak
   */
  private async calculateReadingStreak(history: any[]): Promise<{
    currentStreak: number;
    longestStreak: number;
  }> {
    // Sort reading history by date
    const sortedHistory = [...history].sort(
      (a, b) => b.lastReadAt - a.lastReadAt
    );

    // Get unique reading days
    const readingDays = new Set<string>();
    sortedHistory.forEach((item) => {
      const date = new Date(item.lastReadAt);
      const dateString = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;
      readingDays.add(dateString);
    });

    // Sort reading days
    const sortedDays = Array.from(readingDays).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    if (sortedDays.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Calculate current streak
    let currentStreak = 1;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayString = `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`;
    const yesterdayString = `${yesterday.getFullYear()}-${
      yesterday.getMonth() + 1
    }-${yesterday.getDate()}`;

    if (readingDays.has(todayString) || readingDays.has(yesterdayString)) {
      // Start from the most recent day with activity
      const startDate = readingDays.has(todayString) ? today : yesterday;
      const currentDate = new Date(startDate);

      // Count consecutive days
      while (true) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dateString = `${currentDate.getFullYear()}-${
          currentDate.getMonth() + 1
        }-${currentDate.getDate()}`;

        if (readingDays.has(dateString)) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      // No reading activity today or yesterday, streak is broken
      currentStreak = 0;
    }

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const current = new Date(sortedDays[i]);
      const prev = new Date(sortedDays[i - 1]);

      // Check if days are consecutive
      const diffTime = Math.abs(prev.getTime() - current.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak), // In case current streak is the longest
    };
  }

  /**
   * Add XP to user stats
   * @param amount Amount of XP to add
   * @returns Promise with updated stats
   */
  public async addXP(amount: number): Promise<ReadingStats> {
    try {
      const stats = await this.getStats();
      const oldLevel = stats.level;

      // Update XP and level
      const totalXP = stats.totalXP + amount;
      const level = this.calculateLevel(totalXP);

      const updatedStats: ReadingStats = {
        ...stats,
        totalXP,
        level,
      };

      await databaseService.update("stats", updatedStats);

      // If leveled up, check achievements
      if (level > oldLevel) {
        await this.checkAchievements();
      }

      return updatedStats;
    } catch (error) {
      console.error("Error adding XP:", error);
      throw error;
    }
  }

  /**
   * Calculate level from XP
   * @param xp Total XP
   * @returns Level
   */
  private calculateLevel(xp: number): number {
    // Simple level calculation: every 500 XP is a new level
    return Math.floor(xp / 500) + 1;
  }

  /**
   * Get all achievements
   * @returns Promise with array of achievements
   */
  public async getAchievements(): Promise<ReadingAchievement[]> {
    try {
      const achievements = await databaseService.getAll<ReadingAchievement>(
        "achievements"
      );

      if (achievements.length > 0) {
        return achievements;
      }

      // If no achievements exist, create default ones
      const defaultAchievements = this.getDefaultAchievements();

      for (const achievement of defaultAchievements) {
        await databaseService.add("achievements", achievement);
      }

      return defaultAchievements;
    } catch (error) {
      console.error("Error getting achievements:", error);
      return this.getDefaultAchievements();
    }
  }

  /**
   * Get default achievements
   * @returns Array of default achievements
   */
  private getDefaultAchievements(): ReadingAchievement[] {
    return [
      {
        id: "first_document",
        title: "First Steps",
        description: "Read your first document",
        icon: "BookOpen",
        unlockedAt: null,
        progress: 0,
        maxProgress: 1,
        category: "reading",
      },
      {
        id: "five_documents",
        title: "Getting Started",
        description: "Read 5 documents",
        icon: "BookOpen",
        unlockedAt: null,
        progress: 0,
        maxProgress: 5,
        category: "reading",
      },
      {
        id: "ten_documents",
        title: "Bookworm",
        description: "Read 10 documents",
        icon: "BookText",
        unlockedAt: null,
        progress: 0,
        maxProgress: 10,
        category: "reading",
      },
      {
        id: "three_day_streak",
        title: "Consistent Reader",
        description: "Read for 3 days in a row",
        icon: "Flame",
        unlockedAt: null,
        progress: 0,
        maxProgress: 3,
        category: "streak",
      },
      {
        id: "explorer",
        title: "Explorer",
        description: "Read from 3 different categories",
        icon: "Target",
        unlockedAt: null,
        progress: 0,
        maxProgress: 3,
        category: "diversity",
      },
      {
        id: "level_up",
        title: "Level Up",
        description: "Reach reading level 2",
        icon: "Zap",
        unlockedAt: null,
        progress: 0,
        maxProgress: 500,
        category: "progression",
      },
    ];
  }

  /**
   * Check and update achievements
   * @returns Promise with updated achievements
   */
  public async checkAchievements(): Promise<ReadingAchievement[]> {
    try {
      const achievements = await this.getAchievements();
      const stats = await this.getStats();
      const now = Date.now();
      let xpGained = 0;

      const updatedAchievements = await Promise.all(
        achievements.map(async (achievement) => {
          // Skip already unlocked achievements
          if (achievement.unlockedAt !== null) {
            return achievement;
          }

          let progress = 0;
          let unlocked = false;

          // Check achievement criteria
          switch (achievement.id) {
            case "first_document":
              progress = Math.min(stats.documentsCompleted, 1);
              unlocked = stats.documentsCompleted >= 1;
              break;
            case "five_documents":
              progress = Math.min(stats.documentsCompleted, 5);
              unlocked = stats.documentsCompleted >= 5;
              break;
            case "ten_documents":
              progress = Math.min(stats.documentsCompleted, 10);
              unlocked = stats.documentsCompleted >= 10;
              break;
            case "three_day_streak":
              progress = Math.min(stats.currentStreak, 3);
              unlocked = stats.currentStreak >= 3;
              break;
            case "explorer":
              progress = Math.min(stats.categoriesExplored.length, 3);
              unlocked = stats.categoriesExplored.length >= 3;
              break;
            case "level_up":
              progress = Math.min(stats.totalXP, 500);
              unlocked = stats.level >= 2;
              break;
          }

          // Update achievement
          const updatedAchievement = { ...achievement, progress };

          // If just unlocked, update unlockedAt and add XP
          if (unlocked && updatedAchievement.unlockedAt === null) {
            updatedAchievement.unlockedAt = now;
            xpGained += this.XP_VALUES.ACHIEVEMENT_UNLOCKED;
          }

          // Save updated achievement
          await databaseService.update("achievements", updatedAchievement);

          return updatedAchievement;
        })
      );

      // If XP gained, add it to stats
      if (xpGained > 0) {
        await this.addXP(xpGained);
      }

      return updatedAchievements;
    } catch (error) {
      console.error("Error checking achievements:", error);
      throw error;
    }
  }

  /**
   * Get all challenges
   * @returns Promise with array of challenges
   */
  public async getChallenges(): Promise<ReadingChallenge[]> {
    try {
      const challenges = await databaseService.getAll<ReadingChallenge>(
        "challenges"
      );

      // Check if challenges need to be refreshed
      if (this.challengesNeedRefresh(challenges)) {
        const newChallenges = this.generateDailyChallenges();

        // Clear existing challenges
        await databaseService.clearStore("challenges");

        // Add new challenges
        for (const challenge of newChallenges) {
          await databaseService.add("challenges", challenge);
        }

        return newChallenges;
      }

      return challenges;
    } catch (error) {
      console.error("Error getting challenges:", error);
      return this.generateDailyChallenges();
    }
  }

  /**
   * Generate daily challenges
   * @returns Array of daily challenges
   */
  private generateDailyChallenges(): ReadingChallenge[] {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return [
      {
        id: "daily_reading_goal",
        title: "Daily Reading Goal",
        description: "Read 3 documents today",
        goal: 3,
        progress: 0,
        reward: 150,
        expiresAt: endOfDay.getTime(),
        completed: false,
      },
      {
        id: "category_explorer",
        title: "Category Explorer",
        description: "Read from 2 different categories today",
        goal: 2,
        progress: 0,
        reward: 100,
        expiresAt: endOfDay.getTime(),
        completed: false,
      },
      {
        id: "new_document",
        title: "New Territory",
        description: "Read a document you've never read before",
        goal: 1,
        progress: 0,
        reward: 75,
        expiresAt: endOfDay.getTime(),
        completed: false,
      },
    ];
  }

  /**
   * Check if challenges need to be refreshed
   * @param challenges Array of challenges
   * @returns Whether challenges need to be refreshed
   */
  private challengesNeedRefresh(challenges: ReadingChallenge[]): boolean {
    if (challenges.length === 0) {
      return true;
    }

    const now = Date.now();

    // Check if challenges have expired
    const allExpired = challenges.every(
      (challenge) => challenge.expiresAt !== null && challenge.expiresAt < now
    );

    // Check if it's a new day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const hasExpiredChallenge = challenges.some(
      (challenge) =>
        challenge.expiresAt !== null &&
        challenge.expiresAt < todayStart.getTime()
    );

    return allExpired || hasExpiredChallenge;
  }

  /**
   * Update challenge progress after reading a document
   * @param path Document path
   * @returns Promise with updated challenges
   */
  public async updateChallenges(path: string): Promise<ReadingChallenge[]> {
    try {
      const challenges = await this.getChallenges();
      const history = await readingHistoryService.getAllHistory();
      const stats = await this.getStats();
      let xpGained = 0;

      // Get today's reading activity
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.getTime();

      const todayReadings = history.filter(
        (item) => item.lastReadAt >= todayStart
      );
      const uniqueTodayDocs = new Set(todayReadings.map((item) => item.path));
      const uniqueTodayCategories = new Set(
        Array.from(uniqueTodayDocs).map(
          (docPath) => docPath.split("/")[0] || "uncategorized"
        )
      );
      const isNewDocument =
        history.filter((item) => item.path === path).length === 1;

      // Update each challenge
      const updatedChallenges = await Promise.all(
        challenges.map(async (challenge) => {
          // Skip already completed or expired challenges
          if (
            challenge.completed ||
            (challenge.expiresAt !== null && challenge.expiresAt < Date.now())
          ) {
            return challenge;
          }

          let progress = 0;

          // Update progress based on challenge type
          switch (challenge.id) {
            case "daily_reading_goal":
              progress = Math.min(uniqueTodayDocs.size, challenge.goal);
              break;
            case "category_explorer":
              progress = Math.min(uniqueTodayCategories.size, challenge.goal);
              break;
            case "new_document":
              progress = isNewDocument ? 1 : 0;
              break;
          }

          const updatedChallenge = { ...challenge, progress };

          // Check if challenge is completed
          if (progress >= challenge.goal && !challenge.completed) {
            updatedChallenge.completed = true;
            xpGained += challenge.reward;
          }

          // Save updated challenge
          await databaseService.update("challenges", updatedChallenge);

          return updatedChallenge;
        })
      );

      // If XP gained, add it to stats
      if (xpGained > 0) {
        await this.addXP(xpGained);
      }

      return updatedChallenges;
    } catch (error) {
      console.error("Error updating challenges:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const readingStatsService = new ReadingStatsService();
