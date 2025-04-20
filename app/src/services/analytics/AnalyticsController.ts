import { databaseService } from "@/infrastructure/storage";
import {
  type ReadingSession,
  readingSessionTracker,
} from "./ReadingSessionTracker";
import { type ReadingHistoryItem } from "@/services/history";
import * as readingListService from "@/services/reading/reading-list-service";
import { readingStatsService } from "./ReadingStatsService";
import type { FileMetadata } from "@/services/document/document-loader";
import * as readingHistoryService from "@/services/reading/reading-history-service";
import { countWords } from "./word-count-estimation";

/**
 * Controller that orchestrates all analytics services
 */
export class AnalyticsController {
  // Reference to available documents
  private availableDocuments: FileMetadata[] = [];

  /**
   * Initialize all analytics services
   * @returns Promise that resolves when initialization is complete
   */
  public async initialize(): Promise<void> {
    try {
      console.log("Initializing analytics services...");
      // Initialize database
      await databaseService.initDatabase();
      console.log("Database initialized");

      // Warm up services by accessing them
      await readingHistoryService.getAllHistory();
      await readingListService.getAllItems();
      await readingStatsService.getStats();
      await readingStatsService.getAchievements();
      await readingStatsService.getChallenges();

      console.log("All analytics services initialized");
    } catch (error) {
      console.error("Error initializing analytics services:", error);
      throw error;
    }
  }

  /**
   * Set available documents to enable percentage calculations
   * @param documents Array of available documents
   */
  public setAvailableDocuments(documents: FileMetadata[]): void {
    this.availableDocuments = documents;
  }

  /**
   * Start reading a document
   * @param path Document path
   * @param title Document title
   * @param content Document content for word counting
   * @returns Promise that resolves when session is started
   */
  public async startReading(
    path: string,
    title: string,
    content?: string
  ): Promise<void> {
    try {
      // Count words in the document if content is provided
      let wordCount;
      if (content) {
        wordCount = countWords(content);
      }

      // Start a reading session
      readingSessionTracker.startSession(path, title, wordCount);
    } catch (error) {
      console.error("Error starting reading session:", error);
      throw error;
    }
  }

  /**
   * End reading a document and update all analytics
   * @param path Document path
   * @param title Document title
   * @param content Optional document content
   * @returns Promise with updated analytics data
   */
  public async endReading(path: string, title: string) {
    try {
      // End the current reading session
      const session = await readingSessionTracker.endSession();

      if (!session) {
        console.warn("No active reading session to end");
        return null;
      }

      // Add to reading history
      await readingHistoryService.addToReadingHistory(path, title);

      // Update stats
      await readingStatsService.updateStats(this.availableDocuments);

      // Check achievements
      await readingStatsService.checkAchievements();

      // Update challenges
      await readingStatsService.updateChallenges(path);

      // Mark as completed in reading list if exists
      const todoItems = await readingListService.getAllItems();
      const todoItem = todoItems.find(
        (item) => item.path === path && !item.completed
      );

      if (todoItem) {
        await readingListService.toggleCompletion(todoItem.id);
      }

      // Return updated analytics data
      return this.getAnalyticsData();
    } catch (error) {
      console.error("Error ending reading session:", error);
      throw error;
    }
  }

  /**
   * Get all analytics data for the current user
   * @returns Promise with comprehensive analytics data
   */
  public async getAnalyticsData() {
    try {
      const [stats, achievements, challenges, history, todoList, sessions] =
        await Promise.all([
          readingStatsService.getStats(),
          readingStatsService.getAchievements(),
          readingStatsService.getChallenges(),
          readingHistoryService.getAllHistory(),
          readingListService.getAllItems(),
          readingSessionTracker.getAllSessions(),
        ]);

      // Calculate additional analytics
      const totalReadingTime = history.reduce(
        (total, item) => total + item.timeSpent,
        0
      );
      const totalWordsRead = history.reduce(
        (total, item) => total + item.wordsRead,
        0
      );
      const completionStats = await readingListService.getCompletionStats();

      // Generate insights
      const insights = this.generateInsights(history, sessions);

      return {
        stats,
        achievements,
        challenges,
        history,
        todoList,
        sessions,
        insights,
        totalReadingTime,
        totalWordsRead,
        completionStats,
      };
    } catch (error) {
      console.error("Error getting analytics data:", error);
      throw error;
    }
  }

