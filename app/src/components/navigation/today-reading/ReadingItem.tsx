import { Clock, TrendingUp } from "lucide-react";
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
  const timeSpentMinutes = Math.round(item.timeSpent / 60000);
  const completedSections = item.completedSectionIndices?.length || 0;

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
          // Base card styling with modern glass morphism
          "w-full p-6 rounded-3xl transition-all duration-300 ease-out",
          "bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl",
          "border border-gray-200/30 dark:border-gray-700/30",
          "shadow-lg shadow-gray-200/10 dark:shadow-gray-900/20",
          "hover:shadow-xl hover:shadow-gray-200/20 dark:hover:shadow-gray-900/30",
          "hover:border-gray-300/50 dark:hover:border-gray-600/50",
          "hover:bg-white/90 dark:hover:bg-gray-800/60",
          "text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
              "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30",
              "border border-blue-200/50 dark:border-blue-700/50",
              "group-hover:scale-110 transition-transform duration-300"
            )}
          >
            <CategoryIcon
              size={20}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Document title */}
            <h3
              className={cn(
                "font-semibold text-base leading-relaxed mb-2",
                "text-gray-900 dark:text-gray-100",
                "group-hover:text-blue-600 dark:group-hover:text-blue-400",
                "transition-colors duration-200"
              )}
            >
              {item.title}
            </h3>

            {/* Last read timestamp */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div
                className={cn(
                  "w-5 h-5 rounded-lg flex items-center justify-center",
                  "bg-gray-100 dark:bg-gray-800/50"
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

        {/* Modern stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Time spent card */}
          <motion.div
            className={cn(
              "relative overflow-hidden rounded-2xl p-4",
              "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
              "border border-green-200/50 dark:border-green-700/50",
              "group-hover:shadow-md transition-all duration-300"
            )}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-green-200 dark:bg-green-800 transform translate-x-2 -translate-y-2" />
              <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-emerald-200 dark:bg-emerald-800 transform -translate-x-1 translate-y-1" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp
                  size={14}
                  className="text-green-600 dark:text-green-400"
                  strokeWidth={2.5}
                />
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                  Time Spent
                </span>
              </div>
              <div className="text-xl font-bold text-green-700 dark:text-green-300">
                {timeSpentMinutes}
                <span className="text-sm font-medium text-green-600 dark:text-green-400 ml-1">
                  min
                </span>
              </div>
            </div>
          </motion.div>

          {/* Sections completed card */}
          <motion.div
            className={cn(
              "relative overflow-hidden rounded-2xl p-4",
              "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
              "border border-purple-200/50 dark:border-purple-700/50",
              "group-hover:shadow-md transition-all duration-300"
            )}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 transform -translate-x-1 -translate-y-1" />
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-violet-200 dark:bg-violet-800 transform translate-x-2 translate-y-2" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3.5 h-3.5 rounded-full bg-purple-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                  Progress
                </span>
              </div>
              <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                {completedSections}
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400 ml-1">
                  sections
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Subtle hover indicator */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        />
      </motion.button>
    </motion.div>
  );
};

export default ReadingItem;
