// src/services/analytics/EnhancedAchievementService.ts

import { databaseService } from "../database/DatabaseService";
import { readingHistoryService } from "./ReadingHistoryService";
import { readingSessionTracker } from "./ReadingSessionTracker";
import { sectionAnalyticsController } from "./SectionAnalyticsController";

/**
 * Achievement difficulty level - determines XP rewards and visual treatment
 */
export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

/**
 * Categories of achievements to group them logically
 */
export type AchievementCategory =
  | "reading_volume" // Reading quantity
  | "reading_streaks" // Consistency
  | "exploration" // Diversity of content
  | "mastery" // Completion metrics
  | "time_spent" // Duration metrics
  | "hidden" // Secret achievements
  | "challenges"; // Special challenges

/**
 * Enhanced achievement data structure with more metadata and categorization
 */
export interface EnhancedAchievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  progress: number;
  maxProgress: number;
  unlockedAt: number | null;
  acknowledged: boolean;
  xpReward: number;
  secret?: boolean; // If true, title and description are hidden until unlocked
  dependsOn?: string[]; // Achievement IDs that must be unlocked first
  unlockMessage?: string; // Custom message shown when achievement is unlocked
  animations?: string[]; // CSS animations to apply when unlocked
  colorScheme?: string; // Custom color scheme for the achievement
}

/**
 * Service for managing an enhanced achievement system with categories,
 * tiers, and richer metadata
 */
export class EnhancedAchievementService {
  private static STORE_NAME = "achievements";

  /**
   * Get all achievements from the database or initialize default ones
   */
  public async getAchievements(): Promise<EnhancedAchievement[]> {
    try {
      const achievements = await databaseService.getAll<EnhancedAchievement>(
        EnhancedAchievementService.STORE_NAME
      );

      if (achievements.length > 0) {
        return achievements;
      }

      // No achievements found, initialize default ones
      const defaultAchievements = this.createDefaultAchievements();

      for (const achievement of defaultAchievements) {
        await databaseService.add(
          EnhancedAchievementService.STORE_NAME,
          achievement
        );
      }

      return defaultAchievements;
    } catch (error) {
      console.error("Error getting achievements:", error);
      return this.createDefaultAchievements();
    }
  }

  /**
   * Get newly unlocked achievements that haven't been acknowledged by the user
   */
  public async getNewAchievements(): Promise<EnhancedAchievement[]> {
    const achievements = await this.getAchievements();
    return achievements.filter(
      (achievement) =>
        achievement.unlockedAt !== null && !achievement.acknowledged
    );
  }

  /**
   * Mark an achievement as acknowledged by the user
   */
  public async acknowledgeAchievement(id: string): Promise<void> {
    try {
      const achievements = await this.getAchievements();
      const achievement = achievements.find((a) => a.id === id);

      if (achievement) {
        const updatedAchievement = {
          ...achievement,
          acknowledged: true,
        };

        await databaseService.update(
          EnhancedAchievementService.STORE_NAME,
          updatedAchievement
        );
      }
    } catch (error) {
      console.error("Error acknowledging achievement:", error);
      throw error;
    }
  }

  /**
   * Check and update achievement progress based on latest reading data
   */
  public async checkAchievements(): Promise<{
    updatedAchievements: EnhancedAchievement[];
    newlyUnlockedAchievements: EnhancedAchievement[];
    totalXpEarned: number;
  }> {
    try {
      const achievements = await this.getAchievements();
      const readingStats = await this.collectReadingStats();

      let totalXpEarned = 0;
      const newlyUnlockedAchievements: EnhancedAchievement[] = [];

      // Process achievements that have dependencies first
      const sortedAchievements =
        this.sortAchievementsByDependencies(achievements);

      const updatedAchievements = await Promise.all(
        sortedAchievements.map(async (achievement) => {
          // Skip already unlocked achievements
          if (achievement.unlockedAt !== null) {
            return achievement;
          }

          // Check if dependencies are met
          if (
            achievement.dependsOn &&
            !this.areDependenciesMet(achievement.dependsOn, achievements)
          ) {
            return achievement;
          }

          const progress = this.calculateAchievementProgress(
            achievement,
            readingStats
          );

          // Update achievement progress
          const updatedAchievement = {
            ...achievement,
            progress: progress,
          };

          // Check if achievement should be unlocked
          if (
            progress >= achievement.maxProgress &&
            updatedAchievement.unlockedAt === null
          ) {
            updatedAchievement.unlockedAt = Date.now();
            totalXpEarned += updatedAchievement.xpReward;
            newlyUnlockedAchievements.push(updatedAchievement);
          }

          // Save updated achievement
          await databaseService.update(
            EnhancedAchievementService.STORE_NAME,
            updatedAchievement
          );

          return updatedAchievement;
        })
      );

      return {
        updatedAchievements,
        newlyUnlockedAchievements,
        totalXpEarned,
      };
    } catch (error) {
      console.error("Error checking achievements:", error);
      throw error;
    }
  }

