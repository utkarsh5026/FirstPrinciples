import React, { useMemo } from "react";
import { ReadingByWeekDay } from "../trends";
import { useReadingMetrics } from "@/context";

/**
 * 📅 WeekilyPattern Component
 *
 * This component visualizes the user's reading activity throughout the week.
 * It provides a bar chart representation of how many documents were read on each day,
 * helping users identify their most active reading days. 📈✨
 *
 * If there are no reading activities recorded, it encourages users to read more
 * to uncover their day patterns. 📖💡
 *
 * The component also highlights the day with the highest reading activity,
 * making it easy for users to see when they are most engaged. 🌟
 */
const WeekilyPattern: React.FC = () => {
  const { analyticsData } = useReadingMetrics();

  const mostActiveDay = useMemo(() => {
    if (analyticsData.weeklyActivity.length === 0) return null;
    return analyticsData.weeklyActivity.reduce(
      (max, day) => (day.count > max.count ? day : max),
      analyticsData.weeklyActivity[0]
    );
  }, [analyticsData.weeklyActivity]);

  return (
    <div className="space-y-2">
      <h5 className="text-xs uppercase text-muted-foreground font-medium">
        Day of Week Preference
      </h5>

      <div className="h-48">
        <ReadingByWeekDay />
      </div>

      <div className="text-xs text-muted-foreground text-center mt-1">
        {mostActiveDay
          ? `Most active: ${mostActiveDay.day}`
          : "No data yet"}
      </div>
    </div>
  );
};

export default WeekilyPattern;
