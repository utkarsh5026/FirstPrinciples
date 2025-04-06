// src/hooks/useReadingAnalytics.ts
import { useState, useEffect, useCallback } from "react";
import {
  ReadingAnalyticsService,
  ReadingStats,
  ReadingAchievement,
  ReadingChallenge,
} from "@/utils/ReadingAnalyticsService";
import { ReadingHistoryItem, ReadingTodoItem } from "@/components/home/types";
import { FileMetadata } from "@/utils/MarkdownLoader";

// Types for our hook return value
interface ReadingAnalyticsState {
  stats: ReadingStats;
  achievements: ReadingAchievement[];
  challenges: ReadingChallenge[];
  isLoading: boolean;
  error: string | null;
}

interface ReadingAnalyticsActions {
  recordDocumentRead: (path: string, title: string) => void;
  addToReadingList: (path: string, title: string) => boolean;
  removeFromReadingList: (id: string) => void;
  markAsComplete: (id: string) => void;
  resetProgress: () => void;
  refreshChallenges: () => void;
}

interface ReadingAnalyticsData {
  // Analytics data
  weeklyActivity: { day: string; count: number }[];
  categoryBreakdown: { name: string; value: number }[];
  readingByHour: { hour: number; count: number }[];
  readingHeatmap: { date: string; count: number }[];
  recentActivity: ReadingHistoryItem[];
}

// Hook return type
export interface UseReadingAnalyticsReturn extends ReadingAnalyticsState {
  actions: ReadingAnalyticsActions;
  data: ReadingAnalyticsData;
  readingHistory: ReadingHistoryItem[];
  todoList: ReadingTodoItem[];
}

/**
 * Custom hook for managing reading analytics
 *
 * This hook provides access to reading statistics, achievements,
 * challenges, and actions to update the reading state.
 */
