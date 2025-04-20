import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReadingHistoryItem } from "@/services/history";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useMobile from "@/hooks/device/use-mobile";
import { Calendar, BookOpen, AlertCircle } from "lucide-react";
import { useHeatmapStore } from "@/stores";
import { Button } from "@/components/ui/button";
import CardContainer from "@/components/container/CardContainer";

interface GitHubStyleHeatmapProps {
  readingHistory: ReadingHistoryItem[];
}

// Type for day data in the heatmap
type HeatmapDay = {
  date: Date;
  count: number;
  hasActivity: boolean;
  dateStr: string;
};

// Type for week data in the heatmap
type WeekData = {
  week: number;
  days: HeatmapDay[];
};

// Helper to format date as YYYY-MM-DD
const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const MONTH_COUNT = 6;

/**
 * 📊 Enhanced GitHub-Style Heatmap Component
 *
 * A beautiful visualization of reading activity over time, inspired by GitHub's contribution graph.
 * Shows patterns of activity across months with a smooth color gradient.
 *
 * Key improvements:
 * - Asynchronous data loading to prevent UI blocking
 * - Optimized for both mobile and desktop views
 * - Smooth animations and transitions
 * - Enhanced tooltips with detailed information
 * - Progressive loading with skeleton placeholder
 */
