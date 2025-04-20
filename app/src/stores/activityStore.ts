import { create } from "zustand";
import { useHistoryStore } from "./reading/history-store";
import { parseError } from "@/utils/functions/error";
import type {
  DailyActivity,
  WeeklyActivity,
  HourlyActivity,
} from "@/services/analytics/activity-analyzer";
import { analyticsWorkerManager } from "@/infrastructure/workers";

type State = {
  totalWeeklyActivity: WeeklyActivity[];
  totalReadingByHour: HourlyActivity[];
  totalDailyActivity: DailyActivity[];

  isLoading: boolean;
  error: string | null;
};

type Actions = {
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
export const useActivityStore = create<State & Actions>((set) => {
  /*
   🔄 Listen for changes in reading history and update activity stats
   */
  useHistoryStore.subscribe(async (state) => {
    try {
      const [weeklyActivity, readingByHour, dailyActivity] = await Promise.all([
        analyticsWorkerManager.calculateWeeklyActivity(state.readingHistory),
        analyticsWorkerManager.calculateReadingByHour(state.readingHistory),
        analyticsWorkerManager.calculateDailyActivity(state.readingHistory),
      ]);

      set({
        totalWeeklyActivity: weeklyActivity,
        totalReadingByHour: readingByHour,
        totalDailyActivity: dailyActivity,
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
     * 🚀 Gets everything up and running!
     * Loads your initial activity data when the app starts.
     */
    initialize: async () => {
      set({ isLoading: true });
      try {
        const history = useHistoryStore.getState().readingHistory;
        const weeklyActivity =
          await analyticsWorkerManager.calculateWeeklyActivity(history);
        const readingByHour =
          await analyticsWorkerManager.calculateReadingByHour(history);
        const dailyActivity =
          await analyticsWorkerManager.calculateDailyActivity(history);
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
  };
});
