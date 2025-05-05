import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useMobile from "@/hooks/device/use-mobile";
import { getMonthName } from "@/utils/time";
import { useHeatmapStore } from "@/stores";
import CardContainer from "@/components/shared/container/CardContainer";

interface HeatmapViewProps {
  filteredHistory: ReadingHistoryItem[];
  usePrevNextButtons?: boolean;
  compact?: boolean;
}

type CalendarData = {
  date: string;
  count: number;
  dayOfMonth: number;
  dayOfWeek: number;
};

/**
 * 📊 HeatMapView Component
 *
 * A beautiful calendar heatmap that visualizes reading activity over time.
 * Shows intensity of reading with color gradients - darker means more reading!
 *
 * ✨ Features:
 * - Month navigation with pretty animations
 * - Color-coded activity visualization
 * - Detailed tooltips on hover
 * - Responsive design for mobile and desktop
 * - Empty state handling with friendly messages
 */
const HeatmapView: React.FC<HeatmapViewProps> = ({
  filteredHistory,
  usePrevNextButtons = true,
  compact = false,
}) => {
  const { isMobile } = useMobile();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const generateMonthlyData = useHeatmapStore((state) => state.getMonthlyData);
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [maxCount, setMaxCount] = useState<number>(0);

  /**
   * 🔄 Fetches and processes calendar data when month or history changes
   */
  useEffect(() => {
    const generateData = async () => {
      const { activityMap, maxCount } = await generateMonthlyData(
        filteredHistory,
        currentMonth
      );
      setCalendarData(
        Object.entries(activityMap).map(([date, count]) => ({
          date,
          count,
          dayOfMonth: new Date(date).getDate(),
          dayOfWeek: new Date(date).getDay(),
        }))
      );
      setMaxCount(maxCount);
    };
    generateData();
  }, [filteredHistory, currentMonth, generateMonthlyData]);

  /**
   * ⬅️ Navigate to previous month
   */
  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  /**
   * ➡️ Navigate to next month
   */
  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  /**
   * 📅 Jump to current month
   */
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  /**
   * 🎨 Determines cell background color based on activity count
   */
  const getColorForCount = (count: number) => {
    if (count === 0) return "bg-secondary/20";

    const intensity = Math.min(Math.floor((count / maxCount) * 5), 4);

    const colorClasses = [
      "bg-primary/10", // Level 1 (lowest)
      "bg-primary/25", // Level 2
      "bg-primary/50", // Level 3
      "bg-primary/75", // Level 4
      "bg-primary", // Level 5 (highest)
    ];

    return colorClasses[intensity];
  };

  /**
   * ✨ Animation variants for calendar cells
   */
  const cellVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.01, // Staggered animation
        duration: 0.2,
      },
    }),
  };

  const insights = [
    {
      label: "Total Reads",
      value: calendarData.reduce((acc, curr) => acc + curr.count, 0).toString(),
      highlight: true,
    },
    {
      label: "Most Read Day",
      value: calendarData.reduce((acc, curr) => acc + curr.count, 0).toString(),
      highlight: false,
    },
  ];

  return (
    <CardContainer
      title="Monthly Reads"
      icon={Calendar}
      description={`What you have done in this current Month ${currentMonth.toLocaleDateString(
        undefined,
        {
          month: "long",
          year: "numeric",
        }
      )}`}
      variant="subtle"
      insights={compact ? [] : insights}
    >
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Month navigation */}
            <div className="flex justify-between items-center">
              {usePrevNextButtons && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="text-xs hover:bg-primary/5 hover:text-primary transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="text-xs">Previous</span>
                </Button>
              )}

              <motion.div
                key={`${currentMonth.getMonth()}-${currentMonth.getFullYear()}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-medium flex items-center px-2 py-1 rounded-full bg-primary/5"
              >
                {getMonthName(currentMonth.getMonth())}{" "}
                {currentMonth.getFullYear()}
              </motion.div>

              {usePrevNextButtons && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMonth}
                  className="text-xs hover:bg-primary/5 hover:text-primary transition-colors duration-200"
                >
                  <span className="text-xs">Next</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>

            {/* Calendar grid */}
            <div className="space-y-2 mt-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 text-center mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day} className="text-xs text-muted-foreground">
                      {isMobile ? day.charAt(0) : day}
                    </div>
                  )
                )}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({
                  length: new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    1
                  ).getDay(),
                }).map((_, i) => (
                  <div key={`empty-start-${i}`} className="aspect-square"></div>
                ))}

                {/* Day cells */}
                {calendarData.map(({ date, count, dayOfMonth }, index) => (
                  <Tooltip key={date} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <motion.div
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cellVariants}
                        className={cn(
                          "aspect-square rounded-2xl flex items-center justify-center relative cursor-pointer transition-all",
                          "hover:shadow-md hover:scale-105 hover:z-10 transform-gpu",
                          getColorForCount(count)
                        )}
                      >
                        <span className="text-xs">{dayOfMonth}</span>
                        {count > 0 && (
                          <div
                            className={cn(
                              "absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full",
                              count > maxCount / 2
                                ? "bg-white/50"
                                : "bg-primary/50"
                            )}
                          ></div>
                        )}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      className="bg-card/95 backdrop-blur-sm border-primary/10 shadow-lg rounded-2xl font-cascadia-code"
                    >
                      <div className="text-xs">
                        <div className="font-medium">
                          {new Date(date).toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="mt-1">
                          {count === 0 ? (
                            <span className="text-muted-foreground">
                              No reading activity
                            </span>
                          ) : (
                            <span className="font-medium">
                              {count} {count === 1 ? "document" : "documents"}{" "}
                              read
                            </span>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center mt-4">
              <div className="text-xs text-muted-foreground mr-2">Less</div>
              {[0, 1, 2, 3, 4].map((level) => (
                <motion.div
                  key={level}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: level * 0.1 }}
                  className={cn(
                    "w-5 h-5 rounded-md mx-1 transition-transform hover:scale-110",
                    level === 0
                      ? "bg-secondary/20"
                      : `bg-primary/${(level + 1) * 20}`
                  )}
                />
              ))}
              <div className="text-xs text-muted-foreground ml-2">More</div>
            </div>

            {usePrevNextButtons && (
              <div className="flex justify-center my-6">
                <Button
                  size="sm"
                  onClick={goToCurrentMonth}
                  className="text-xs bg-primary/40 group hover:bg-primary/10 border-primary/10 rounded-2xl"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5 group-hover:text-primary transition-colors" />
                  Current Month
                </Button>
              </div>
            )}

            {/* Empty state */}
            {calendarData.every((day) => day.count === 0) && (
              <EmptyHeatmapView />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </CardContainer>
  );
};

const EmptyHeatmapView = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-center py-4 text-muted-foreground"
    >
      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-25" />
      <p>No reading activity in this month</p>
      <p className="text-xs mt-1">
        Try changing the time range or navigating to a different month
      </p>
    </motion.div>
  );
};
export default HeatmapView;
