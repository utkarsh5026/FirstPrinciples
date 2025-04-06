// src/utils/ReadingAnalyticsService.ts
import { v4 as uuidv4 } from "uuid";
import { ReadingHistoryItem, ReadingTodoItem } from "@/components/home/types";
import { FileMetadata } from "@/utils/MarkdownLoader";

// Types for analytics data
export interface ReadingStats {
  totalXP: number;
  level: number;
  totalReadingTime: number;
  currentStreak: number;
  longestStreak: number;
  estimatedWordsRead: number;
  documentsCompleted: number;
  categoriesExplored: Set<string>;
  percentComplete: number;
  lastSessionDuration: number;
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

export interface ReadingPreferences {
  dailyGoal: number;
  reminderEnabled: boolean;
  favoriteCategories: string[];
  theme: string;
}

// Main Analytics Service
export class ReadingAnalyticsService {
  // Constants
  private static readonly STORAGE_KEYS = {
    READING_HISTORY: "readingHistory",
    READING_TODO: "readingTodoList",
    READING_STATS: "readingStats",
    READING_ACHIEVEMENTS: "readingAchievements",
    READING_CHALLENGES: "readingChallenges",
    READING_PREFERENCES: "readingPreferences",
    READING_SESSIONS: "readingSessions",
    LAST_CARD_POSITION: "lastReadPosition",
    READ_CARD_SECTIONS: "readCardSections",
  };

  private static readonly XP_VALUES = {
    DOCUMENT_READ: 50,
    STREAK_DAY: 10,
    CHALLENGE_COMPLETED: 100,
    ACHIEVEMENT_UNLOCKED: 75,
  };

  // Core functions for reading history
  public static getReadingHistory(): ReadingHistoryItem[] {
    const storedHistory = localStorage.getItem(
      this.STORAGE_KEYS.READING_HISTORY
    );
    if (!storedHistory) return [];

    try {
      return JSON.parse(storedHistory);
    } catch (error) {
      console.error("Error parsing reading history:", error);
      return [];
    }
  }

  public static saveReadingHistory(history: ReadingHistoryItem[]): void {
    localStorage.setItem(
      this.STORAGE_KEYS.READING_HISTORY,
      JSON.stringify(history)
    );
  }

  public static addToReadingHistory(
    path: string,
    title: string
  ): ReadingHistoryItem {
    const history = this.getReadingHistory();
    const now = Date.now();

    // Find if document already exists in history
    const existingIndex = history.findIndex((item) => item.path === path);
    let updatedItem: ReadingHistoryItem;

    if (existingIndex >= 0) {
      // Update existing entry
      updatedItem = {
        ...history[existingIndex],
        lastReadAt: now,
        readCount: history[existingIndex].readCount + 1,
      };

      // Remove the existing entry
      history.splice(existingIndex, 1);
    } else {
      // Create new entry
      updatedItem = {
        path,
        title,
        lastReadAt: now,
        readCount: 1,
      };
    }

    // Add to the beginning of the array (most recent first)
    const updatedHistory = [updatedItem, ...history];
    this.saveReadingHistory(updatedHistory);

    // Update stats
    this.updateStatsAfterReading(path);

    // Check achievements
    this.checkAchievements();

    // Check challenges
    this.updateChallenges(path);

    return updatedItem;
  }

  public static clearReadingHistory(): void {
    localStorage.setItem(this.STORAGE_KEYS.READING_HISTORY, JSON.stringify([]));
  }

  // Functions for todo list
  public static getTodoList(): ReadingTodoItem[] {
    const storedTodoList = localStorage.getItem(this.STORAGE_KEYS.READING_TODO);
    if (!storedTodoList) return [];

    try {
      return JSON.parse(storedTodoList);
    } catch (error) {
      console.error("Error parsing todo list:", error);
      return [];
    }
  }

  public static saveTodoList(todoList: ReadingTodoItem[]): void {
    localStorage.setItem(
      this.STORAGE_KEYS.READING_TODO,
      JSON.stringify(todoList)
    );
  }