  /**
   * Generate insights from reading history and sessions
   * @param history Reading history items
   * @param sessions Reading sessions
   * @returns Object with various insights
   */
  private generateInsights(
    history: ReadingHistoryItem[],
    sessions: ReadingSession[]
  ) {
    // Calculate reading by category
    const categoryData: Record<string, number> = {};
    history.forEach((item) => {
      const category = item.path.split("/")[0] || "uncategorized";
      categoryData[category] = (categoryData[category] || 0) + 1;
    });

    // Sort categories by count
    const categoryBreakdown = Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Calculate reading by weekday
    const weekdayData = [
      { name: "Mon", count: 0 },
      { name: "Tue", count: 0 },
      { name: "Wed", count: 0 },
      { name: "Thu", count: 0 },
      { name: "Fri", count: 0 },
      { name: "Sat", count: 0 },
      { name: "Sun", count: 0 },
    ];

    history.forEach((item) => {
      const day = new Date(item.lastReadAt).getDay();
      const index = day === 0 ? 6 : day - 1; // Adjust to Mon-Sun
      weekdayData[index].count++;
    });

    // Calculate reading by hour
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
    }));

    sessions.forEach((session) => {
      if (session.startTime) {
        const hour = new Date(session.startTime).getHours();
        hourlyData[hour].count++;
      }
    });

    // Calculate reading heatmap data (last 90 days)
    const heatmapData: Record<string, number> = {};
    const today = new Date();

    // Initialize with zeros
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;
      heatmapData[dateString] = 0;
    }

    // Fill with actual data
    history.forEach((item) => {
      const date = new Date(item.lastReadAt);
      const dateString = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;

      if (heatmapData[dateString] !== undefined) {
        heatmapData[dateString]++;
      }
    });

    // Convert to array format for visualization
    const readingHeatmap = Object.entries(heatmapData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Recent activity
    const recentActivity = [...history]
      .sort((a, b) => b.lastReadAt - a.lastReadAt) // src/services/analytics/AnalyticsController.ts (continued)

      .slice(0, 5);

    // Monthly reading data
    const monthlyData = this.generateMonthlyData(history);

    // Find most read category
    const mostReadCategory =
      categoryBreakdown.length > 0 ? categoryBreakdown[0].name : "None yet";

    // Calculate best day for reading
    const bestDay = weekdayData.reduce(
      (best, current) => (current.count > best.count ? current : best),
      weekdayData[0]
    );

    // Calculate best time for reading
    const bestHour = hourlyData.reduce(
      (best, current) => (current.count > best.count ? current : best),
      hourlyData[0]
    );

    // Return all insights
    return {
      categoryBreakdown,
      weekdayData,
      hourlyData,
      readingHeatmap,
      recentActivity,
      monthlyData,
      mostReadCategory,
      bestDay: bestDay.name,
      bestHour: bestHour.hour,
    };
  }

  /**
   * Generate monthly reading data
   * @param history Reading history items
   * @returns Array of monthly reading data
   */
  private generateMonthlyData(history: ReadingHistoryItem[]) {
    const months: Record<string, number> = {};
    const now = new Date();

    // Create entries for last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      months[monthKey] = 0;
    }

    // Fill with actual data
    history.forEach((item) => {
      const date = new Date(item.lastReadAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (months[monthKey] !== undefined) {
        months[monthKey]++;
      }
    });

    // Convert to array format for charts
    return Object.entries(months)
      .map(([key, count]) => {
        const [year, month] = key.split("-").map(Number);
        const date = new Date(year, month - 1);
        return {
          name: date.toLocaleDateString("en-US", { month: "short" }),
          count,
          date,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Reset all analytics data (for testing or user request)
   * @returns Promise that resolves when reset is complete
   */
  public async resetAllData(): Promise<void> {
    try {
      // Confirm with the user first (should be done in UI)

      // Clear all stores
      await databaseService.clearStore("readingHistory");
      await databaseService.clearStore("readingSessions");
      await databaseService.clearStore("readingLists");
      await databaseService.clearStore("stats");
      await databaseService.clearStore("achievements");
      await databaseService.clearStore("challenges");

      // Re-initialize default data
      await readingStatsService.getStats();
      await readingStatsService.getAchievements();
      await readingStatsService.getChallenges();

      console.log("All analytics data has been reset");
    } catch (error) {
      console.error("Error resetting analytics data:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const analyticsController = new AnalyticsController();
