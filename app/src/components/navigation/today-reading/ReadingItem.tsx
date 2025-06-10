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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <motion.button
        className={cn(
          // Base card styling with theme-based glass morphism
          "w-full p-6 rounded-3xl transition-all duration-300 ease-out",
          "bg-card/80 backdrop-blur-xl",
          "border border-border/30",
          "shadow-lg",
          "hover:shadow-xl",
          "hover:border-border/50",
          "hover:bg-card/90",
          "text-left focus:outline-none focus:ring-2 focus:ring-primary/20"
        )}
        onClick={() => onFileSelect(item.path)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Header section with icon and title */}
        <div className="flex items-start gap-4 mb-6">
          {/* Modern category icon */}
          <div
            className={cn(
              "flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center",
              "bg-primary/10 backdrop-blur-sm",
              "border border-primary/20",
              "group-hover:scale-110 transition-transform duration-300"
            )}
          >
            <CategoryIcon size={20} className="text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Document title */}
            <h3
              className={cn(
                "font-semibold text-base leading-relaxed mb-2",
                "text-foreground",
                "group-hover:text-primary",
                "transition-colors duration-200"
              )}
            >
              {item.title}
            </h3>

            {/* Last read timestamp using theme muted colors */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div
                className={cn(
                  "w-5 h-5 rounded-lg flex items-center justify-center",
                  "bg-muted/50"
                )}
              >
                <Clock size={12} strokeWidth={2} />
              </div>
              <span className="font-medium">
                {formatTimeAgo(item.lastReadAt)}
              </span>
            </div>
          </div>
        </div>

        <motion.div
          className="absolute inset-0 rounded-3xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        />
      </motion.button>
    </motion.div>
  );
};

export default ReadingItem;