  /**
   * Get achievements by category
   */
  public async getAchievementsByCategory(
    category: AchievementCategory
  ): Promise<EnhancedAchievement[]> {
    const achievements = await this.getAchievements();
    return achievements.filter((a) => a.category === category);
  }

  /**
   * Reset all achievements progress (for testing or user reset)
   */
  public async resetAchievements(): Promise<void> {
    try {
      await databaseService.clearStore(EnhancedAchievementService.STORE_NAME);
      await this.getAchievements(); // Re-initialize defaults
    } catch (error) {
      console.error("Error resetting achievements:", error);
      throw error;
    }
  }

  /**
   * Create default set of achievements across all categories and tiers
   */
  private createDefaultAchievements(): EnhancedAchievement[] {
    return [
      // ===== READING VOLUME ACHIEVEMENTS =====
      {
        id: "read_first_document",
        title: "First Steps",
        description: "Read your first document",
        category: "reading_volume",
        tier: "bronze",
        icon: "BookOpen",
        progress: 0,
        maxProgress: 1,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 50,
        unlockMessage: "Welcome to your reading journey!",
        animations: ["pulse", "glow"],
      },
      {
        id: "read_five_documents",
        title: "Avid Reader",
        description: "Read 5 different documents",
        category: "reading_volume",
        tier: "bronze",
        icon: "BookOpen",
        progress: 0,
        maxProgress: 5,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 100,
        dependsOn: ["read_first_document"],
      },
      {
        id: "read_ten_documents",
        title: "Bookworm",
        description: "Read 10 different documents",
        category: "reading_volume",
        tier: "silver",
        icon: "BookText",
        progress: 0,
        maxProgress: 10,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 150,
        dependsOn: ["read_five_documents"],
      },
      {
        id: "read_twenty_five_documents",
        title: "Bibliophile",
        description: "Read 25 different documents",
        category: "reading_volume",
        tier: "gold",
        icon: "Library",
        progress: 0,
        maxProgress: 25,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 250,
        dependsOn: ["read_ten_documents"],
      },
      {
        id: "read_fifty_documents",
        title: "Scholar",
        description: "Read 50 different documents",
        category: "reading_volume",
        tier: "platinum",
        icon: "GraduationCap",
        progress: 0,
        maxProgress: 50,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 500,
        dependsOn: ["read_twenty_five_documents"],
        unlockMessage: "You've achieved master reader status!",
        animations: ["confetti", "shimmer"],
      },

      // ===== STREAKS ACHIEVEMENTS =====
      {
        id: "streak_three_days",
        title: "Consistent Reader",
        description: "Read for 3 days in a row",
        category: "reading_streaks",
        tier: "bronze",
        icon: "Flame",
        progress: 0,
        maxProgress: 3,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 75,
      },
      {
        id: "streak_seven_days",
        title: "Week Warrior",
        description: "Read for 7 days in a row",
        category: "reading_streaks",
        tier: "silver",
        icon: "Flame",
        progress: 0,
        maxProgress: 7,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 150,
        dependsOn: ["streak_three_days"],
      },
      {
        id: "streak_fourteen_days",
        title: "Fortnight Force",
        description: "Read for 14 days in a row",
        category: "reading_streaks",
        tier: "gold",
        icon: "Flame",
        progress: 0,
        maxProgress: 14,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 300,
        dependsOn: ["streak_seven_days"],
      },
      {
        id: "streak_thirty_days",
        title: "Monthly Maven",
        description: "Read for 30 days in a row",
        category: "reading_streaks",
        tier: "platinum",
        icon: "CalendarCheck",
        progress: 0,
        maxProgress: 30,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 500,
        dependsOn: ["streak_fourteen_days"],
        animations: ["confetti", "pulse"],
      },

      // ===== EXPLORATION ACHIEVEMENTS =====
      {
        id: "explore_three_categories",
        title: "Explorer",
        description: "Read from 3 different categories",
        category: "exploration",
        tier: "bronze",
        icon: "Compass",
        progress: 0,
        maxProgress: 3,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 75,
      },
      {
        id: "explore_five_categories",
        title: "Adventurer",
        description: "Read from 5 different categories",
        category: "exploration",
        tier: "silver",
        icon: "Map",
        progress: 0,
        maxProgress: 5,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 150,
        dependsOn: ["explore_three_categories"],
      },
      {
        id: "explore_all_categories",
        title: "Renaissance Reader",
        description: "Read from every available category",
        category: "exploration",
        tier: "gold",
        icon: "GlobeHemisphereWest",
        progress: 0,
        maxProgress: 8, // Adjust based on actual number of categories
        unlockedAt: null,
        acknowledged: false,
        xpReward: 300,
        dependsOn: ["explore_five_categories"],
        animations: ["spin", "glow"],
      },

      // ===== MASTERY ACHIEVEMENTS =====
      {
        id: "complete_one_document",
        title: "Completionist",
        description: "Read 100% of a document",
        category: "mastery",
        tier: "bronze",
        icon: "CheckCircle",
        progress: 0,
        maxProgress: 1,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 75,
      },
      {
        id: "complete_five_documents",
        title: "Master Reader",
        description: "Complete 5 documents (100%)",
        category: "mastery",
        tier: "silver",
        icon: "CheckSquare",
        progress: 0,
        maxProgress: 5,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 150,
        dependsOn: ["complete_one_document"],
      },
      {
        id: "complete_ten_documents",
        title: "Thorough Scholar",
        description: "Complete 10 documents (100%)",
        category: "mastery",
        tier: "gold",
        icon: "Award",
        progress: 0,
        maxProgress: 10,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 300,
        dependsOn: ["complete_five_documents"],
      },
      {
        id: "complete_fifty_percent",
        title: "Halfway There",
        description: "Reach 50% completion across all documents",
        category: "mastery",
        tier: "silver",
        icon: "BarChart2",
        progress: 0,
        maxProgress: 50,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 200,
      },

      // ===== TIME SPENT ACHIEVEMENTS =====
      {
        id: "read_one_hour",
        title: "Dedicated Reader",
        description: "Spend 1 hour reading",
        category: "time_spent",
        tier: "bronze",
        icon: "Clock",
        progress: 0,
        maxProgress: 60 * 60 * 1000, // 1 hour in milliseconds
        unlockedAt: null,
        acknowledged: false,
        xpReward: 75,
      },
      {
        id: "read_five_hours",
        title: "Reading Enthusiast",
        description: "Spend 5 hours reading",
        category: "time_spent",
        tier: "silver",
        icon: "Clock",
        progress: 0,
        maxProgress: 5 * 60 * 60 * 1000, // 5 hours in milliseconds
        unlockedAt: null,
        acknowledged: false,
        xpReward: 150,
        dependsOn: ["read_one_hour"],
      },
      {
        id: "read_ten_hours",
        title: "Reading Expert",
        description: "Spend 10 hours reading",
        category: "time_spent",
        tier: "gold",
        icon: "Clock",
        progress: 0,
        maxProgress: 10 * 60 * 60 * 1000, // 10 hours in milliseconds
        unlockedAt: null,
        acknowledged: false,
        xpReward: 300,
        dependsOn: ["read_five_hours"],
      },
      {
        id: "read_twenty_four_hours",
        title: "Lifelong Learner",
        description: "Spend 24 hours reading",
        category: "time_spent",
        tier: "platinum",
        icon: "Hourglass",
        progress: 0,
        maxProgress: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        unlockedAt: null,
        acknowledged: false,
        xpReward: 500,
        dependsOn: ["read_ten_hours"],
        animations: ["glow", "pulse"],
      },

      // ===== HIDDEN ACHIEVEMENTS =====
      {
        id: "night_owl",
        title: "Night Owl",
        description: "Read after midnight",
        category: "hidden",
        tier: "silver",
        icon: "Moon",
        progress: 0,
        maxProgress: 1,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 100,
        secret: true,
      },
      {
        id: "early_bird",
        title: "Early Bird",
        description: "Read before 6 AM",
        category: "hidden",
        tier: "silver",
        icon: "Sunrise",
        progress: 0,
        maxProgress: 1,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 100,
        secret: true,
      },
      {
        id: "weekend_warrior",
        title: "Weekend Warrior",
        description: "Read for at least 2 hours on a weekend",
        category: "hidden",
        tier: "gold",
        icon: "Calendar",
        progress: 0,
        maxProgress: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
        unlockedAt: null,
        acknowledged: false,
        xpReward: 150,
        secret: true,
      },

      // ===== CHALLENGES =====
      {
        id: "speed_reader",
        title: "Speed Reader",
        description: "Read 5 documents in a single day",
        category: "challenges",
        tier: "gold",
        icon: "Zap",
        progress: 0,
        maxProgress: 5,
        unlockedAt: null,
        acknowledged: false,
        xpReward: 250,
      },
      {
        id: "category_master",
        title: "Category Master",
        description: "Read all documents in a single category",
        category: "challenges",
        tier: "platinum",
        icon: "FolderClosed",
        progress: 0,
        maxProgress: 1, // Will be updated dynamically
        unlockedAt: null,
        acknowledged: false,
        xpReward: 350,
      },
    ];
  }

