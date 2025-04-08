import React, { memo, useMemo } from "react";
import { Calendar, Clock } from "lucide-react";
import { ReadingHistoryItem } from "@/components/home/types";
import getIconForTech from "@/components/icons/iconMap";
import useMobile from "@/hooks/useMobile";
import { cn } from "@/lib/utils";

interface HistoryTimelineProps {
  filteredHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
  formatDate: (timestamp: number) => string;
}

/**
 * 🎉 HistoryTimeline Component
 *
 * This delightful component presents a timeline of your reading history! 📚✨
 * It organizes your reading items by date, making it easy to see what you've read
 * and when! 🗓️💖
 *
 * It also adapts to your device, ensuring a smooth experience whether you're on
 * mobile or desktop! 📱💻
 *
 * With a charming visual layout, it displays each date with a lovely calendar icon
 * and lists the items read on that date, complete with their titles and last read
 * times! ⏰🌟
 *
 * Clicking on an item will let you select it, bringing you back to your reading
 * journey! 🚀📖
 */
const HistoryTimeline: React.FC<HistoryTimelineProps> = memo(
  ({ filteredHistory, handleSelectDocument }) => {
    const { isMobile } = useMobile();

    /**
     * This hook creates a charming timeline of your reading history! 📅✨
     * It groups your reading items by the date they were last read, allowing you to easily
     * see what you've read and when! 🕒💖
     *
     * The dates are sorted in a lovely order, so you can enjoy your reading journey
     * from the most recent to the oldest!
     */
    const { groupedByDate, sortedDates } = useMemo(() => {
      const groupedByDate: Record<string, ReadingHistoryItem[]> = {};
      filteredHistory.forEach((item) => {
        const date = new Date(item.lastReadAt);
        const dateKey = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ).toISOString();

        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(item);
      });

      const sortedDates = Object.keys(groupedByDate).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      );

      return { groupedByDate, sortedDates };
    }, [filteredHistory]);

    return (
      <div className="space-y-6 md:space-y-8 pb-10 relative">
        <div
          className={cn(
            "absolute",
            isMobile ? "left-4" : "left-[38px]",
            "top-2 bottom-0 w-0.5 bg-primary/10 z-10"
          )}
        ></div>

        {sortedDates.map((dateKey) => (
          <div key={dateKey} className="relative">
            <div className="flex items-center mb-2 md:mb-3">
              <div
                className={cn(
                  isMobile ? "h-8 w-8" : "h-10 w-10",
                  "bg-primary/20 rounded-full flex items-center justify-center mr-3 md:mr-4 relative z-10"
                )}
              >
                <Calendar
                  className={cn(
                    isMobile ? "h-4 w-4" : "h-5 w-5",
                    "text-primary"
                  )}
                />
              </div>
              <h3 className="text-base md:text-lg font-medium">
                {formatDisplayDate(dateKey, isMobile)}
              </h3>
            </div>

            <div
              className={cn(
                isMobile ? "ml-10" : "ml-16",
                "space-y-2 md:space-y-3"
              )}
            >
              {groupedByDate[dateKey].map(({ path, title, lastReadAt }) => {
                const CategoryIcon = getIconForTech(path.split("/")[0]);
                return (
                  <div
                    key={path}
                    className="p-2 md:p-3 rounded-2xl border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer flex items-center gap-2 md:gap-3"
                    onClick={() => handleSelectDocument(path, title)}
                  >
                    <div className="h-6 w-6 md:h-8 md:w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <CategoryIcon className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm md:text-base truncate">
                        {title}
                      </div>
                      <div className="text-[10px] md:text-xs text-muted-foreground flex items-center mt-0.5">
                        <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                        {new Date(lastReadAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

/**
 * 🎉 formatDisplayDate Function
 *
 * This cheerful function takes a date and transforms it into a friendly,
 * user-friendly string! 🌟 It helps you understand when something happened
 * in a delightful way! 😊
 *
 * It checks if the date is today or yesterday, and if so, it returns
 * "Today" or "Yesterday" to keep things simple and clear! 🗓️✨
 *
 * For other dates, it formats the date into a lovely string that includes
 * the day of the week, month, and year, adjusting the format based on
 * whether you're on a mobile device or not! 📱💖
 *
 * This way, you can easily see when you last read something, making
 * your reading history feel more personal and engaging! 📚💫
 */
const formatDisplayDate = (dateString: string, isMobile: boolean) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  switch (date.toDateString()) {
    case today.toDateString():
      return "Today";
    case yesterday.toDateString():
      return "Yesterday";
    default:
      return date.toLocaleDateString("en-US", {
        weekday: isMobile ? "short" : "long",
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
  }
};

export default HistoryTimeline;