export function useReadingAnalytics(
  availableDocuments: FileMetadata[]
): UseReadingAnalyticsReturn {
  // State for analytics data
  const [state, setState] = useState<ReadingAnalyticsState>({
    stats: ReadingAnalyticsService.getReadingStats(),
    achievements: ReadingAnalyticsService.getAchievements(),
    challenges: ReadingAnalyticsService.getChallenges(),
    isLoading: true,
    error: null,
  });

  // State for derived data
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>(
    []
  );
  const [todoList, setTodoList] = useState<ReadingTodoItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<ReadingAnalyticsData>({
    weeklyActivity: [],
    categoryBreakdown: [],
    readingByHour: [],
    readingHeatmap: [],
    recentActivity: [],
  });

  // Set available documents for the service
  useEffect(() => {
    ReadingAnalyticsService.setAvailableDocuments(availableDocuments);
  }, [availableDocuments]);

  // Load initial data
  useEffect(() => {
    try {
      // Load data from localStorage via the service
      const history = ReadingAnalyticsService.getReadingHistory();
      const todos = ReadingAnalyticsService.getTodoList();
      const stats = ReadingAnalyticsService.getReadingStats();
      const achievements = ReadingAnalyticsService.getAchievements();
      const challenges = ReadingAnalyticsService.getChallenges();

      // Set state
      setReadingHistory(history);
      setTodoList(todos);
      setState({
        stats,
        achievements,
        challenges,
        isLoading: false,
        error: null,
      });

      // Generate analytics data
      generateAnalyticsData(history, todos, availableDocuments);
    } catch (error) {
      console.error("Error loading reading analytics:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load reading analytics",
      }));
    }
  }, [availableDocuments]);

  // Generate analytics data from history and todos
  const generateAnalyticsData = useCallback(
    (
      history: ReadingHistoryItem[],
      todos: ReadingTodoItem[],
      docs: FileMetadata[]
    ) => {
      // Weekly activity data
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const weeklyData = daysOfWeek.map((day) => ({ day, count: 0 }));

      history.forEach((item) => {
        const dayOfWeek = new Date(item.lastReadAt).getDay();
        weeklyData[dayOfWeek].count++;
      });

      // Category breakdown data
      const categories: Record<string, number> = {};

      history.forEach((item) => {
        // Extract category from path
        const category = item.path.split("/")[0] || "uncategorized";
        categories[category] = (categories[category] || 0) + 1;
      });

      // Convert to array format for charts
      const categoryBreakdown = Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Reading by hour data
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: 0,
      }));

      history.forEach((item) => {
        const hour = new Date(item.lastReadAt).getHours();
        hourlyData[hour].count++;
      });

      // Reading heatmap data
      const heatmapData: Record<string, number> = {};
      const today = new Date();

      // Initialize last 90 days with 0 count
      for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`;
        heatmapData[dateString] = 0;
      }

      // Count reading activities
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
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      // Recent activity
      const recentActivity = [...history]
        .sort((a, b) => b.lastReadAt - a.lastReadAt)
        .slice(0, 5);

      // Update analytics data state
      setAnalyticsData({
        weeklyActivity: weeklyData,
        categoryBreakdown,
        readingByHour: hourlyData,
        readingHeatmap,
        recentActivity,
      });
    },
    []
  );

  // Action: Record a document read
  const recordDocumentRead = useCallback(
    (path: string, title: string) => {
      try {
        // Record the read
        const updatedItem = ReadingAnalyticsService.addToReadingHistory(
          path,
          title
        );

        // Update state
        const updatedHistory = [
          updatedItem,
          ...readingHistory.filter((item) => item.path !== path),
        ];

        setReadingHistory(updatedHistory);

        // Update todo list if the document is in it
        const updatedTodos = todoList.map((item) =>
          item.path === path ? { ...item, completed: true } : item
        );

        setTodoList(updatedTodos);
        ReadingAnalyticsService.saveTodoList(updatedTodos);

        // Refresh stats, achievements, and challenges
        setState({
          stats: ReadingAnalyticsService.getReadingStats(),
          achievements: ReadingAnalyticsService.getAchievements(),
          challenges: ReadingAnalyticsService.getChallenges(),
          isLoading: false,
          error: null,
        });

        // Regenerate analytics data
        generateAnalyticsData(updatedHistory, updatedTodos, availableDocuments);
      } catch (error) {
        console.error("Error recording document read:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to record document read",
        }));
      }
    },
    [readingHistory, todoList, availableDocuments, generateAnalyticsData]
  );

  // Action: Add to reading list
  const addToReadingList = useCallback(
    (path: string, title: string) => {
      try {
        // Add to reading list
        const success = ReadingAnalyticsService.addToTodoList(path, title);

        if (success) {
          // Update state
          const updatedTodos = ReadingAnalyticsService.getTodoList();
          setTodoList(updatedTodos);

          // Regenerate analytics data
          generateAnalyticsData(
            readingHistory,
            updatedTodos,
            availableDocuments
          );
        }

        return success;
      } catch (error) {
        console.error("Error adding to reading list:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to add to reading list",
        }));
        return false;
      }
    },
    [readingHistory, availableDocuments, generateAnalyticsData]
  );

  // Action: Remove from reading list
  const removeFromReadingList = useCallback(
    (id: string) => {
      try {
        // Remove from reading list
        ReadingAnalyticsService.removeFromTodoList(id);

        // Update state
        const updatedTodos = ReadingAnalyticsService.getTodoList();
        setTodoList(updatedTodos);

        // Regenerate analytics data
        generateAnalyticsData(readingHistory, updatedTodos, availableDocuments);
      } catch (error) {
        console.error("Error removing from reading list:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to remove from reading list",
        }));
      }
    },
    [readingHistory, availableDocuments, generateAnalyticsData]
  );

  // Action: Mark as complete
  const markAsComplete = useCallback(
    (id: string) => {
      try {
        // Toggle completion status
        ReadingAnalyticsService.toggleTodoCompletion(id);

        // Update state
        const updatedTodos = ReadingAnalyticsService.getTodoList();
        setTodoList(updatedTodos);

        // Regenerate analytics data
        generateAnalyticsData(readingHistory, updatedTodos, availableDocuments);
      } catch (error) {
        console.error("Error marking as complete:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to mark as complete",
        }));
      }
    },
    [readingHistory, availableDocuments, generateAnalyticsData]
  );

  // Action: Reset progress
  const resetProgress = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to reset all reading progress? This cannot be undone."
      )
    ) {
      try {
        // Clear reading history
        ReadingAnalyticsService.clearReadingHistory();

        // Clear todo list
        ReadingAnalyticsService.clearTodoList();

        // Reset stats and achievements
        // NOTE: We're not providing a reset method for these, so we'll reinitialize them
        localStorage.removeItem("readingStats");
        localStorage.removeItem("readingAchievements");
        localStorage.removeItem("readingChallenges");

        // Refresh state
        setReadingHistory([]);
        setTodoList([]);
        setState({
          stats: ReadingAnalyticsService.getReadingStats(),
          achievements: ReadingAnalyticsService.getAchievements(),
          challenges: ReadingAnalyticsService.getChallenges(),
          isLoading: false,
          error: null,
        });

        // Clear analytics data
        setAnalyticsData({
          weeklyActivity: [],
          categoryBreakdown: [],
          readingByHour: [],
          readingHeatmap: [],
          recentActivity: [],
        });
      } catch (error) {
        console.error("Error resetting progress:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to reset progress",
        }));
      }
    }
  }, []);

  // Action: Refresh challenges
  const refreshChallenges = useCallback(() => {
    try {
      // Generate new challenges
      const newChallenges = ReadingAnalyticsService.getChallenges();

      // Update state
      setState((prev) => ({
        ...prev,
        challenges: newChallenges,
      }));
    } catch (error) {
      console.error("Error refreshing challenges:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to refresh challenges",
      }));
    }
  }, []);

  // Create actions object
  const actions: ReadingAnalyticsActions = {
    recordDocumentRead,
    addToReadingList,
    removeFromReadingList,
    markAsComplete,
    resetProgress,
    refreshChallenges,
  };

  // Return state, actions, and derived data
  return {
    ...state,
    actions,
    data: analyticsData,
    readingHistory,
    todoList,
  };
}

export default useReadingAnalytics;