  /**
   * Check if all dependencies for an achievement are met
   */
  private areDependenciesMet(
    dependencyIds: string[],
    achievements: EnhancedAchievement[]
  ): boolean {
    return dependencyIds.every((depId) => {
      const dependency = achievements.find((a) => a.id === depId);
      return dependency?.unlockedAt !== null;
    });
  }

  /**
   * Sort achievements so dependencies are processed first
   */
  private sortAchievementsByDependencies(
    achievements: EnhancedAchievement[]
  ): EnhancedAchievement[] {
    // Create a map of achievement ID to its dependencies
    const dependencyMap = new Map<string, string[]>();

    achievements.forEach((achievement) => {
      dependencyMap.set(achievement.id, achievement.dependsOn || []);
    });

    // Topological sort
    const visited = new Set<string>();
    const sorted: EnhancedAchievement[] = [];

    const visit = (achievementId: string) => {
      if (visited.has(achievementId)) return;

      visited.add(achievementId);

      const dependencies = dependencyMap.get(achievementId) || [];
      for (const depId of dependencies) {
        visit(depId);
      }

      const achievement = achievements.find((a) => a.id === achievementId);
      if (achievement) {
        sorted.push(achievement);
      }
    };

    // Visit all achievements
    achievements.forEach((achievement) => {
      visit(achievement.id);
    });

    return sorted;
  }

