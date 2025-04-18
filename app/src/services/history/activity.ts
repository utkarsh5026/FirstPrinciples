import { daysOfWeek } from "@/utils/time";
import type { ReadingHistoryItem } from "./ReadingHistoryService";

export type DailyActivity = {
  day: number;
  count: number;
};

export type WeeklyActivity = {
  day: (typeof daysOfWeek)[number];
  count: number;
};

export type HourlyActivity = {
  hour: number;
  count: number;
};

/**
 * 📊 Reading Analytics Utilities
 *
 * A collection of helpful functions that analyze reading patterns and habits!
 * These functions power our beautiful charts and insights to help readers
 * understand their reading behaviors better.
 */

/**
 * ⏰ Discovers what hours of the day you love to read!
 *
 * Analyzes your reading history to show patterns across a 24-hour cycle.
 * Perfect for finding out if you're a night owl or early bird reader!
 */
export const calculateTotalReadingByHour = (
  history: ReadingHistoryItem[]
): HourlyActivity[] => {
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: 0,
  }));

  history.forEach((item) => {
    const hour = new Date(item.lastReadAt).getHours();
    hourlyData[hour].count++;
  });

  return hourlyData;
};

/**
 * 📅 Reveals which days of the week you read the most!
 *
 * Tracks reading patterns across the week to show if you're a
 * weekend warrior or weekday reader. So fun to see your habits!
 */
export const calculateTotalWeeklyActivity = (
  history: ReadingHistoryItem[]
): WeeklyActivity[] => {
  const weeklyData = daysOfWeek.map((day) => ({ day, count: 0 }));

  history.forEach((item) => {
    const dayOfWeek = new Date(item.lastReadAt).getDay();
    weeklyData[dayOfWeek].count++;
  });

  return weeklyData;
};

/**
 * 📆 Tracks your reading throughout the month!
 *
 * Shows if you prefer reading at the beginning, middle, or end of each month.
 * A lovely way to visualize your monthly reading rhythm!
 */
export const calculateTotalDailyActivity = (
  history: ReadingHistoryItem[]
): DailyActivity[] => {
  const dailyData = Array.from({ length: 31 }, (_, day) => ({
    day,
    count: 0,
  }));

  history.forEach((item) => {
    const day = new Date(item.lastReadAt).getDate();
    dailyData[day].count++;
  });

  return dailyData;
};

/**
 * 📊 Gets the most and least active days of the week!
 * Perfect for seeing if you're a weekend reader or weekday warrior.
 */
export const getDailyActivityMetrics = (
  dailyActivity: DailyActivity[]
): {
  mostActiveDay: DailyActivity;
  leastActiveDay: DailyActivity;
} => {
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
};

/**
 * 📊 Gets the most and least active days of the week!
 * Perfect for seeing if you're a weekend reader or weekday warrior.
 */
export const getWeeklyActivityMetrics = (
  weeklyActivity: WeeklyActivity[]
): {
  mostActiveDay: WeeklyActivity;
  leastActiveDay: WeeklyActivity;
} => {
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
};

/**
 * 📊 Gets the most and least active hours of the day!
 * Perfect for seeing if you're a morning or night owl.
 */
export const getReadingByHourMetrics = (
  readingByHour: HourlyActivity[]
): {
  mostActiveHour: HourlyActivity;
  leastActiveHour: HourlyActivity;
} => {
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
};
