import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { BarChart3, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useMobile from "@/hooks/useMobile";

// Type for the heatmap activity data
interface ActivityData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: ActivityData[];
  title?: string;
  subtitle?: string;
  className?: string;
  onMonthChange?: (month: string) => void;
}

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
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type MonthData = {
  month: number;
  name: string;
  totalCount: number;
  activeDays: number;
  daysInMonth: number;
};

type DisplayData =
  | {
      weeks: {
        date: string;
        day: number;
        count: number;
        isCurrentMonth: boolean;
      }[][];
      totalDays: number;
    }
  | {
      months: MonthData[];
    };

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  title = "Reading Activity",
  subtitle = "Your reading habits over time",
  className,
  onMonthChange,
}) => {
  const { isMobile } = useMobile();
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [viewMode, setViewMode] = useState<"year" | "month">("month");
  const [maxCount, setMaxCount] = useState(0);
  const [displayData, setDisplayData] = useState<DisplayData | null>();
  const [highlightedDay, setHighlightedDay] = useState<string | null>(null);

  // Get the current date as a YYYY-MM-DD string for highlighting "today"
  const today = new Date().toISOString().split("T")[0];

  // Extract year and month from currentMonth state
  const [year, month] = currentMonth.split("-").map(Number);

  useEffect(() => {
    if (data.length === 0) {
      setMaxCount(0);
      return;
    }

    // Create a map of date -> count
    const dateMap: Record<string, number> = {};
    data.forEach((item) => {
      dateMap[item.date] = item.count;
    });

    // Find max count for color scaling
    const max = Math.max(...data.map((d) => d.count));
    setMaxCount(max > 0 ? max : 1);

    // If in month view, generate display data for the current month
    if (viewMode === "month") {
      const monthData = generateMonthData(year, month, dateMap);
      setDisplayData(monthData);
    } else {
      // Year view processing
      const yearData = generateYearData(year, dateMap);
      setDisplayData(yearData);
    }

    // Inform parent component if needed
    if (onMonthChange) {
      onMonthChange(currentMonth);
    }
  }, [data, currentMonth, viewMode, onMonthChange]);

  // Function to organize data by week
  // const organizeDataByWeek = (
  //   dateMap: Record<string, number>,
  //   currentMonth: string,
  //   viewMode: "year" | "month"
  // ) => {
  //   const [year, month] = currentMonth.split("-").map(Number);
  //   const result = [];

  //   if (viewMode === "month") {
  //     // For month view, organize days into weeks
  //     const firstDay = new Date(year, month - 1, 1);
  //     const lastDay = new Date(year, month, 0);

  //     // Calculate the first day to display (might be from previous month)
  //     const startDate = new Date(firstDay);
  //     startDate.setDate(startDate.getDate() - startDate.getDay());

  //     // Calculate the last day to display (might be from next month)
  //     const endDate = new Date(lastDay);
  //     if (endDate.getDay() < 6) {
  //       endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  //     }

  //     // Create week arrays
  //     const currentDate = new Date(startDate);
  //     let currentWeek = [];

  //     while (currentDate <= endDate) {
  //       const dateStr = currentDate.toISOString().split("T")[0];
  //       const count = dateMap[dateStr] || 0;

  //       currentWeek.push({
  //         date: dateStr,
  //         count,
  //         day: currentDate.getDate(),
  //         isCurrentMonth: currentDate.getMonth() + 1 === month,
  //       });

  //       if (currentDate.getDay() === 6) {
  //         result.push([...currentWeek]);
  //         currentWeek = [];
  //       }

  //       currentDate.setDate(currentDate.getDate() + 1);
  //     }

  //     if (currentWeek.length > 0) {
  //       result.push(currentWeek);
  //     }
  //   } else {
  //     // For year view, organize months
  //     for (let m = 0; m < 12; m++) {
  //       const monthData = [];
  //       const daysInMonth = new Date(year, m + 1, 0).getDate();

  //       for (let d = 1; d <= daysInMonth; d++) {
  //         const dateStr = `${year}-${String(m + 1).padStart(2, "0")}-${String(
  //           d
  //         ).padStart(2, "0")}`;
  //         const count = dateMap[dateStr] || 0;
  //         monthData.push({ date: dateStr, count });
  //       }

  //       // Calculate total count for the month
  //       const totalCount = monthData.reduce((sum, day) => sum + day.count, 0);
  //       result.push({
  //         month: m + 1,
  //         name: months[m],
  //         count: totalCount,
  //         days: monthData,
  //       });
  //     }
  //   }

  //   return result;
  // };

  // Generate detailed data for month view
  const generateMonthData = (
    year: number,
    month: number,
    dateMap: Record<string, number>
  ) => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

    const days = [];

    // Previous month days to fill the first week
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      days.push({
        date: dateStr,
        day,
        count: dateMap[dateStr] || 0,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      days.push({
        date: dateStr,
        day,
        count: dateMap[dateStr] || 0,
        isCurrentMonth: true,
      });
    }

    // Next month days to complete the grid
    const remainingDays = (7 - ((firstDay + daysInMonth) % 7)) % 7;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      days.push({
        date: dateStr,
        day,
        count: dateMap[dateStr] || 0,
        isCurrentMonth: false,
      });
    }

    // Organize into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return { weeks, totalDays: daysInMonth };
  };

  // Generate data for year view
  const generateYearData = (year: number, dateMap: Record<string, number>) => {
    const monthsData = [];

    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      let totalCount = 0;
      let activeDays = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(m + 1).padStart(2, "0")}-${String(
          d
        ).padStart(2, "0")}`;
        const count = dateMap[dateStr] || 0;
        totalCount += count;
        if (count > 0) activeDays++;
      }
      monthsData.push({
        month: m + 1,
        name: months[m],
        totalCount,
        activeDays,
        daysInMonth,
      });
    }

    return { months: monthsData };
  };

  // Navigate to the previous month
  const goToPrevMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    if (month === 1) {
      setCurrentMonth(`${year - 1}-12`);
    } else {
      setCurrentMonth(`${year}-${String(month - 1).padStart(2, "0")}`);
    }
  };

  // Navigate to the next month
  const goToNextMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    if (month === 12) {
      setCurrentMonth(`${year + 1}-01`);
    } else {
      setCurrentMonth(`${year}-${String(month + 1).padStart(2, "0")}`);
    }
  };

  // Toggle between month and year view
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "month" ? "year" : "month"));
  };

  // Go to current month
  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    );
    setViewMode("month");
  };

  // Handle cell hover/focus
  const handleCellFocus = (dateStr: string) => {
    setHighlightedDay(dateStr);
  };

  // Handle cell blur/mouse leave
  const handleCellBlur = () => {
    setHighlightedDay(null);
  };

  // Get color for a given count
  const getColorForCount = (count: number) => {
    if (count === 0) return "bg-secondary/20";

    // Calculate intensity (0-4)
    const intensity = Math.min(Math.floor((count / maxCount) * 5), 4);

    // More vibrant color palette
    const colorClasses = [
      "bg-primary/10", // Level 1 (lowest)
      "bg-primary/25", // Level 2
      "bg-primary/50", // Level 3
      "bg-primary/75", // Level 4
      "bg-primary", // Level 5 (highest)
    ];

    return colorClasses[intensity];
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get current month name and year for display
  const currentMonthName = months[month - 1];
  const currentMonthDisplay = `${currentMonthName} ${year}`;

  // Determine if we have data to display
  const hasData = data.length > 0 && data.some((item) => item.count > 0);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-primary" />
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={goToCurrentMonth}
            aria-label="Go to current month"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={toggleViewMode}
            aria-label={
              viewMode === "month"
                ? "Switch to year view"
                : "Switch to month view"
            }
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Navigation controls */}
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={goToPrevMonth}
          >
            &larr; Prev
          </Button>

          <h4 className="text-sm font-medium">{currentMonthDisplay}</h4>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={goToNextMonth}
          >
            Next &rarr;
          </Button>
        </div>

        {hasData ? (
          <>
            {/* Month View */}
            {viewMode === "month" && displayData && "weeks" in displayData && (
              <div className="mt-2">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 text-center mb-1">
                  {weekdays.map((day) => (
                    <div key={day} className="text-xs text-muted-foreground">
                      {isMobile ? day.charAt(0) : day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="space-y-1">
                  {displayData.weeks.map(
                    (
                      week: {
                        date: string;
                        day: number;
                        count: number;
                        isCurrentMonth: boolean;
                      }[],
                      weekIndex: number
                    ) => (
                      <div key={weekIndex} className="grid grid-cols-7 gap-1">
                        {week.map((day) => {
                          const isHighlighted = day.date === highlightedDay;
                          const isToday = day.date === today;

                          return (
                            <Tooltip key={day.date}>
                              <div
                                className={cn(
                                  "aspect-square rounded-md flex items-center justify-center relative cursor-pointer transition-all",
                                  getColorForCount(day.count),
                                  !day.isCurrentMonth && "opacity-40",
                                  isHighlighted && "ring-2 ring-primary",
                                  isToday && "ring-1 ring-primary/50"
                                )}
                                tabIndex={0}
                                aria-label={`${formatDate(day.date)}: ${
                                  day.count
                                } reads`}
                                onMouseEnter={() => handleCellFocus(day.date)}
                                onMouseLeave={handleCellBlur}
                                onFocus={() => handleCellFocus(day.date)}
                                onBlur={handleCellBlur}
                              >
                                <span
                                  className={cn(
                                    "text-xs",
                                    day.count > 0
                                      ? "text-foreground"
                                      : "text-muted-foreground",
                                    isHighlighted && "font-medium"
                                  )}
                                >
                                  {day.day}
                                </span>

                                {day.count > 0 && (
                                  <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-white/30"></div>
                                )}
                              </div>
                            </Tooltip>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Year View */}
            {viewMode === "year" && displayData && "months" in displayData && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                {displayData.months.map((monthData: MonthData) => {
                  return (
                    <Button
                      key={monthData.month}
                      variant="outline"
                      className={cn(
                        "h-auto p-3 flex flex-col items-center justify-center border-primary/20",
                        getColorForCount(monthData.totalCount),
                        month === monthData.month && "ring-2 ring-primary"
                      )}
                      onClick={() => {
                        setCurrentMonth(
                          `${year}-${String(monthData.month).padStart(2, "0")}`
                        );
                        setViewMode("month");
                      }}
                    >
                      <span className="font-medium">{monthData.name}</span>
                      <div className="flex items-center mt-1 gap-1">
                        {monthData.totalCount > 0 ? (
                          <Badge
                            variant="secondary"
                            className="text-xs h-5 bg-background/30"
                          >
                            {monthData.totalCount} reads
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No activity
                          </span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center">
              <div className="text-xs text-muted-foreground mr-2">Less</div>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "w-5 h-5 rounded-md mx-1",
                    level === 0
                      ? "bg-secondary/20"
                      : `bg-primary/${(level + 1) * 20}`
                  )}
                />
              ))}
              <div className="text-xs text-muted-foreground ml-2">More</div>
            </div>
          </>
        ) : (
          // Empty state
          <div className="text-center py-10">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-sm font-medium">No reading activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your reading activity will appear here as you use the app
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ActivityHeatmap;
