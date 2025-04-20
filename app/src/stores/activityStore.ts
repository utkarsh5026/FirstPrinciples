import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import { create } from "zustand";
import { useHistoryStore } from "./historyStore";
import { parseError } from "@/utils/error";
import {
  DailyActivity,
  WeeklyActivity,
  HourlyActivity,
  getDailyActivityMetrics,
  getWeeklyActivityMetrics,
  getReadingByHourMetrics,
} from "@/services/history/activity";
import { analyticsWorkerManager } from "@/infrastructure/workers";

type State = {
  totalWeeklyActivity: WeeklyActivity[];
  totalReadingByHour: HourlyActivity[];
  totalDailyActivity: DailyActivity[];

  isLoading: boolean;
  error: string | null;
};

type Actions = {
  calculateTotalWeeklyActivity: (
    history: ReadingHistoryItem[]
  ) => Promise<WeeklyActivity[]>;

  calculateTotalReadingByHour: (
    history: ReadingHistoryItem[]
  ) => Promise<HourlyActivity[]>;

  calculateTotalDailyActivity: (
    history: ReadingHistoryItem[]
  ) => Promise<DailyActivity[]>;

  getDailyActivityMetrics: (dailyActivity: DailyActivity[]) => {
    mostActiveDay: DailyActivity;
    leastActiveDay: DailyActivity;
  };
  getWeeklyActivityMetrics: (weeklyActivity: WeeklyActivity[]) => {
    mostActiveDay: WeeklyActivity;
    leastActiveDay: WeeklyActivity;
  };
  getReadingByHourMetrics: (readingByHour: HourlyActivity[]) => {
    mostActiveHour: HourlyActivity;
    leastActiveHour: HourlyActivity;
  };
  initialize: () => Promise<void>;
};

/**
 * 📊 Activity Store
 *
 * This magical store tracks all your reading activity patterns! ✨
 * It automatically syncs with your reading history to show you
 * when you read the most during the day, week, and month.
 *
 * Features:
 * - 📅 Shows which days of the week you read the most
 * - ⏰ Tracks your favorite reading hours
 * - 📆 Monitors your daily reading habits throughout the month
 */
export const useActivityStore = create<State & Actions>((set, get) => {
  /*
   🔄 Listen for changes in reading history and update activity stats
   */
  useHistoryStore.subscribe(async (state) => {
    try {
      get()
        .calculateTotalWeeklyActivity(state.readingHistory)
        .then((weeklyActivity) => {
          set({ totalWeeklyActivity: weeklyActivity });
        });
      get()
        .calculateTotalReadingByHour(state.readingHistory)
        .then((readingByHour) => {
          set({ totalReadingByHour: readingByHour });
        });
      get()
        .calculateTotalDailyActivity(state.readingHistory)
        .then((dailyActivity) => {
          set({ totalDailyActivity: dailyActivity });
        });
    } catch (error) {
      set({ error: parseError(error) });
    }
  });

  return {
    totalWeeklyActivity: [],
    totalReadingByHour: [],
    totalDailyActivity: [],
    isLoading: false,
    error: null,

    /**
     * ⏰ Analyzes what hours of the day you love to read!
     * Shows your reading patterns across a 24-hour cycle.
     */
    calculateTotalReadingByHour: (history) => {
      return analyticsWorkerManager.calculateReadingByHour(history);
    },

    /**
     * 🗓️ Discovers which days of the week you read the most!
     * Perfect for seeing if you're a weekend reader or weekday warrior.
     */
    calculateTotalWeeklyActivity: (history) => {
      return analyticsWorkerManager.calculateWeeklyActivity(history);
    },

    /**
     * 📆 Tracks your reading throughout the month!
     * See if you prefer reading at the beginning, middle, or end of the month.
     */
    calculateTotalDailyActivity: (history) => {
      return analyticsWorkerManager.calculateDailyActivity(history);
    },

    /**
     * 🚀 Gets everything up and running!
     * Loads your initial activity data when the app starts.
     */
    initialize: async () => {
      set({ isLoading: true });
      try {
        const history = useHistoryStore.getState().readingHistory;
        const weeklyActivity = await get().calculateTotalWeeklyActivity(
          history
        );
        const readingByHour = await get().calculateTotalReadingByHour(history);
        const dailyActivity = await get().calculateTotalDailyActivity(history);
        set({
          totalWeeklyActivity: weeklyActivity,
          totalReadingByHour: readingByHour,
          totalDailyActivity: dailyActivity,
          isLoading: false,
        });
      } catch (error) {
        set({ isLoading: false, error: parseError(error) });
      }
    },

    /**
     * 📊 Gets the most and least active days of the week!
     * Perfect for seeing if you're a weekend reader or weekday warrior.
     */
    getDailyActivityMetrics: (dailyActivity) => {
      return getDailyActivityMetrics(dailyActivity);
    },

    /**
     * 📊 Gets the most and least active days of the week!
     * Perfect for seeing if you're a weekend reader or weekday warrior.
     */
    getWeeklyActivityMetrics: (weeklyActivity) => {
      return getWeeklyActivityMetrics(weeklyActivity);
    },

    /**
     * 📊 Gets the most and least active hours of the day!
     * Perfect for seeing if you're a morning or night owl.
     */
    getReadingByHourMetrics: (readingByHour) => {
      return getReadingByHourMetrics(readingByHour);
    },
  };
});
