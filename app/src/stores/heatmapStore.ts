import { create } from "zustand";
import type { LoadingWithError } from "./base/base";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";

export type MonthlyData = {
  activityMap: Record<string, number>;
  weeks: number[][];
  daysInMonth: number;
  totalActiveDays: number;
  totalReadings: number;
  maxCount: number;
  dataHash: string;
};

type State = LoadingWithError & {
  monthCache: Record<string, MonthlyData>;
};

type Actions = {
  getMonthlyData: (
    readingHistory: ReadingHistoryItem[],
    month: Date
  ) => Promise<MonthlyData>;
};

// Helper function to create a hash of the reading history array
const createDataHash = async (
  readingHistory: ReadingHistoryItem[]
): Promise<string> => {
  const sortedData = readingHistory
    .map((item) => item.lastReadAt)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .join("|");

  // Use the Web Crypto API instead of Node's crypto
  const encoder = new TextEncoder();
  const data = encoder.encode(sortedData);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const useHeatmapStore = create<State & Actions>((set, get) => ({
  monthCache: {},
  loading: false,
  error: null,

  getMonthlyData: async (readingHistory, currentMonth) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthKey = createDateKey(new Date(year, month, 1));

    // Create a hash of the reading history
    const currentDataHash = await createDataHash(readingHistory);

    // Check if we have cached data with the same hash
    const cachedData = get().monthCache[monthKey];
    if (cachedData && cachedData.dataHash === currentDataHash) {
      return cachedData;
    }

    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create a map of dates to activity counts
    const activityMap: Record<string, number> = {};

    // Initialize all days in the month with zero
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = createDateKey(date);
      activityMap[dateKey] = 0;
    }

    // Add reading counts
    readingHistory.forEach((item) => {
      const date = new Date(item.lastReadAt);
      // Only include if in the current month
      if (date.getMonth() === month && date.getFullYear() === year) {
        const dateKey = createDateKey(date);
        activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
      }
    });

    // Calculate week structure for the month
    const firstDay = new Date(year, month, 1).getDay(); // 0-6 (Sunday-Saturday)
    const weeks: number[][] = [];
    let currentWeek: number[] = Array(firstDay).fill(-1); // Fill with -1 for empty days

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);

      // Start a new week on Saturday or last day
      if (currentWeek.length === 7 || day === daysInMonth) {
        // Pad the last week if needed
        if (currentWeek.length < 7) {
          currentWeek = [
            ...currentWeek,
            ...Array(7 - currentWeek.length).fill(-1),
          ];
        }

        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Calculate stats
    let totalActiveDays = 0;
    let totalReadings = 0;

    Object.values(activityMap).forEach((count) => {
      if (count > 0) {
        totalActiveDays++;
        totalReadings += count;
      }
    });

    // Find max count for color scale
    const maxCount = Math.max(...Object.values(activityMap), 1);

    const result = {
      activityMap,
      weeks,
      daysInMonth,
      totalActiveDays,
      totalReadings,
      maxCount,
      dataHash: currentDataHash,
    };

    set((state) => ({
      monthCache: {
        ...state.monthCache,
        [monthKey]: result,
      },
    }));
    return result;
  },
}));

export const createDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};
