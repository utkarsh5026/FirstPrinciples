import useMobile from "@/hooks/device/use-mobile";
import { useMemo } from "react";
import { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import { Calendar } from "lucide-react";

import { motion } from "framer-motion";
import getIconForTech from "@/components/icons/iconMap";
import { fromSnakeToTitleCase } from "@/utils/string";

interface HistoryTimelineProps {
  filteredHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  filteredHistory,
  handleSelectDocument,
}) => {
  const { isMobile } = useMobile();

  // Group history items by date
  const groupedHistory = useMemo(() => {
    const grouped: Record<string, ReadingHistoryItem[]> = {};

    filteredHistory.forEach((item) => {
      const date = new Date(item.lastReadAt);
      const dateKey = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(item);
    });

    // Sort dates in descending order
    return Object.entries(grouped)
      .sort(
        ([dateA], [dateB]) =>
          new Date(dateB).getTime() - new Date(dateA).getTime()
      )
      .map(([dateKey, items]) => {
        const date = new Date(dateKey);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let displayDate = "";
        if (date.toDateString() === today.toDateString()) {
          displayDate = "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
          displayDate = "Yesterday";
        } else {
          displayDate = date.toLocaleDateString("en-US", {
            weekday: isMobile ? "short" : "long",
            month: "short",
            day: "numeric",
          });
        }

        return { date: displayDate, items };
      });
  }, [filteredHistory, isMobile]);

  return (
    <div className="relative space-y-4">
      {/* Timeline vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/10 z-0"></div>

      {groupedHistory.map((group, groupIndex) => (
        <div key={group.date} className="relative">
          <motion.div
            className="flex items-center mb-2 mt-8"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: groupIndex * 0.05 }}
          >
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center z-10 mr-3">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-medium text-primary/90">
              {group.date}
            </h3>
          </motion.div>

          <div className="ml-10 space-y-2">
            {group.items.map((item, index) => {
              const category = item.path.split("/")[0] || "uncategorized";
              const CategoryIcon = getIconForTech(category);
              const title = fromSnakeToTitleCase(
                item.path.split("/").pop()?.replace(".md", "") ?? ""
              );

              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  className="border border-primary/10 hover:border-primary/30 hover:bg-primary/5 rounded-2xl flex items-center cursor-pointer p-4"
                  onClick={() => handleSelectDocument(item.path, item.title)}
                >
                  <CategoryIcon className="h-4 w-4 text-primary mr-2" />
                  <span className="text-xs truncate">{title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(item.lastReadAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryTimeline;
