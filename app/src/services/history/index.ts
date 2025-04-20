import {
  calculateTotalReadingByHour,
  calculateTotalWeeklyActivity,
  calculateTotalDailyActivity,
  getDailyActivityMetrics,
  getWeeklyActivityMetrics,
  getReadingByHourMetrics,
} from "./activity";
import { type ReadingHistoryItem } from "../reading/reading-history-service";

import { calculateStreak, createCategoryBreakdown } from "./analytics";

export {
  calculateStreak,
  createCategoryBreakdown,
  calculateTotalReadingByHour,
  calculateTotalWeeklyActivity,
  calculateTotalDailyActivity,
  getDailyActivityMetrics,
  getWeeklyActivityMetrics,
  getReadingByHourMetrics,
  type ReadingHistoryItem,
};
