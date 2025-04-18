import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Tag, ArrowRight } from "lucide-react";
import type { ReadingHistoryItem } from "@/services/history";
import getIconForTech from "@/components/icons/iconMap";
import useMobile from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { fromSnakeToTitleCase } from "@/utils/string";

interface HistoryTimelineProps {
  filteredHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
  formatDate: (timestamp: number) => string;
}

/**
 * Enhanced HistoryTimeline Component
 *
 * A visually stunning timeline view of reading history with smooth animations,
 * date grouping, and visual flourishes that create a delightful experience.
 */
const HistoryTimeline: React.FC<HistoryTimelineProps> = memo(
  ({ filteredHistory, handleSelectDocument }) => {
    const { isMobile } = useMobile();
    const { currentTheme } = useTheme();

    /**
     * Group history items by date for the timeline
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

    // Animation variants
    const container = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    };

    const item = {
      hidden: { opacity: 0, x: -20 },
      show: { opacity: 1, x: 0 },
    };

    const timelineItems = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
    };

    const timelineItem = {
      hidden: { opacity: 0, scale: 0.95 },
      show: { opacity: 1, scale: 1 },
    };

    return (
      <motion.div
        className="space-y-8 md:space-y-10 pb-10 relative"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Timeline vertical line */}
        <div
          className={cn(
            "absolute",
            isMobile ? "left-4" : "left-[38px]",
            "top-2 bottom-0 w-0.5 z-10"
          )}
          style={{
            background: `linear-gradient(to bottom, ${currentTheme.primary}40, ${currentTheme.primary}10)`,
            boxShadow: `0 0 8px ${currentTheme.primary}20`,
          }}
        ></div>

        {sortedDates.map((dateKey, dateIndex) => (
          <motion.div key={dateKey} className="relative" variants={item}>
            <motion.div
              className="flex items-center mb-3 md:mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: dateIndex * 0.1 }}
            >
              <div
                className={cn(
                  isMobile ? "h-10 w-10" : "h-12 w-12",
                  "bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 md:mr-4 relative z-10 shadow-md border border-primary/20"
                )}
                style={{
                  background: `radial-gradient(circle at center, ${currentTheme.primary}20, ${currentTheme.primary}05)`,
                }}
              >
                <Calendar
                  className={cn(
                    isMobile ? "h-5 w-5" : "h-6 w-6",
                    "text-primary"
                  )}
                />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-medium bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {formatDisplayDate(dateKey, isMobile)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {groupedByDate[dateKey].length}{" "}
                  {groupedByDate[dateKey].length === 1
                    ? "document"
                    : "documents"}{" "}
                  read
                </p>
              </div>
            </motion.div>

            <motion.div
              className={cn(
                isMobile ? "ml-12" : "ml-18",
                "space-y-3 md:space-y-4"
              )}
              variants={timelineItems}
            >
              {groupedByDate[dateKey].map(({ path, title, lastReadAt }) => {
                const CategoryIcon = getIconForTech(path.split("/")[0]);

                // Get simple category name
                const category = path.split("/")[0] || "uncategorized";

                // Calculate a color based on the category
                const generateColor = (cat: string) => {
                  let hash = 0;
                  for (let i = 0; i < cat.length; i++) {
                    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
                  }
                  const h = hash % 360;
                  return `hsl(${h}, 80%, 60%)`;
                };

                const categoryColor = generateColor(category);

                return (
                  <motion.div
                    key={path}
                    className="group p-3 md:p-4 rounded-2xl border border-primary/10 hover:border-primary/30 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-all cursor-pointer flex items-center gap-3 md:gap-4 relative overflow-hidden"
                    onClick={() => handleSelectDocument(path, title)}
                    variants={timelineItem}
                    style={{
                      boxShadow: `0 4px 12px ${currentTheme.primary}05`,
                    }}
                  >
                    {/* Decorative background gradient */}
                    <div
                      className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at top right, ${categoryColor}, transparent 70%)`,
                      }}
                    />

                    <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 relative border border-primary/10">
                      <CategoryIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-base md:text-lg truncate group-hover:text-primary transition-colors">
                        {title}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          {new Date(lastReadAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>

                        <div className="flex items-center">
                          <Tag className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          {fromSnakeToTitleCase(category)}
                        </div>
                      </div>
                    </div>

                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center bg-primary/0 group-hover:bg-primary/10 transition-all flex-shrink-0">
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    );
  }
);

/**
 * Format a date string into a user-friendly display format
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
