import {
  calculateTotalReadingByHour,
  calculateTotalWeeklyActivity,
  calculateTotalDailyActivity,
  getDailyActivityMetrics,
  getWeeklyActivityMetrics,
  getReadingByHourMetrics,
} from "./activity";
import {
  ReadingHistoryService,
  type ReadingHistoryItem,
} from "./ReadingHistoryService";

import { calculateStreak, createCategoryBreakdown } from "./analytics";

const readingHistoryService = new ReadingHistoryService();

export {
  calculateStreak,
  createCategoryBreakdown,
  calculateTotalReadingByHour,
  calculateTotalWeeklyActivity,
  calculateTotalDailyActivity,
  getDailyActivityMetrics,
  getWeeklyActivityMetrics,
  getReadingByHourMetrics,
  readingHistoryService,
  type ReadingHistoryItem,
};
