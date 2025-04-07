import React, { memo } from "react";
import { Calendar, FileText, Clock } from "lucide-react";
import { ReadingHistoryItem } from "@/components/home/types";

interface HistoryTimelineProps {
  filteredHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
  formatDate: (timestamp: number) => string;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = memo(
  ({ filteredHistory, handleSelectDocument }) => {
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
        weekday: "long",
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    };

    return (
      <div className="space-y-8 pb-10 relative">
        {/* Vertical timeline line */}
        <div
          className="absolute left-[38px] top-2 bottom-0 w-0.5 bg-primary/10"
          style={{ zIndex: 1 }}
        ></div>

        {sortedDates.map((dateKey) => (
          <div key={dateKey} className="relative">
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center mr-4 relative z-10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-medium">
                {formatDisplayDate(dateKey)}
              </h3>
            </div>

            <div className="ml-16 space-y-3">
              {groupedByDate[dateKey].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer flex items-center gap-3"
                  onClick={() => handleSelectDocument(item.path, item.title)}
                >
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(item.lastReadAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

export default HistoryTimeline;
