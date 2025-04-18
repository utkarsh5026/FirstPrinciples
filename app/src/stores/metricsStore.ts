// src/stores/metricsStore.ts
import { create } from "zustand";
import { readingSessionTracker } from "@/services/analytics/ReadingSessionTracker";
import { sectionAnalyticsController } from "@/services/analytics/SectionAnalyticsController";
import {
  readingHistoryService,
  type ReadingHistoryItem,
} from "@/services/history";
import { formatDateKey } from "@/utils/time";
import { useDocumentStore } from "./documentStore";

// Define types
export type ReadingMetrics = {
  totalWordsRead: number;
  totalTimeSpent: number; // in milliseconds
  documentsCompleted: number;
  sectionsCompleted: number;
  averageReadingSpeed: number; // words per minute
  currentStreak: number;
  longestStreak: number;
  lastReadAt: number | null;
  currentLevel: number;
};

export type ReadingAnalyticsData = {
  weeklyActivity: { day: string; count: number }[];
  categoryBreakdown: { name: string; value: number }[];
  readingByHour: { hour: number; count: number }[];
  readingHeatmap: { date: string; count: number }[];
  recentActivity: ReadingHistoryItem[];
};

export type CategoryBreakdown = {
  category: string;
  count: number;
  percentage: number;
  categoryCount: number;
};

// Define the store state
interface MetricsState {
  // State
  metrics: ReadingMetrics;
  analyticsData: ReadingAnalyticsData;
  monthlyData: { name: string; count: number; date: Date }[];
  totalCategoryBreakdown: CategoryBreakdown[];
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshMetrics: () => Promise<void>;
  formatReadingTime: (ms: number) => string;
  createCategoryBreakdown: (
    readingHistory: ReadingHistoryItem[]
  ) => CategoryBreakdown[];
  generateMonthlyData: (
    readingHistory: ReadingHistoryItem[],
    currentMonth: Date
  ) => {
    activityMap: Record<string, number>;
    weeks: number[][];
    daysInMonth: number;
    totalActiveDays: number;
    totalReadings: number;
    maxCount: number;
  };

  // Initialization
  initialize: () => Promise<void>;
}

// Define days of week
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

