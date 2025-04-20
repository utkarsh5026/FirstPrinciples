import { WeeklyActivity } from "@/services/analytics/activity-analyzer";

type WeeklyActivityInsights = {
  dayData: (WeeklyActivity & {
    shortDay: string;
    isWeekend: boolean;
    isPeak: boolean;
    comparedToAvg: number;
  })[];
  peakDay: WeeklyActivity | null;
  lowestDay: WeeklyActivity | null;
  average: number;
  totalCount: number;
  weekdayAvg: number;
  weekendAvg: number;
  weekdayTotal: number;
  weekendTotal: number;
  preferredType: string | null;
  maxValue: number;
};

export const generateWeeklyActivityInsights = (
  weeklyActivity: WeeklyActivity[]
): WeeklyActivityInsights => {
  if (!weeklyActivity || weeklyActivity.length === 0) {
    return {
      dayData: [],
      peakDay: null,
      lowestDay: null,
      average: 0,
      totalCount: 0,
      weekdayAvg: 0,
      weekendAvg: 0,
      weekdayTotal: 0,
      weekendTotal: 0,
      preferredType: null,
      maxValue: 0,
    };
  }

  // Calculate peak and lowest days
  const peakDay = [...weeklyActivity].sort((a, b) => b.count - a.count)[0];
  const activeDays = weeklyActivity.filter((day) => day.count > 0);
  const lowestDay =
    activeDays.length > 0
      ? [...activeDays].sort((a, b) => a.count - b.count)[0]
      : null;

  // Calculate totals and averages
  const totalCount = weeklyActivity.reduce((sum, day) => sum + day.count, 0);
  const average = totalCount / 7;

  // Calculate weekday vs weekend averages
  const weekdays = weeklyActivity.filter(
    (day) => !["Saturday", "Sunday"].includes(day.day)
  );
  const weekends = weeklyActivity.filter((day) =>
    ["Saturday", "Sunday"].includes(day.day)
  );

  const weekdayTotal = weekdays.reduce((sum, day) => sum + day.count, 0);
  const weekendTotal = weekends.reduce((sum, day) => sum + day.count, 0);

  const weekdayAvg = weekdayTotal / 5;
  const weekendAvg = weekendTotal / 2;

  let preferredType;
  if (weekdayAvg > weekendAvg) {
    preferredType = "weekday";
  } else if (weekendAvg > weekdayAvg) {
    preferredType = "weekend";
  } else {
    preferredType = "even";
  }

  // Enhance the data with additional properties
  const dayData = weeklyActivity.map((day) => {
    // Check if it's a weekend
    const isWeekend = ["Saturday", "Sunday"].includes(day.day);

    // Calculate relative metrics
    const comparedToAvg =
      day.count > 0 ? Math.round((day.count / average - 1) * 100) : 0;

    // Determine if it's the peak day
    const isPeak = day.day === peakDay.day;

    // Add day type and short day name
    return {
      ...day,
      shortDay: day.day.slice(0, 3),
      isWeekend,
      isPeak,
      comparedToAvg,
    };
  });

  // Find maximum value for chart scaling
  const maxValue = Math.max(...dayData.map((day) => day.count));

  return {
    dayData,
    peakDay,
    lowestDay,
    average,
    totalCount,
    weekdayAvg,
    weekendAvg,
    weekdayTotal,
    weekendTotal,
    preferredType,
    maxValue,
  };
};
