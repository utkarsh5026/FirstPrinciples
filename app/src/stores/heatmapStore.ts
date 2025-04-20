import { create } from "zustand";
import type { LoadingWithError } from "./base/base";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import { visualizationWorkerManager } from "@/infrastructure/workers";
import {
  type MonthlyData,
  type MonthlyDocumentCounts,
  createDateKey,
} from "@/services/analytics/heatmap-generator";

type MonthlyDataWithHash = MonthlyData & {
  dataHash: string;
};

type State = LoadingWithError & {
  monthCache: Record<string, MonthlyDataWithHash>;
};

type Actions = {
  getMonthlyData: (
    readingHistory: ReadingHistoryItem[],
    month: Date
  ) => Promise<MonthlyDataWithHash>;

  getMonthlyDocumentCounts: (
    readingHistory: ReadingHistoryItem[],
    fromDate: Date,
    toDate: Date
  ) => Promise<MonthlyDocumentCounts>;
};

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

    const currentDataHash = await createDataHash(readingHistory);

    const cachedData = get().monthCache[monthKey];
    if (cachedData && cachedData.dataHash === currentDataHash) {
      return cachedData;
    }

    const {
      activityMap,
      weeks,
      daysInMonth,
      totalActiveDays,
      totalReadings,
      maxCount,
    } = await visualizationWorkerManager.generateMonthlyHeatmapData(
      readingHistory,
      currentMonth
    );

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

  // New function to calculate document counts per month within a date range
  getMonthlyDocumentCounts: async (readingHistory, fromDate, toDate) => {
    return visualizationWorkerManager.generateMonthlyDocumentCounts(
      readingHistory,
      fromDate,
      toDate
    );
  },
}));
