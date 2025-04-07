import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  HelpCircle,
  Filter,
  ArrowLeft,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReadingHistoryItem } from "@/hooks/useDocumentManager";
import { FileMetadata } from "@/utils/MarkdownLoader";
import useMobile from "@/hooks/useMobile";
import { COLORS } from "../utils";

interface TimeFilteredHeatCalendarProps {
  readingHistory: ReadingHistoryItem[];
  availableDocuments: FileMetadata[];
  onSelectCategory?: (category: string) => void;
  onSelectDocument?: (path: string, title: string) => void;
}

type TimeRange = "week" | "month" | "quarter" | "year" | "all";
type ViewMode = "heatmap" | "categories" | "documents";

// Helper function to get the start date based on the selected time range
const getStartDate = (range: TimeRange): Date => {
  const now = new Date();
  switch (range) {
    case "week": {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return weekStart;
    }
    case "month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return monthStart;
    }
    case "quarter": {
      const quarter = Math.floor(now.getMonth() / 3);
      const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
      return quarterStart;
    }
    case "year": {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return yearStart;
    }
    case "all": {
      return new Date(0); // Beginning of time
    }
    default: {
      return new Date(0); // Beginning of time
    }
  }
};

// Helper function to format date as YYYY-MM-DD
const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// Helper function to get month name
const getMonthName = (month: number): string => {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][month];
};