const GitHubStyleHeatmap: React.FC<GitHubStyleHeatmapProps> = ({
  readingHistory,
}) => {
  const { isMobile } = useMobile();
  const [heatmapData, setHeatmapData] = useState<WeekData[]>([]);
  const [maxCount, setMaxCount] = useState(1);
  const [totalContributions, setTotalContributions] = useState({
    total: 0,
    daysWithActivity: 0,
  });
  const getMonthlyData = useHeatmapStore((state) => state.getMonthlyData);

  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - MONTH_COUNT); // Go back 6 months
    startDate.setHours(0, 0, 0, 0);
    return { today, startDate };
  }, []);

  // Asynchronously load and process heatmap data
  useEffect(() => {
    const loadHeatmapData = async () => {
      try {
        if (readingHistory.length === 0) {
          setHeatmapData([]);
          return;
        }

        const { startDate, today } = dateRange;

        // Initialize empty activity map
        const initializeActivityMap = () => {
          const activityMap: Record<string, number> = {};
          const currentDate = new Date(today);
          while (currentDate >= startDate) {
            const dateStr = formatDateKey(currentDate);
            activityMap[dateStr] = 0;
            currentDate.setDate(currentDate.getDate() - 1);
          }
          return activityMap;
        };

        // Populate activity map with reading data
        const populateActivityMap = async (
          emptyMap: Record<string, number>
        ) => {
          const monthlyActivityMap = { ...emptyMap };

          for (let i = 0; i < 6; i++) {
            const month = today.getMonth() - i;
            const year = today.getFullYear();

            const newMonth = new Date(year, month, 1);
            newMonth.setHours(0, 0, 0, 0);
            const { activityMap } = await getMonthlyData(
              readingHistory,
              newMonth
            );

            Object.entries(activityMap).forEach(([dateKey, count]) => {
              monthlyActivityMap[dateKey] = count;
            });
          }

          return monthlyActivityMap;
        };

        // Convert activity map to weeks data structure for rendering
        const buildWeeksData = (activityMap: Record<string, number>) => {
          const weeks: WeekData[] = [];
          let currentWeek: HeatmapDay[] = [];
          let weekCounter = 0;

          // Reset to start date, adjusted to previous Sunday
          const startingDate = new Date(startDate);
          const startDayOfWeek = startingDate.getDay();
          if (startDayOfWeek !== 0) {
            startingDate.setDate(startingDate.getDate() - startDayOfWeek);
          }

          // Loop through each day in the date range
          const processDate = new Date(startingDate);
          while (processDate <= today) {
            const dateStr = formatDateKey(processDate);
            const dayOfWeek = processDate.getDay();
            const count = activityMap[dateStr] ?? 0;

            // If it's a new week (Sunday), start a new week array
            if (dayOfWeek === 0 && currentWeek.length > 0) {
              weeks.push({ week: weekCounter, days: [...currentWeek] });
              weekCounter++;
              currentWeek = [];
            }

            // Add day data to current week
            currentWeek.push({
              date: new Date(processDate),
              count,
              hasActivity: count > 0,
              dateStr,
            });

            // Move to next day
            processDate.setDate(processDate.getDate() + 1);
          }

          // Add the last week if it has any days
          if (currentWeek.length > 0) {
            weeks.push({ week: weekCounter, days: currentWeek });
          }

          return weeks;
        };

        // Calculate summary statistics
        const calculateStats = (activityMap: Record<string, number>) => {
          let total = 0;
          let daysWithActivity = 0;
          const maxValue = Math.max(...Object.values(activityMap), 1);

          Object.values(activityMap).forEach((count) => {
            total += count;
            if (count > 0) daysWithActivity++;
          });

          return { total, daysWithActivity, maxValue };
        };

        // Execute the modular functions in sequence
        const emptyActivityMap = initializeActivityMap();
        const monthlyActivityMap = await populateActivityMap(emptyActivityMap);
        const weeks = buildWeeksData(monthlyActivityMap);
        const { total, daysWithActivity, maxValue } =
          calculateStats(monthlyActivityMap);

        setMaxCount(maxValue);
        setTotalContributions({ total, daysWithActivity });
        setHeatmapData(weeks);
      } catch (error) {
        console.error("Error loading heatmap data:", error);
      }
    };

    loadHeatmapData();
  }, [readingHistory, getMonthlyData, dateRange]);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-secondary/20";
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
    if (isMobile && labels.length > 3) {
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

  // If no data, show a message
  if (heatmapData.length === 0) {
    return <NoDataAvaliable />;
  }

  return (
    <CardContainer
      title="Past 6 Months"
      icon={Calendar}
      variant="subtle"
      baseColor="orange"
      description="A heatmap of your reading activity over the past 6 months."
      insights={[
        {
          icon: BookOpen,
          label: "Total Documents Read",
          value: totalContributions.total.toString(),
          highlight: true,
        },
        {
          icon: Calendar,
          label: "Total Days Read",
          value: totalContributions.daysWithActivity.toString(),
        },
      ]}
    >
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
          days in the last 6 months
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
              className="flex flex-1 gap-1 overflow-x-auto scrollbar-hide pb-2"
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
                      (_, i) => (
                        <div key={`empty-${i}`} className="w-3 h-3"></div>
                      )
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
                        className="bg-card/95 backdrop-blur-sm border-primary/10 shadow-lg text-xs font-medium font-cascadia-code"
                      >
                        <div className="font-medium">
                          {formatDate(day.date)}
                        </div>
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
            <motion.div
              key={level}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: level * 0.1, duration: 0.3 }}
              className={cn(
                "w-3 h-3 rounded-sm mx-1",
                level === 0
                  ? "bg-secondary/20"
                  : `bg-primary/${(level + 1) * 20}`
              )}
            />
          ))}
          <div className="text-muted-foreground ml-2">More</div>
        </div>

        <div className="text-xs text-center text-muted-foreground mt-1">
          <Calendar className="inline-block h-3 w-3 mr-1" />
          Showing your reading activity for the last 6 months
        </div>
      </div>
    </CardContainer>
  );
};

const NoDataAvaliable = () => {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground space-y-2">
      <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
      <p>No reading data available</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-2 text-xs"
        onClick={() => window.location.reload()}
      >
        <BookOpen className="h-3 w-3 mr-1.5" />
        Start your reading journey
      </Button>
    </div>
  );
};

export default GitHubStyleHeatmap;