  public static addToTodoList(path: string, title: string): boolean {
    const todoList = this.getTodoList();

    // Check if already in todo list
    const isAlreadyInList = todoList.some((item) => item.path === path);
    if (isAlreadyInList) return false;

    // Add new item
    const newItem: ReadingTodoItem = {
      id: uuidv4(),
      path,
      title,
      addedAt: Date.now(),
      completed: false,
    };

    const updatedTodoList = [...todoList, newItem];
    this.saveTodoList(updatedTodoList);
    return true;
  }

  public static removeFromTodoList(id: string): void {
    const todoList = this.getTodoList();
    const updatedTodoList = todoList.filter((item) => item.id !== id);
    this.saveTodoList(updatedTodoList);
  }

  public static toggleTodoCompletion(id: string): void {
    const todoList = this.getTodoList();
    const updatedTodoList = todoList.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    this.saveTodoList(updatedTodoList);
  }

  public static clearTodoList(): void {
    localStorage.setItem(this.STORAGE_KEYS.READING_TODO, JSON.stringify([]));
  }

  // Stats management
  public static getReadingStats(): ReadingStats {
    const storedStats = localStorage.getItem(this.STORAGE_KEYS.READING_STATS);

    const defaultStats: ReadingStats = {
      totalXP: 0,
      level: 1,
      totalReadingTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      estimatedWordsRead: 0,
      documentsCompleted: 0,
      categoriesExplored: new Set<string>(),
      percentComplete: 0,
      lastSessionDuration: 0,
      lastReadAt: null,
    };

    if (!storedStats) return defaultStats;

    try {
      const parsedStats = JSON.parse(storedStats);

      // Convert categoriesExplored back to a Set
      if (
        parsedStats.categoriesExplored &&
        Array.isArray(parsedStats.categoriesExplored)
      ) {
        parsedStats.categoriesExplored = new Set(
          parsedStats.categoriesExplored
        );
      }

      return { ...defaultStats, ...parsedStats };
    } catch (error) {
      console.error("Error parsing reading stats:", error);
      return defaultStats;
    }
  }

  public static saveReadingStats(stats: ReadingStats): void {
    // Convert Set to array for JSON serialization
    const serializableStats = {
      ...stats,
      categoriesExplored: Array.from(stats.categoriesExplored),
    };

    localStorage.setItem(
      this.STORAGE_KEYS.READING_STATS,
      JSON.stringify(serializableStats)
    );
  }

  private static updateStatsAfterReading(path: string): void {
    const stats = this.getReadingStats();
    const history = this.getReadingHistory();
    const availableDocuments = this.getAvailableDocuments();

    // Calculate categories explored
    const category = this.getCategoryFromPath(path);
    if (category) {
      stats.categoriesExplored.add(category);
    }

    // Update documents completed count
    stats.documentsCompleted = new Set(history.map((item) => item.path)).size;

    // Calculate percent complete
    if (availableDocuments.length > 0) {
      stats.percentComplete = Math.round(
        (stats.documentsCompleted / availableDocuments.length) * 100
      );
    }

    // Simulate reading time
    const estimatedMinutesPerDocument = 15;
    const lastSessionDuration = estimatedMinutesPerDocument;
    stats.lastSessionDuration = lastSessionDuration;
    stats.totalReadingTime += lastSessionDuration;

    // Simulate words read (average 300 words per minute)
    const avgWordsPerMinute = 300;
    stats.estimatedWordsRead += lastSessionDuration * avgWordsPerMinute;

    // Update streak data
    const streakData = this.calculateReadingStreak(history);
    stats.currentStreak = streakData.currentStreak;
    stats.longestStreak = streakData.longestStreak;

    // Update XP
    stats.totalXP += this.XP_VALUES.DOCUMENT_READ;

    // Update level based on XP
    stats.level = this.calculateLevel(stats.totalXP);

    // Update last read timestamp
    stats.lastReadAt = Date.now();

    // Save updated stats
    this.saveReadingStats(stats);
  }

  private static getCategoryFromPath(path: string): string | null {
    // Extract first segment of path as category
    const parts = path.split("/");
    return parts.length > 0 ? parts[0] : null;
  }