  /**
   * Collect all reading stats needed for achievement calculations
   */
  private async collectReadingStats() {
    try {
      // Get reading history
      const history = await readingHistoryService.getAllHistory();

      // Get section completion data
      const sectionProgress =
        await sectionAnalyticsController.getSectionReadingProgress();
      const documentStats = await sectionAnalyticsController.getDocumentStats();

      // Get sessions data
      const sessions = await readingSessionTracker.getAllSessions();

      // Calculate unique documents read
      const uniqueDocuments = new Set(history.map((item) => item.path));

      // Calculate unique categories explored
      const categories = new Set<string>();
      history.forEach((item) => {
        const category = item.path.split("/")[0] || "uncategorized";
        categories.add(category);
      });

      // Calculate documents completed (100%)
      const completedDocuments = documentStats.filter(
        (doc) => doc.completionPercentage >= 100
      );

      // Calculate total reading time
      const totalReadingTime = sessions.reduce((total, session) => {
        if (session.activeTime) {
          return total + session.activeTime;
        } else if (session.duration) {
          return total + session.duration;
        }
        return total;
      }, 0);

      // Calculate reading streak
      const readingDays = new Set<string>();
      history.forEach((item) => {
        const date = new Date(item.lastReadAt);
        const dateString = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`;
        readingDays.add(dateString);
      });

      // Calculate current streak
      const currentStreak = this.calculateCurrentStreak(
        Array.from(readingDays)
      );

      // Check for night owl/early bird
      const readAtNight = sessions.some((session) => {
        const date = new Date(session.startTime);
        const hour = date.getHours();
        return hour >= 0 && hour < 5; // Between 12 AM and 5 AM
      });

      const readEarly = sessions.some((session) => {
        const date = new Date(session.startTime);
        const hour = date.getHours();
        return hour >= 5 && hour < 7; // Between 5 AM and 7 AM
      });

      // Check for weekend reading
      const weekendReadingTime = sessions.reduce((total, session) => {
        const date = new Date(session.startTime);
        const day = date.getDay();
        if (day === 0 || day === 6) {
          // Sunday or Saturday
          return total + (session.activeTime || session.duration || 0);
        }
        return total;
      }, 0);

      // Count documents read today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayDocuments = history.filter(
        (item) => item.lastReadAt >= today.getTime()
      );
      const uniqueTodayDocuments = new Set(
        todayDocuments.map((item) => item.path)
      );

      // Calculate overall completion percentage
      const overallCompletion =
        documentStats.length > 0
          ? documentStats.reduce(
              (sum, doc) => sum + doc.completionPercentage,
              0
            ) / documentStats.length
          : 0;

      return {
        uniqueDocumentsCount: uniqueDocuments.size,
        categoriesCount: categories.size,
        categories: Array.from(categories),
        completedDocumentsCount: completedDocuments.length,
        completedDocuments: completedDocuments,
        totalReadingTime,
        currentStreak,
        readAtNight,
        readEarly,
        weekendReadingTime,
        uniqueTodayDocumentsCount: uniqueTodayDocuments.size,
        overallCompletion,
        sectionProgress,
      };
    } catch (error) {
      console.error("Error collecting reading stats:", error);
      throw error;
    }
  }

  /**
   * Calculate the current reading streak from array of date strings
   */
  private calculateCurrentStreak(dateStrings: string[]): number {
    if (dateStrings.length === 0) return 0;

    // Sort dates (newest first)
    const sortedDates = [...dateStrings]
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    // Check if today or yesterday is in the dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayTime = today.getTime();
    const yesterdayTime = yesterday.getTime();

    // If neither today nor yesterday is in the dates, streak is 0
    if (
      !sortedDates.some((d) => {
        const dateTime = d.getTime();
        return dateTime === todayTime || dateTime === yesterdayTime;
      })
    ) {
      return 0;
    }

    // Calculate streak
    let streak = 1;
    let currentDate = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);

      // Check if this date is the previous day
      if (sortedDates[i].getTime() === prevDate.getTime()) {
        streak++;
        currentDate = sortedDates[i];
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate progress for a specific achievement based on collected stats
   */
  private calculateAchievementProgress(
    achievement: EnhancedAchievement,
    stats: Record<string, number>
  ): number {
    switch (achievement.id) {
      // Reading volume achievements
      case "read_first_document":
      case "read_five_documents":
      case "read_ten_documents":
      case "read_twenty_five_documents":
      case "read_fifty_documents":
        return Math.min(stats.uniqueDocumentsCount, achievement.maxProgress);

      // Streak achievements
      case "streak_three_days":
      case "streak_seven_days":
      case "streak_fourteen_days":
      case "streak_thirty_days":
        return Math.min(stats.currentStreak, achievement.maxProgress);

      // Exploration achievements
      case "explore_three_categories":
      case "explore_five_categories":
      case "explore_all_categories":
        return Math.min(stats.categoriesCount, achievement.maxProgress);

      // Mastery achievements
      case "complete_one_document":
      case "complete_five_documents":
      case "complete_ten_documents":
        return Math.min(stats.completedDocumentsCount, achievement.maxProgress);

      case "complete_fifty_percent":
        return Math.min(
          Math.floor(stats.overallCompletion),
          achievement.maxProgress
        );

      // Time spent achievements
      case "read_one_hour":
      case "read_five_hours":
      case "read_ten_hours":
      case "read_twenty_four_hours":
        return Math.min(stats.totalReadingTime, achievement.maxProgress);

      // Hidden achievements
      case "night_owl":
        return stats.readAtNight ? 1 : 0;

      case "early_bird":
        return stats.readEarly ? 1 : 0;

      case "weekend_warrior":
        return Math.min(stats.weekendReadingTime, achievement.maxProgress);

      // Challenges
      case "speed_reader":
        return Math.min(
          stats.uniqueTodayDocumentsCount,
          achievement.maxProgress
        );

      case "category_master":
        // This is more complex and would need to check if all documents in a category are read
        // For simplicity we'll return 0 here, but a real implementation would check categories
        return 0;

      default:
        return 0;
    }
  }
}

// Create and export singleton instance
export const enhancedAchievementService = new EnhancedAchievementService();
