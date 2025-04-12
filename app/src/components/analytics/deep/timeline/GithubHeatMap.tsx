import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useMobile from "@/hooks/useMobile";

interface GitHubStyleHeatmapProps {
  readingHistory: ReadingHistoryItem[];
}

type WeekData = {
  week: number;
  days: {
    date: Date;
    count: number;
    hasActivity: boolean;
    dateStr: string;
  }[];
};

// Helper to format date as YYYY-MM-DD
const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const GitHubStyleHeatmap: React.FC<GitHubStyleHeatmapProps> = ({
  readingHistory,
}) => {
  const { isMobile } = useMobile();

  // Generate heat map data for last 52 weeks (1 year)
  const heatmapData = useMemo(() => {
    // Create activity map from reading history
    const activityMap: Record<string, number> = {};

    readingHistory.forEach((item) => {
      const date = new Date(item.lastReadAt);
      const dateKey = formatDateKey(date);
      activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
    });

    // Calculate date range: today and 52 weeks ago
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // ~52 weeks
    startDate.setHours(0, 0, 0, 0);

    // Generate weekly data
    const weeks: WeekData[] = [];
    let currentWeek: WeekData = { week: 0, days: [] };
    let weekCounter = 0;

    // Loop through each day in the date range
    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateStr = formatDateKey(currentDate);
      const dayOfWeek = currentDate.getDay();
      const count = activityMap[dateStr] || 0;

      // If it's a new week (Sunday or first day), start a new week array
      if (dayOfWeek === 0 || currentWeek.days.length === 0) {
        if (currentWeek.days.length > 0) {
          weeks.push(currentWeek);
        }
        weekCounter++;
        currentWeek = { week: weekCounter, days: [] };
      }

      // Add day data to current week
      currentWeek.days.push({
        date: new Date(currentDate),
        count,
        hasActivity: count > 0,
        dateStr,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add the last week if it has any days
    if (currentWeek.days.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [readingHistory]);

  // Find max count for proper color scaling
  const maxCount = useMemo(() => {
    let max = 0;
    heatmapData.forEach((week) => {
      week.days.forEach((day) => {
        if (day.count > max) max = day.count;
      });
    });
    return Math.max(max, 1); // Ensure we don't divide by zero
  }, [heatmapData]);

  // Get color intensity based on activity count
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-secondary/20";

    // Calculate intensity on a scale of 0-4
    const intensity = Math.min(Math.floor((count / maxCount) * 4), 4);

    const colorClasses = [
      "bg-primary/10", // Level 1 (lowest)
      "bg-primary/25", // Level 2
      "bg-primary/40", // Level 3
      "bg-primary/70", // Level 4
      "bg-primary", // Level 5 (highest)
    ];

    return colorClasses[intensity];
  };

  // Get month label positions
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    if (heatmapData.length === 0) return labels;

    let currentMonth = -1;

    heatmapData.forEach((week, weekIndex) => {
      if (week.days.length > 0) {
        const firstDayOfWeek = week.days[0].date;
        const month = firstDayOfWeek.getMonth();

        if (month !== currentMonth) {
          currentMonth = month;
          labels.push({
            month: months[month],
            weekIndex,
          });
        }
      }
    });

    // Show fewer month labels on mobile
    if (isMobile && labels.length > 6) {
      return labels.filter((_, i) => i % 2 === 0);
    }

    return labels;
  }, [heatmapData, isMobile]);

  // Format date for tooltip
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.01, delayChildren: 0.1 },
    },
  };

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 },
    },
  };

  // Generate total contributions summary
  const totalContributions = useMemo(() => {
    let total = 0;
    let daysWithActivity = 0;

    heatmapData.forEach((week) => {
      week.days.forEach((day) => {
        total += day.count;
        if (day.count > 0) daysWithActivity++;
      });
    });

    return { total, daysWithActivity };
  }, [heatmapData]);

  // If no data, show a message
  if (heatmapData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        No reading data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contribution summary */}
      <div className="text-xs text-muted-foreground mb-2">
        <span className="font-medium text-foreground">
          {totalContributions.total}
        </span>{" "}
        documents read across{" "}
        <span className="font-medium text-foreground">
          {totalContributions.daysWithActivity}
        </span>{" "}
        days in the last year
      </div>

      <div className="relative">
        {/* Month labels on top */}
        <div className="flex mb-1 pl-7 text-xs text-muted-foreground">
          {monthLabels.map((label, i) => (
            <div
              key={`month-${i}`}
              className="absolute text-xs"
              style={{
                left: `${(label.weekIndex / heatmapData.length) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              {label.month}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day of week labels */}
          <div className="flex flex-col justify-around pr-2 text-xs text-muted-foreground h-[120px]">
            <div>Mon</div>
            <div>Wed</div>
            <div>Fri</div>
          </div>

          {/* Heatmap grid */}
          <motion.div
            className="flex flex-1 gap-1 overflow-x-auto scrollbar-hide"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {heatmapData.map((week, weekIndex) => (
              <div key={`week-${week.week}`} className="flex flex-col gap-1">
                {/* Fill in empty cells for incomplete first week */}
                {weekIndex === 0 &&
                  week.days[0].date.getDay() !== 0 &&
                  Array.from({ length: week.days[0].date.getDay() }).map(
                    (_, i) => <div key={`empty-${i}`} className="w-3 h-3"></div>
                  )}

                {week.days.map((day, dayIndex) => (
                  <Tooltip key={`day-${day.dateStr}`} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <motion.div
                        variants={cellVariants}
                        className={cn(
                          "w-3 h-3 rounded-sm cursor-pointer transform transition-all duration-100 hover:scale-125",
                          getColorClass(day.count)
                        )}
                        style={{
                          // Small randomized animation delay for wave effect
                          transitionDelay: `${
                            ((weekIndex * 7 + dayIndex) % 5) * 20
                          }ms`,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-card/95 backdrop-blur-sm border-primary/10 shadow-lg text-xs"
                    >
                      <div className="font-medium">{formatDate(day.date)}</div>
                      {day.count === 0 ? (
                        <span className="text-muted-foreground">
                          No reading activity
                        </span>
                      ) : (
                        <span>
                          {day.count}{" "}
                          {day.count === 1 ? "document" : "documents"} read
                        </span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end mt-2 text-xs">
        <div className="text-muted-foreground mr-2">Less</div>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "w-3 h-3 rounded-sm mx-1",
              level === 0 ? "bg-secondary/20" : `bg-primary/${(level + 1) * 20}`
            )}
          />
        ))}
        <div className="text-muted-foreground ml-2">More</div>
      </div>
    </div>
  );
};

export default GitHubStyleHeatmap;