const TimeFilteredHeatCalendar: React.FC<TimeFilteredHeatCalendarProps> = ({
  readingHistory,
  onSelectCategory,
  onSelectDocument,
}) => {
  const { isMobile } = useMobile();
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [viewMode, setViewMode] = useState<ViewMode>("heatmap");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Get all unique categories from reading history
  const categories = useMemo(() => {
    const categorySet = new Set<string>();

    readingHistory.forEach((item) => {
      const category = item.path.split("/")[0];
      if (category) {
        categorySet.add(category);
      }
    });

    return Array.from(categorySet);
  }, [readingHistory]);

  // Filter reading history based on selected time range
  const filteredHistory = useMemo(() => {
    const startDate = getStartDate(timeRange);

    return readingHistory.filter(
      (item) => new Date(item.lastReadAt) >= startDate
    );
  }, [readingHistory, timeRange]);

  // Process reading history for calendar heatmap
  const calendarData = useMemo(() => {
    // For heatmap view
    if (viewMode === "heatmap") {
      const dateMap: Record<string, number> = {};

      // Initialize with zero values for current month
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = formatDateKey(date);
        dateMap[dateKey] = 0;
      }

      // Add reading counts
      filteredHistory.forEach((item) => {
        const date = new Date(item.lastReadAt);
        // Only include if in the current month view
        if (
          date.getMonth() === currentMonth.getMonth() &&
          date.getFullYear() === currentMonth.getFullYear()
        ) {
          const dateKey = formatDateKey(date);
          dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
        }
      });

      // Convert to array format
      return Object.entries(dateMap).map(([date, count]) => ({
        date,
        count,
        dayOfMonth: new Date(date).getDate(),
        dayOfWeek: new Date(date).getDay(),
      }));
    }

    // For categories view
    if (viewMode === "categories") {
      const categoryMap: Record<string, number> = {};

      // Initialize all categories with zero
      categories.forEach((cat) => {
        categoryMap[cat] = 0;
      });

      // Add reading counts
      filteredHistory.forEach((item) => {
        const category = item.path.split("/")[0];
        if (category) {
          categoryMap[category] = (categoryMap[category] || 0) + 1;
        }
      });

      return Object.entries(categoryMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
    }

    // For documents view
    if (viewMode === "documents") {
      const documentMap: Record<string, { count: number; title: string }> = {};

      // Add reading counts
      filteredHistory.forEach((item) => {
        // Filter by selected category if any
        if (selectedCategory && !item.path.startsWith(selectedCategory)) {
          return;
        }

        documentMap[item.path] = {
          count: (documentMap[item.path]?.count || 0) + 1,
          title: item.title,
        };
      });

      return Object.entries(documentMap)
        .map(([path, data]) => ({
          path,
          count: data.count,
          title: data.title,
        }))
        .sort((a, b) => b.count - a.count);
    }

    return [];
  }, [filteredHistory, viewMode, currentMonth, categories, selectedCategory]);

  // Get max count for scaling colors
  const maxCount = useMemo(() => {
    if (viewMode === "heatmap") {
      return Math.max(
        ...(calendarData as Array<{ count: number }>).map((d) => d.count),
        1
      );
    }
    return 1;
  }, [calendarData, viewMode]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  // Go to current month
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // Get color for a count
  const getColorForCount = (count: number) => {
    if (count === 0) return "bg-secondary/20";

    // Calculate intensity (0-4)
    const intensity = Math.min(Math.floor((count / maxCount) * 5), 4);

    // Color palette
    const colorClasses = [
      "bg-primary/10", // Level 1 (lowest)
      "bg-primary/25", // Level 2
      "bg-primary/50", // Level 3
      "bg-primary/75", // Level 4
      "bg-primary", // Level 5 (highest)
    ];

    return colorClasses[intensity];
  };

  return (
    <Card className="p-4 border-primary/10 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium">Reading Timeline</h4>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time range selector */}
          <Select
            value={timeRange}
            onValueChange={(v) => setTimeRange(v as TimeRange)}
          >
            <SelectTrigger className="h-8 text-xs w-24">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          {/* View mode selector */}
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as ViewMode)}
            className="h-8"
          >
            <TabsList className="h-8 p-0.5">
              <TabsTrigger value="heatmap" className="h-7 text-xs px-2">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span className={isMobile ? "" : "inline"}>Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="h-7 text-xs px-2">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <span className={isMobile ? "" : "inline"}>Categories</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="h-7 text-xs px-2">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                <span className={isMobile ? "" : "inline"}>Documents</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Category filter for documents view */}
      {viewMode === "documents" && (
        <div className="mb-4 flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            Filter by category:
          </div>
          <Select
            value={selectedCategory || ""}
            onValueChange={(value) => setSelectedCategory(value || null)}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Heat Calendar View */}
      {viewMode === "heatmap" && (
        <div className="space-y-4">
          {/* Month navigation */}
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-xs">Previous</span>
            </Button>

            <div className="text-sm font-medium">
              {getMonthName(currentMonth.getMonth())}{" "}
              {currentMonth.getFullYear()}
            </div>

            <Button variant="ghost" size="sm" onClick={goToNextMonth}>
              <span className="text-xs">Next</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Calendar grid */}
          <div className="space-y-2">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-xs text-muted-foreground">
                  {isMobile ? day.charAt(0) : day}
                </div>
              ))}
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

              {(
                calendarData as Array<{
                  date: string;
                  count: number;
                  dayOfMonth: number;
                  dayOfWeek: number;
                }>
              ).map((day) => (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "aspect-square rounded-md flex items-center justify-center relative cursor-pointer transition-all",
                        getColorForCount(day.count)
                      )}
                    >
                      <span className="text-xs">{day.dayOfMonth}</span>
                      {day.count > 0 && (
                        <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-white/30"></div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      {new Date(day.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      <div className="font-medium">
                        {day.count} {day.count === 1 ? "document" : "documents"}{" "}
                        read
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center mt-2">
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

          {/* Go to current month button */}
          <div className="flex justify-center mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentMonth}
              className="text-xs"
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Current Month
            </Button>
          </div>

          {/* Empty state */}
          {calendarData.every((day) => day.count === 0) && (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-25" />
              <p>No reading activity in this month</p>
              <p className="text-xs mt-1">
                Try changing the time range or navigating to a different month
              </p>
            </div>
          )}
        </div>
      )}

      {/* Categories View */}
      {viewMode === "categories" && (
        <div className="space-y-4">
          {calendarData.length > 0 ? (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {(calendarData as Array<{ category: string; count: number }>).map(
                (item) => (
                  <div
                    key={item.category}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-secondary/10 transition-colors"
                    onClick={() =>
                      onSelectCategory && onSelectCategory(item.category)
                    }
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.category}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.count}{" "}
                        {item.count === 1 ? "document" : "documents"} read in{" "}
                        {timeRange === "all" ? "all time" : `this ${timeRange}`}
                      </div>
                    </div>
                    <Badge
                      variant={item.count > 0 ? "default" : "outline"}
                      className="text-xs"
                    >
                      {item.count}×
                    </Badge>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No category data for this time period</p>
            </div>
          )}
        </div>
      )}

      {/* Documents View */}
      {viewMode === "documents" && (
        <div className="space-y-4">
          {calendarData.length > 0 ? (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {(
                calendarData as Array<{
                  path: string;
                  title: string;
                  count: number;
                }>
              ).map((item) => (
                <div
                  key={item.path}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-secondary/10 transition-colors"
                  onClick={() =>
                    onSelectDocument && onSelectDocument(item.path, item.title)
                  }
                >
                  <div
                    className="w-2 h-full min-h-[2rem] rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[
                          item.path.split("/")[0].charCodeAt(0) % COLORS.length
                        ],
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      Read {item.count} {item.count === 1 ? "time" : "times"} in{" "}
                      {timeRange === "all" ? "all time" : `this ${timeRange}`}
                    </div>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-primary/20 text-primary text-xs"
                  >
                    {item.count}×
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No document data for this time period</p>
              {selectedCategory && (
                <p className="text-xs mt-1">Try removing the category filter</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <div className="mt-4 flex items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-xs text-muted-foreground cursor-help">
              <HelpCircle className="h-3.5 w-3.5 mr-1" />
              How to use this view
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="text-xs">
              <p className="font-medium mb-1">Reading Timeline Tips:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  Use the time range selector to filter your reading activity
                </li>
                <li>Switch between calendar, category, and document views</li>
                <li>
                  In calendar view, navigate between months to see your reading
                  patterns
                </li>
                <li>
                  In category view, click on a category to explore it further
                </li>
                <li>
                  In document view, use the category filter to focus on specific
                  areas
                </li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </Card>
  );
};

export default TimeFilteredHeatCalendar;
