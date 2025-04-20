import { SectionReadingData } from "@/services/section/SectionReadingService";
import * as Comlink from "comlink";
import {
  getTimeSpentOnDay,
  getTotalWordsRead,
  getReadingSpeed,
  getDailyReadingStats,
  getCategoryStats,
  type CategoryStats,
} from "@/services/analytics/section-analytics";

class SectionWorker {
  getTimeSpentOnDay: (
    date: Date,
    readings: SectionReadingData[]
  ) => Promise<number> = async (date, readings) => {
    return getTimeSpentOnDay(date, readings);
  };

  getTotalWordsRead: (
    readings: SectionReadingData[],
    wordCountMap?: Record<string, number>
  ) => Promise<number> = async (readings, wordCountMap) => {
    return getTotalWordsRead(readings, wordCountMap);
  };

  getReadingSpeed: (readings: SectionReadingData[]) => Promise<number> = async (
    readings
  ) => {
    return getReadingSpeed(readings);
  };

  getDailyReadingStats: (
    readings: SectionReadingData[],
    days: number
  ) => Promise<{ date: string; timeSpent: number; wordsRead: number }[]> =
    async (readings, days) => {
      return getDailyReadingStats(readings, days);
    };

  getCategoryStats: (
    readings: SectionReadingData[]
  ) => Promise<Record<string, CategoryStats>> = async (readings) => {
    return getCategoryStats(readings);
  };
}

Comlink.expose(new SectionWorker());

export {};
