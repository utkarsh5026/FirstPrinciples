import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import { daysOfWeek } from "@/utils/time";
import { create } from "zustand";
import { useHistoryStore } from "./historyStore";
import { parseError } from "@/utils/error";

type DailyActivity = {
  day: number;
  count: number;
};

type WeeklyActivity = {
  day: (typeof daysOfWeek)[number];
  count: number;
};

type HourlyActivity = {
  hour: number;
  count: number;
};

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
  ) => WeeklyActivity[];
  calculateTotalReadingByHour: (
    history: ReadingHistoryItem[]
  ) => HourlyActivity[];
  calculateTotalDailyActivity: (
    history: ReadingHistoryItem[]
  ) => DailyActivity[];
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
  useHistoryStore.subscribe((state) => {
    const weeklyActivity = get().calculateTotalWeeklyActivity(
      state.readingHistory
    );
    const readingByHour = get().calculateTotalReadingByHour(
      state.readingHistory
    );
    const dailyActivity = get().calculateTotalDailyActivity(
      state.readingHistory
    );
    set({
      totalWeeklyActivity: weeklyActivity,
      totalReadingByHour: readingByHour,
      totalDailyActivity: dailyActivity,
    });
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
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: 0,
      }));

      history.forEach((item) => {
        const hour = new Date(item.lastReadAt).getHours();
        hourlyData[hour].count++;
      });

      return hourlyData;
    },

    /**
     * 🗓️ Discovers which days of the week you read the most!
     * Perfect for seeing if you're a weekend reader or weekday warrior.
     */
    calculateTotalWeeklyActivity: (history) => {
      const weeklyData = daysOfWeek.map((day) => ({ day, count: 0 }));

      history.forEach((item) => {
        const dayOfWeek = new Date(item.lastReadAt).getDay();
        weeklyData[dayOfWeek].count++;
      });

      return weeklyData;
    },

    /**
     * 📆 Tracks your reading throughout the month!
     * See if you prefer reading at the beginning, middle, or end of the month.
     */
    calculateTotalDailyActivity: (history) => {
      const dailyData = Array.from({ length: 31 }, (_, day) => ({
        day,
        count: 0,
      }));

      history.forEach((item) => {
        const day = new Date(item.lastReadAt).getDate();
        dailyData[day].count++;
      });

      return dailyData;
    },

    /**
     * 🚀 Gets everything up and running!
     * Loads your initial activity data when the app starts.
     */
    initialize: async () => {
      set({ isLoading: true });
      try {
        const history = useHistoryStore.getState().readingHistory;
        const weeklyActivity = get().calculateTotalWeeklyActivity(history);
        const readingByHour = get().calculateTotalReadingByHour(history);
        const dailyActivity = get().calculateTotalDailyActivity(history);
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
      if (dailyActivity.length === 0)
        return {
          mostActiveDay: { day: 0, count: 0 },
          leastActiveDay: { day: 0, count: 0 },
        };

      const mostActiveDay = dailyActivity.reduce(
        (max, day) => (day.count > max.count ? day : max),
        dailyActivity[0]
      );

      const leastActiveDay = dailyActivity.reduce(
        (min, day) => (day.count < min.count ? day : min),
        dailyActivity[0]
      );

      return { mostActiveDay, leastActiveDay };
    },

    /**
     * 📊 Gets the most and least active days of the week!
     * Perfect for seeing if you're a weekend reader or weekday warrior.
     */
    getWeeklyActivityMetrics: (weeklyActivity) => {
      if (weeklyActivity.length === 0)
        return {
          mostActiveDay: { day: "Sunday", count: 0 },
          leastActiveDay: { day: "Sunday", count: 0 },
        };

      const mostActiveDay = weeklyActivity.reduce(
        (max, day) => (day.count > max.count ? day : max),
        weeklyActivity[0]
      );

      const leastActiveDay = weeklyActivity.reduce(
        (min, day) => (day.count < min.count ? day : min),
        weeklyActivity[0]
      );

      return { mostActiveDay, leastActiveDay };
    },

    /**
     * 📊 Gets the most and least active hours of the day!
     * Perfect for seeing if you're a morning or night owl.
     */
    getReadingByHourMetrics: (readingByHour) => {
      if (readingByHour.length === 0)
        return {
          mostActiveHour: { hour: 0, count: 0 },
          leastActiveHour: { hour: 0, count: 0 },
        };

      const mostActiveHour = readingByHour.reduce(
        (max, hour) => (hour.count > max.count ? hour : max),
        readingByHour[0]
      );

      const leastActiveHour = readingByHour.reduce(
        (min, hour) => (hour.count < min.count ? hour : min),
        readingByHour[0]
      );

      return { mostActiveHour, leastActiveHour };
    },
  };
});