// Create the metrics store
export const useMetricsStore = create<MetricsState>((set, get) => ({
  // Initial state
  metrics: {
    totalWordsRead: 0,
    totalTimeSpent: 0,
    documentsCompleted: 0,
    sectionsCompleted: 0,
    averageReadingSpeed: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastReadAt: null,
    currentLevel: 0,
  },
  analyticsData: {
    weeklyActivity: daysOfWeek.map((day) => ({ day, count: 0 })),
    categoryBreakdown: [],
    readingByHour: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
    })),
    readingHeatmap: [],
    recentActivity: [],
  },
  monthlyData: [],
  totalCategoryBreakdown: [],
  isLoading: true,
  error: null,

  // Actions
  refreshMetrics: async () => {
    set({ isLoading: true });
    try {
      // Get section reading data
      const sectionProgress =
        await sectionAnalyticsController.getSectionReadingProgress();
      const documentStats = await sectionAnalyticsController.getDocumentStats();

      // Get session data for time tracking
      const sessions = await readingSessionTracker.getAllSessions();

      // Get reading history
      const history = await readingHistoryService.getAllHistory();

      // Calculate total time spent
      const totalTimeSpent = sessions.reduce((total, session) => {
        if (session.activeTime) {
          return total + session.activeTime;
        } else if (session.duration) {
          return total + session.duration;
        }
        return total;
      }, 0);

      // Calculate total words read
      const totalWordsRead = sessions.reduce((total, session) => {
        return total + (session.wordCount ?? 0);
      }, 0);

      // Get document completion count
      const documentsCompleted = documentStats.filter(
        (doc) => doc.completionPercentage >= 100
      ).length;

      // Calculate average reading speed (words per minute)
      const minutesSpent = totalTimeSpent / (1000 * 60);
      const averageReadingSpeed =
        minutesSpent > 0 ? Math.round(totalWordsRead / minutesSpent) : 0;

      // Get last read timestamp
      const lastReadDocument = documentStats.sort(
        (a, b) => b.lastReadAt - a.lastReadAt
      )[0];

      const lastReadAt = lastReadDocument ? lastReadDocument.lastReadAt : null;

      // Calculate reading streak
      const readingDays = getUniqueReadingDays(history);
      const { currentStreak, longestStreak } =
        calculateReadingStreak(readingDays);

      // Generate analytics data
      const analyticsData = generateAnalyticsData(history);

      // Generate monthly data
      const monthlyData = generateMonthlyData(history);

      // Create category breakdown
      const totalCategoryBreakdown = get().createCategoryBreakdown(history);

      // Update metrics state
      set({
        metrics: {
          totalWordsRead,
          totalTimeSpent,
          documentsCompleted,
          sectionsCompleted: sectionProgress.completedSections,
          averageReadingSpeed,
          currentStreak,
          longestStreak,
          lastReadAt,
          currentLevel: 0, // Will be updated from XP store
        },
        analyticsData,
        monthlyData,
        totalCategoryBreakdown,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error refreshing metrics:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to refresh metrics",
        isLoading: false,
      });
    }
  },

  formatReadingTime: (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  },

  createCategoryBreakdown: (readingHistory) => {
    const categoryMap: Record<string, number> = {};
    readingHistory.forEach((item) => {
      const category = item.path.split("/")[0] || "uncategorized";
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const total = Object.values(categoryMap).reduce(
      (sum, count) => sum + count,
      0
    );

    const availableDocuments = useDocumentStore.getState().availableDocuments;

    const result = Object.entries(categoryMap);
    return result
      .map(([category, count]) => ({
        category,
        count,
        categoryCount: availableDocuments.filter(
          (doc) => doc.path.split("/")[0] === category
        ).length,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  },

  generateMonthlyData: (readingHistory, currentMonth) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create a map of dates to activity counts
    const activityMap: Record<string, number> = {};

    // Initialize all days in the month with zero
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = formatDateKey(date);
      activityMap[dateKey] = 0;
    }

    // Add reading counts
    readingHistory.forEach((item) => {
      const date = new Date(item.lastReadAt);
      // Only include if in the current month
      if (date.getMonth() === month && date.getFullYear() === year) {
        const dateKey = formatDateKey(date);
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

    return {
      activityMap,
      weeks,
      daysInMonth,
      totalActiveDays,
      totalReadings,
      maxCount,
    };
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      await get().refreshMetrics();
    } catch (error) {
      console.error("Error initializing metrics:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize metrics",
        isLoading: false,
      });
    }
  },
}));

// Helper functions
function getUniqueReadingDays(history: ReadingHistoryItem[]): string[] {
  const readingDays = new Set<string>();

  history.forEach((item) => {
    if (item.lastReadAt) {
      const date = new Date(item.lastReadAt);
      const dateString = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;
      readingDays.add(dateString);
    }
  });

  return Array.from(readingDays).sort((a, b) => a.localeCompare(b));
}

function calculateReadingStreak(readingDays: string[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (readingDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort reading days (oldest first)
  const sortedDays = [...readingDays].sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  // Check if today or yesterday is in the reading days
  const today = new Date();
  const todayString = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = `${yesterday.getFullYear()}-${
    yesterday.getMonth() + 1
  }-${yesterday.getDate()}`;

  const hasToday = readingDays.includes(todayString);
  const hasYesterday = readingDays.includes(yesterdayString);

  // Calculate current streak
  let currentStreak = 0;

  if (hasToday || hasYesterday) {
    // Start with 1 for today/yesterday
    currentStreak = 1;

    // Start checking from yesterday or day before
    const startDate = hasToday ? yesterday : new Date(yesterday);
    startDate.setDate(startDate.getDate() - 1);

    const checkDate = startDate;

    // Go back day by day until streak breaks
    while (true) {
      const checkDateString = `${checkDate.getFullYear()}-${
        checkDate.getMonth() + 1
      }-${checkDate.getDate()}`;

      if (readingDays.includes(checkDateString)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = currentStreak;
  let tempStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const current = new Date(sortedDays[i]);
    const prev = new Date(sortedDays[i - 1]);

    const diffTime = current.getTime() - prev.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return { currentStreak, longestStreak };
}

function generateAnalyticsData(
  history: ReadingHistoryItem[]
): ReadingAnalyticsData {
  const weeklyData = daysOfWeek.map((day) => ({ day, count: 0 }));

  history.forEach((item) => {
    const dayOfWeek = new Date(item.lastReadAt).getDay();
    weeklyData[dayOfWeek].count++;
  });

  // Category breakdown data
  const categories: Record<string, number> = {};

  history.forEach((item) => {
    // Extract category from path
    const category = item.path.split("/")[0] || "uncategorized";
    categories[category] = (categories[category] || 0) + 1;
  });

  // Convert to array format for charts
  const categoryBreakdown = Object.entries(categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Reading by hour data
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: 0,
  }));

  history.forEach((item) => {
    const hour = new Date(item.lastReadAt).getHours();
    hourlyData[hour].count++;
  });

  // Reading heatmap data
  const heatmapData: Record<string, number> = {};
  const today = new Date();

  // Initialize last 90 days with 0 count
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    heatmapData[dateString] = 0;
  }

  // Count reading activities
  history.forEach((item) => {
    const date = new Date(item.lastReadAt);
    const dateString = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    if (heatmapData[dateString] !== undefined) {
      heatmapData[dateString]++;
    }
  });

  // Convert to array format for visualization
  const readingHeatmap = Object.entries(heatmapData)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Recent activity
  const recentActivity = [...history]
    .sort((a, b) => b.lastReadAt - a.lastReadAt)
    .slice(0, 5);

  return {
    weeklyActivity: weeklyData,
    categoryBreakdown,
    readingByHour: hourlyData,
    readingHeatmap,
    recentActivity,
  };
}

function generateMonthlyData(
  history: ReadingHistoryItem[]
): { name: string; count: number; date: Date }[] {
  const months: Record<string, number> = {};
  const now = new Date();
  const monthsToShow = 6;

  // Create a key for each month (YYYY-MM)
  const createMonthKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth() + 1}`;

  // Initialize data for the last 6 months
  for (let i = 0; i < monthsToShow; i++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const monthKey = createMonthKey(d);
    months[monthKey] = 0;
  }

  // Fill month data with reading counts
  history.forEach((item) => {
    const date = new Date(item.lastReadAt);
    const monthKey = createMonthKey(date);
    if (months[monthKey] !== undefined) {
      months[monthKey]++;
    }
  });

  // Convert to array format for charts
  return Object.entries(months)
    .map(([key, count]) => {
      const [year, month] = key.split("-").map(Number);
      const date = new Date(year, month - 1);
      return {
        name: date.toLocaleDateString("en-US", { month: "short" }),
        count,
        date,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Initialize the store when it's imported
if (typeof window !== "undefined") {
  useMetricsStore.getState().initialize();
}
