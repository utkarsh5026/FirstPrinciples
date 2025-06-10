import { cn } from "@/lib/utils";
import {
  CircleDot,
  BookMarked,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { FileMetadata } from "@/services/document";
import { fromSnakeToTitleCase } from "@/utils/string";
import { motion } from "framer-motion";

type CategoryFileWithStatus = FileMetadata & {
  isTodo: boolean;
  isCompleted: boolean;
  isRead: boolean;
};

interface CategoryFileProps {
  file: CategoryFileWithStatus;
  depth: number;
  isCurrentFile: boolean;
  fileNumber: number;
  handleSelectFile: (filePath: string) => void;
}

const CategoryFile: React.FC<CategoryFileProps> = ({
  file,
  depth,
  isCurrentFile,
  handleSelectFile,
  fileNumber,
}: CategoryFileProps) => {
  const fileStatusIcon = getFileStatusIcon(
    file.isTodo,
    file.isCompleted,
    file.isRead
  );
  const statusInfo = getFileStatusInfo(
    file.isTodo,
    file.isCompleted,
    file.isRead
  );

  return (
    <motion.div
      className="px-1 py-1 sm:px-2 sm:py-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.button
        className={cn(
          "group relative w-full rounded-2xl sm:rounded-2xl overflow-hidden",
          "transition-all duration-300 ease-out",
          "border border-border/30",
          "backdrop-blur-sm",
          "min-h-[44px] touch-manipulation",

          // Current file state - using primary theme colors
          isCurrentFile
            ? ["bg-primary/10", "border-primary/30", "shadow-lg"]
            : [
                "bg-card/50",
                "hover:bg-card/80",
                "active:bg-card/90", // Better touch feedback
                "hover:border-border/50",
                "hover:shadow-lg",
              ],

          // Read state styling using muted theme colors
          file.isRead &&
            !isCurrentFile &&
            !file.isCompleted &&
            "opacity-75 hover:opacity-90 active:opacity-95"
        )}
        style={{
          // Responsive padding based on screen size and depth
          paddingLeft: `${Math.max(
            12,
            (depth + 1) * (window.innerWidth < 640 ? 12 : 20)
          )}px`,
          paddingRight: window.innerWidth < 640 ? "12px" : "20px",
          paddingTop: window.innerWidth < 640 ? "12px" : "16px",
          paddingBottom: window.innerWidth < 640 ? "12px" : "16px",
        }}
        onClick={() => handleSelectFile(file.path)}
        whileHover={{ scale: 1.01, y: -1 }} // Reduced scale for mobile
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative flex flex-col gap-2 sm:gap-3">
          {/* File title with number */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* File number with responsive sizing */}
            <div
              className={cn(
                "flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl sm:rounded-2xl flex items-center justify-center",
                "text-xs font-bold transition-all duration-200",
                isCurrentFile
                  ? [
                      "bg-primary/20",
                      "text-primary",
                      "border border-primary/30",
                    ]
                  : [
                      "bg-muted/80",
                      "text-muted-foreground",
                      "border border-border/50",
                    ]
              )}
            >
              {fileNumber}
            </div>

            {/* File title with responsive typography */}
            <h4
              className={cn(
                "font-semibold text-xs sm:text-sm flex-1 text-left leading-relaxed",
                "transition-colors duration-200",
                "line-clamp-2 sm:line-clamp-1",
                isCurrentFile
                  ? "text-primary"
                  : "text-foreground group-hover:text-foreground"
              )}
            >
              {fromSnakeToTitleCase(file.title)}
            </h4>
          </div>

          {/* Status badge with responsive design */}
          <div className="flex items-center">
            <motion.div
              className={cn(
                "inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5",
                "rounded-lg sm:rounded-xl text-xs font-medium",
                "border transition-all duration-200",
                statusInfo.bgColor,
                statusInfo.borderColor,
                statusInfo.textColor
              )}
              whileHover={{ scale: 1.02 }} // Reduced scale for mobile
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              >
                {fileStatusIcon}
              </motion.div>
              <span className="font-semibold text-xs sm:text-xs">
                {/* Shorter text for mobile */}
                <span className="hidden sm:inline">{statusInfo.text}</span>
                <span className="sm:hidden">
                  {statusInfo.shortText || statusInfo.text}
                </span>
              </span>

              {/* Subtle sparkle for completed items */}
              {file.isCompleted && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={8} className="text-emerald-400 sm:size-10" />
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Active indicator line with responsive sizing */}
        {isCurrentFile && (
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 sm:h-8 bg-primary rounded-r-full"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
      </motion.button>
    </motion.div>
  );
};

// Enhanced status system with modern visual hierarchy
const getFileStatusIcon = (
  isTodo: boolean,
  isCompleted: boolean,
  isRead: boolean
) => {
  switch (true) {
    case isCompleted:
      return (
        <CheckCircle2
          size={14}
          className="text-emerald-500"
          strokeWidth={2.5}
        />
      );
    case isTodo:
      return <BookMarked size={14} className="text-blue-500" strokeWidth={2} />;
    case isRead:
      return <Clock size={14} className="text-amber-500" strokeWidth={2} />;
    default:
      return (
        <CircleDot size={14} className="text-gray-400" strokeWidth={1.5} />
      );
  }
};

const getFileStatusInfo = (
  isTodo: boolean,
  isCompleted: boolean,
  isRead: boolean
) => {
  switch (true) {
    case isCompleted:
      return {
        text: "Completed",
        shortText: "Done", // Mobile-friendly short text
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        textColor: "text-green-600",
      };
    case isTodo:
      return {
        text: "Reading List",
        shortText: "Todo",
        bgColor: "bg-primary/10",
        borderColor: "border-primary/30",
        textColor: "text-primary",
      };
    case isRead:
      return {
        text: "Previously Read",
        shortText: "Read",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        textColor: "text-amber-600",
      };
    default:
      return {
        text: "Unread",
        shortText: "New",
        bgColor: "bg-muted/50",
        borderColor: "border-border/50",
        textColor: "text-muted-foreground",
      };
  }
};

export default CategoryFile;
