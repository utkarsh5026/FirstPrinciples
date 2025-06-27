import { Clock } from "lucide-react";
import { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import { formatTimeAgo } from "@/utils/time";
import { getIconForTech } from "@/components/shared/icons/iconMap";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReadingItemProps {
  item: ReadingHistoryItem;
  onFileSelect: (path: string) => void;
}

const ReadingItem = ({ item, onFileSelect }: ReadingItemProps) => {
  const category = item.path.split("/")[0];
  const CategoryIcon = getIconForTech(category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -1 }}
      className="group"
    >
      <motion.button
        className={cn(
          // Base card styling with responsive design
          "w-full p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl",
          "transition-all duration-200 ease-out",
          "bg-card/80 backdrop-blur-xl",
          "border border-border/30",
          "shadow-md hover:shadow-lg",
          "hover:border-border/50",
          "hover:bg-card/90",
          "text-left focus:outline-none focus:ring-2 focus:ring-primary/20",
          "min-h-[72px] sm:min-h-[80px]", // Ensure touch-friendly height
          "active:scale-[0.98] sm:active:scale-[0.99]" // Different scale for mobile
        )}
        onClick={() => onFileSelect(item.path)}
        whileHover={{ scale: 1.01 }} // Reduced scale for mobile
        whileTap={{ scale: 0.97 }}
      >
        {/* Header section with responsive layout */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Responsive category icon */}
          <div
            className={cn(
              "flex-shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center",
              "w-10 h-10 sm:w-12 sm:h-12", // Responsive icon container
              "bg-primary/10 backdrop-blur-sm",
              "border border-primary/20",
              "group-hover:scale-105 sm:group-hover:scale-110",
              "transition-transform duration-200"
            )}
          >
            <CategoryIcon
              size={16}
              className="text-primary sm:w-5 sm:h-5" // Responsive icon size
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Document title with responsive typography */}
            <h3
              className={cn(
                "font-semibold leading-relaxed mb-1.5 sm:mb-2",
                "text-sm sm:text-base", // Responsive text size
                "text-foreground",
                "group-hover:text-primary",
                "transition-colors duration-200",
                "break-words hyphens-auto", // Ensure text wraps properly
                "line-clamp-2 sm:line-clamp-1" // Limit lines on mobile
              )}
            >
              {item.title}
            </h3>

            {/* Last read timestamp with responsive design */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={cn(
                  "flex-shrink-0 rounded-lg flex items-center justify-center",
                  "w-4 h-4 sm:w-5 sm:h-5", // Responsive clock container
                  "bg-muted/50"
                )}
              >
                <Clock
                  size={10}
                  strokeWidth={2}
                  className="sm:w-3 sm:h-3" // Responsive clock icon
                />
              </div>
              <span className="font-medium text-xs sm:text-sm text-muted-foreground">
                {formatTimeAgo(item.lastReadAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Hover overlay with reduced opacity on mobile */}
        <motion.div
          className={cn(
            "absolute inset-0 bg-primary/5 opacity-0",
            "rounded-2xl sm:rounded-3xl",
            "group-hover:opacity-100 transition-opacity duration-200",
            "pointer-events-none"
          )}
          initial={false}
        />
      </motion.button>
    </motion.div>
  );
};

export default ReadingItem;