  private static calculateReadingStreak(history: ReadingHistoryItem[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    // Sort reading history by date
    const sortedHistory = [...history].sort(
      (a, b) => b.lastReadAt - a.lastReadAt
    );

    // Calculate days with reading activity
    const readingDays = new Set<string>();
    sortedHistory.forEach((item) => {
      const date = new Date(item.lastReadAt);
      const dateString = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;
      readingDays.add(dateString);
    });

    // Convert to array and sort
    const sortedReadingDays = Array.from(readingDays).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    // If no reading days, return 0 for current and longest streak
    if (sortedReadingDays.length === 0) {
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

    // If today or yesterday has reading activity, calculate current streak
    if (readingDays.has(todayString) || readingDays.has(yesterdayString)) {
      // Start from today or most recent day
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
      // No reading activity today or yesterday, streak is 0
      currentStreak = 0;
    }

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < sortedReadingDays.length; i++) {
      const currentDate = new Date(sortedReadingDays[i]);
      const prevDate = new Date(sortedReadingDays[i - 1]);

      // Check if days are consecutive
      const diffTime = Math.abs(prevDate.getTime() - currentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return { currentStreak, longestStreak };
  }

  private static calculateLevel(xp: number): number {
    // Simple level calculation: every 500 XP is a new level
    return Math.floor(xp / 500) + 1;
  }

  // Achievement functions
  public static getAchievements(): ReadingAchievement[] {
    const storedAchievements = localStorage.getItem(
      this.STORAGE_KEYS.READING_ACHIEVEMENTS
    );

    if (!storedAchievements) {
      // Initialize default achievements
      const defaultAchievements = this.getDefaultAchievements();
      this.saveAchievements(defaultAchievements);
      return defaultAchievements;
    }

    try {
      return JSON.parse(storedAchievements);
    } catch (error) {
      console.error("Error parsing achievements:", error);
      return this.getDefaultAchievements();
    }
  }

  public static saveAchievements(achievements: ReadingAchievement[]): void {
    localStorage.setItem(
      this.STORAGE_KEYS.READING_ACHIEVEMENTS,
      JSON.stringify(achievements)
    );
  }

  private static getDefaultAchievements(): ReadingAchievement[] {
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
        id: "twenty_documents",
        title: "Knowledge Seeker",
        description: "Read 20 documents",
        icon: "Lightbulb",
        unlockedAt: null,
        progress: 0,
        maxProgress: 20,
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
        id: "seven_day_streak",
        title: "Weekly Warrior",
        description: "Read for 7 days in a row",
        icon: "Flame",
        unlockedAt: null,
        progress: 0,
        maxProgress: 7,
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

  private static checkAchievements(): void {
    const achievements = this.getAchievements();
    const stats = this.getReadingStats();
    const now = Date.now();
    let xpGained = 0;

    // Check each achievement
    const updatedAchievements = achievements.map((achievement) => {
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
        case "twenty_documents":
          progress = Math.min(stats.documentsCompleted, 20);
          unlocked = stats.documentsCompleted >= 20;
          break;
        case "three_day_streak":
          progress = Math.min(stats.currentStreak, 3);
          unlocked = stats.currentStreak >= 3;
          break;
        case "seven_day_streak":
          progress = Math.min(stats.currentStreak, 7);
          unlocked = stats.currentStreak >= 7;
          break;
        case "explorer":
          progress = Math.min(stats.categoriesExplored.size, 3);
          unlocked = stats.categoriesExplored.size >= 3;
          break;
        case "level_up":
          progress = Math.min(stats.totalXP, 500);
          unlocked = stats.totalXP >= 500;
          break;
      }

      // Update achievement
      const updatedAchievement = { ...achievement, progress };

      // If just unlocked, update unlockedAt and add XP
      if (unlocked && achievement.unlockedAt === null) {
        updatedAchievement.unlockedAt = now;
        xpGained += this.XP_VALUES.ACHIEVEMENT_UNLOCKED;
      }

      return updatedAchievement;
    });

    // Save updated achievements
    this.saveAchievements(updatedAchievements);

    // If XP gained, update stats
    if (xpGained > 0) {
      this.addXP(xpGained);
    }
  }

  // Challenge functions
  public static getChallenges(): ReadingChallenge[] {
    const storedChallenges = localStorage.getItem(
      this.STORAGE_KEYS.READING_CHALLENGES
    );

    if (!storedChallenges) {
      // Initialize default challenges
      const defaultChallenges = this.generateDailyChallenges();
      this.saveChallenges(defaultChallenges);
      return defaultChallenges;
    }

    try {
      const challenges = JSON.parse(storedChallenges);

      // Check if daily challenges need to be refreshed
      const needsRefresh = this.dailyChallengesNeedRefresh(challenges);
      if (needsRefresh) {
        const newChallenges = this.generateDailyChallenges();
        this.saveChallenges(newChallenges);
        return newChallenges;
      }

      return challenges;
    } catch (error) {
      console.error("Error parsing challenges:", error);
      return this.generateDailyChallenges();
    }
  }

  public static saveChallenges(challenges: ReadingChallenge[]): void {
    localStorage.setItem(
      this.STORAGE_KEYS.READING_CHALLENGES,
      JSON.stringify(challenges)
    );
  }

  private static generateDailyChallenges(): ReadingChallenge[] {
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

  private static dailyChallengesNeedRefresh(
    challenges: ReadingChallenge[]
  ): boolean {
    // Check if challenges have expired
    const now = Date.now();
    const allExpired = challenges.every(
      (challenge) => challenge.expiresAt !== null && challenge.expiresAt < now
    );

    // Also check if it's a new day since the challenges were created
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const hasExpiredChallenge = challenges.some(
      (challenge) =>
        challenge.expiresAt !== null &&
        challenge.expiresAt < todayStart.getTime()
    );

    return allExpired || hasExpiredChallenge;
  }

  private static updateChallenges(path: string): void {
    const challenges = this.getChallenges();
    const history = this.getReadingHistory();
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
      Array.from(uniqueTodayDocs)
        .map((docPath) => this.getCategoryFromPath(docPath))
        .filter(Boolean)
    );
    const isNewDocument =
      history.filter((item) => item.path === path).length === 1;

    // Update each challenge
    const updatedChallenges = challenges.map((challenge) => {
      // Skip already completed challenges or expired challenges
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

      return updatedChallenge;
    });

    // Save updated challenges
    this.saveChallenges(updatedChallenges);

    // If XP gained, update stats
    if (xpGained > 0) {
      this.addXP(xpGained);
    }
  }

  // XP functions
  private static addXP(amount: number): void {
    const stats = this.getReadingStats();
    const oldLevel = stats.level;

    stats.totalXP += amount;
    stats.level = this.calculateLevel(stats.totalXP);

    // Save updated stats
    this.saveReadingStats(stats);

    // If level increased, check achievements
    if (stats.level > oldLevel) {
      this.checkAchievements();
    }
  }

  // Utility functions
  private static getAvailableDocuments(): FileMetadata[] {
    // In a real app, you would get this from your document store
    // For now, we'll use a placeholder count
    return window.availableDocuments || [];
  }

  // Reading preferences
  public static getReadingPreferences(): ReadingPreferences {
    const storedPreferences = localStorage.getItem(
      this.STORAGE_KEYS.READING_PREFERENCES
    );

    const defaultPreferences: ReadingPreferences = {
      dailyGoal: 3,
      reminderEnabled: false,
      favoriteCategories: [],
      theme: "default",
    };

    if (!storedPreferences) return defaultPreferences;

    try {
      return { ...defaultPreferences, ...JSON.parse(storedPreferences) };
    } catch (error) {
      console.error("Error parsing reading preferences:", error);
      return defaultPreferences;
    }
  }

  public static saveReadingPreferences(preferences: ReadingPreferences): void {
    localStorage.setItem(
      this.STORAGE_KEYS.READING_PREFERENCES,
      JSON.stringify(preferences)
    );
  }

  // Make available documents accessible to our service
  public static setAvailableDocuments(documents: FileMetadata[]): void {
    window.availableDocuments = documents;
  }
}

// Add to Window interface
declare global {
  interface Window {
    availableDocuments?: FileMetadata[];
  }
}
