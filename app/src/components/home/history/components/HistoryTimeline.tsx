import React, { memo } from "react";
import { Calendar, Clock } from "lucide-react";
import { ReadingHistoryItem } from "@/components/home/types";
import getIconForTech from "@/components/icons/iconMap";

interface HistoryTimelineProps {
  filteredHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
  formatDate: (timestamp: number) => string;
  isMobile?: boolean;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = memo(
  ({ filteredHistory, handleSelectDocument, isMobile = false }) => {
    // Group history items by date
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

    // Sort dates in descending order
    const sortedDates = Object.keys(groupedByDate).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    // Format date for display
    const formatDisplayDate = (dateString: string) => {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if date is today
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      }

      // Check if date is yesterday
      if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      }

      // Otherwise return formatted date
      return date.toLocaleDateString("en-US", {
        weekday: isMobile ? "short" : "long",
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    };

    // Determine icon size based on mobile/desktop
    const iconSize = isMobile ? "h-8 w-8" : "h-10 w-10";
    const innerIconSize = isMobile ? "h-4 w-4" : "h-5 w-5";
    const timelineLeft = isMobile ? "left-4" : "left-[38px]";
    const leftMargin = isMobile ? "ml-10" : "ml-16";

    return (
      <div className="space-y-6 md:space-y-8 pb-10 relative">
        {/* Vertical timeline line */}
        <div
          className={`absolute ${timelineLeft} top-2 bottom-0 w-0.5 bg-primary/10`}
          style={{ zIndex: 1 }}
        ></div>

        {sortedDates.map((dateKey) => (
          <div key={dateKey} className="relative">
            <div className="flex items-center mb-2 md:mb-3">
              <div
                className={`${iconSize} bg-primary/20 rounded-full flex items-center justify-center mr-3 md:mr-4 relative z-10`}
              >
                <Calendar className={`${innerIconSize} text-primary`} />
              </div>
              <h3 className="text-base md:text-lg font-medium">
                {formatDisplayDate(dateKey)}
              </h3>
            </div>

            <div className={`${leftMargin} space-y-2 md:space-y-3`}>
              {groupedByDate[dateKey].map((item, idx) => {
                const CategoryIcon = getIconForTech(item.path.split("/")[0]);
                return (
                  <div
                    key={idx}
                    className="p-2 md:p-3 rounded-2xl border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer flex items-center gap-2 md:gap-3"
                    onClick={() => handleSelectDocument(item.path, item.title)}
                  >
                    <div className="h-6 w-6 md:h-8 md:w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <CategoryIcon className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm md:text-base truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] md:text-xs text-muted-foreground flex items-center mt-0.5">
                        <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                        {new Date(item.lastReadAt).toLocaleTimeString("en-US", {
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

export default HistoryTimeline;
