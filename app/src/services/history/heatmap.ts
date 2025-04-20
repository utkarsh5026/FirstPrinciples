import type { ReadingHistoryItem } from "../reading/reading-history-service";

export type MonthlyData = {
  activityMap: Record<string, number>;
  weeks: number[][];
  daysInMonth: number;
  totalActiveDays: number;
  totalReadings: number;
  maxCount: number;
};

export type MonthlyDocumentCounts = {
  months: Array<{
    label: string; // Display name (e.g., "Jan 2024")
    count: number; // Number of unique documents read
    timestamp: number; // Unix timestamp (for sorting)
    year: number; // Year
    month: number; // Month (0-11)
  }>;
  totalDocuments: number;
  maxCount: number;
};

/**
 * 📊 Generates heatmap data for a specific month
 * This function takes reading history and creates a beautiful visualization of activity
 * throughout a month, perfect for showing reading patterns and habits! ✨
 */
export const generateMonthlyHeatmapData = (
  readingHistory: ReadingHistoryItem[],
  currentMonth: Date
): MonthlyData => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  /**
   * 🗓️ Sets up the empty calendar grid
   * Creates a blank slate for our month with all days initialized to zero activity
   */
  const initializeActivityMap = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const activityMap: Record<string, number> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = createDateKey(date);
      activityMap[dateKey] = 0;
    }

    return { activityMap, daysInMonth };
  };

  /**
   * 📚 Counts readings for each day
   * Tallies up how many documents were read on each day of the month
   */
  const processReadingHistory = (activityMap: Record<string, number>) => {
    readingHistory.forEach((item) => {
      const date = new Date(item.lastReadAt);
      if (date.getMonth() === month && date.getFullYear() === year) {
        const dateKey = createDateKey(date);
        activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
      }
    });
    return activityMap;
  };

  /**
   * 📅 Organizes days into weeks
   * Arranges the days into a calendar-like grid with proper spacing for the first day
   * of the month and padding at the end of the last week
   */
  const calculateWeekStructure = (daysInMonth: number) => {
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

    return weeks;
  };

  /**
   * 📈 Calculates activity statistics
   * Computes fun stats like how many days had reading activity and the total
   * number of readings in the month
   */
  const calculateStats = (activityMap: Record<string, number>) => {
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

    return { totalActiveDays, totalReadings, maxCount };
  };

  // Execute the helper functions
  const { activityMap, daysInMonth } = initializeActivityMap();
  processReadingHistory(activityMap);
  const weeks = calculateWeekStructure(daysInMonth);
  const { totalActiveDays, totalReadings, maxCount } =
    calculateStats(activityMap);

  return {
    activityMap,
    weeks,
    daysInMonth,
    totalActiveDays,
    totalReadings,
    maxCount,
  };
};

/**
 * 📚 Tracks document reading over multiple months
 * Creates a beautiful timeline showing how many unique documents were read each month
 * over a specified time period. Perfect for tracking reading habits! 📈
 */
export const calculateMonthlyDocumentCounts = (
  readingHistory: ReadingHistoryItem[],
  fromDate: Date,
  toDate: Date
): MonthlyDocumentCounts => {
  /**
   * 🗓️ Sets up the month-by-month tracking
   * Creates empty buckets for each month in our date range
   */
  const initializeMonthRange = () => {
    // Normalize dates to the first day of their respective months
    const startDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
    const endDate = new Date(toDate.getFullYear(), toDate.getMonth(), 1);

    // Create a map to store monthly document counts
    const monthlyMap: Record<string, Set<string>> = {};

    // Initialize all months in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      monthlyMap[key] = new Set<string>();

      // Move to next month
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
    }

    return { startDate, endDate, monthlyMap };
  };

  /**
   * 📝 Counts unique documents per month
   * Tallies up how many different documents were read in each month
   */
  const processReadingHistory = (
    monthlyMap: Record<string, Set<string>>,
    startDate: Date,
    endDate: Date
  ) => {
    readingHistory.forEach((item) => {
      const date = new Date(item.lastReadAt);
      const itemMonth = new Date(date.getFullYear(), date.getMonth(), 1);

      // Only include if within our date range
      if (itemMonth >= startDate && itemMonth <= endDate) {
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        // Store unique document paths
        monthlyMap[key].add(item.path);
      }
    });

    return monthlyMap;
  };

  /**
   * 🎨 Prepares data for visualization
   * Transforms our data into a pretty format ready for charts and displays
   */
  const convertToVisualizationFormat = (
    monthlyMap: Record<string, Set<string>>
  ) => {
    // Convert to array format for visualization
    const months = Object.entries(monthlyMap)
      .map(([key, docSet]) => {
        const [yearStr, monthStr] = key.split("-");
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        const date = new Date(year, month, 1);

        return {
          year,
          month,
          // Format as "Jan 2024"
          label: date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          count: docSet.size,
          timestamp: date.getTime(),
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp); // Sort chronologically

    // Calculate total and max stats
    const totalDocuments = months.reduce((sum, month) => sum + month.count, 0);
    const maxCount = Math.max(...months.map((month) => month.count), 1);

    return { months, totalDocuments, maxCount };
  };

  // Execute the helper functions
  const { startDate, endDate, monthlyMap } = initializeMonthRange();
  processReadingHistory(monthlyMap, startDate, endDate);
  return convertToVisualizationFormat(monthlyMap);
};

/**
 * 🔑 Creates a standardized date key
 * Formats dates into a consistent string format for easy lookup and comparison
 */
export const createDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};
