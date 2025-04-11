import React, { memo } from "react";
import { Clock, Calendar, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ReadingHistoryItem } from "@/components/home/types";
import { useTheme } from "@/components/theme/context/ThemeContext";
import getIconForTech from "@/components/icons/iconMap";
import { fromSnakeToTitleCase } from "@/utils/string";

interface HistoryListProps {
  filteredHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
  formatDate: (timestamp: number) => string;
}

/**
 * HistoryList Component
 *
 * An enhanced list view for reading history with beautiful cards,
 * smooth hover effects, and visual categorization.
 */
const HistoryList: React.FC<HistoryListProps> = memo(
  ({ filteredHistory, handleSelectDocument, formatDate }) => {
    // Animation variants for staggered list items
    const container = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.07,
        },
      },
    };

    return (
      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredHistory.map((item, index) => (
          <HistoryListItem
            key={item.path}
            item={item}
            handleSelectDocument={handleSelectDocument}
            formatDate={formatDate}
            index={index}
          />
        ))}
      </motion.div>
    );
  }
);

/**
 * HistoryListItem Component
 *
 * A beautifully designed card for each history item with hover effects,
 * category badges, and visual indicators.
 */
const HistoryListItem: React.FC<{
  item: ReadingHistoryItem;
  handleSelectDocument: (path: string, title: string) => void;
  formatDate: (timestamp: number) => string;
  index: number;
}> = memo(({ item, handleSelectDocument, formatDate }) => {
  const { currentTheme } = useTheme();
  const category = item.path.split("/")[0] || "uncategorized";
  const title = fromSnakeToTitleCase(
    item.path.split("/").pop()?.replace(".md", "") ?? ""
  );

  // Animation variant for each list item
  const itemVariant = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  // Calculate time elapsed since last read
  const getTimeElapsed = (timestamp: number) => {
    const now = Date.now();
    const elapsed = now - timestamp;
    const minutes = Math.floor(elapsed / (1000 * 60));
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
    return formatDate(timestamp);
  };

  // Dynamically generate a color for the category badge
  const getCategoryColor = () => {
    // Calculate a hue based on the category name
    let hue = 0;
    for (let i = 0; i < category.length; i++) {
      hue += category.charCodeAt(i);
    }
    hue = hue % 360;

    // Return an HSL color with the calculated hue
    return `hsl(${hue}, 80%, 60%)`;
  };

  const categoryColor = getCategoryColor();
  const CategoryIcon = getIconForTech(category);

  // Calculate how recent the read was
  const isRecent = Date.now() - item.lastReadAt < 24 * 60 * 60 * 1000;

  return (
    <motion.div variants={itemVariant}>
      <Card
        className="group relative overflow-hidden p-0 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 rounded-2xl border border-primary/10 hover:border-primary/30"
        style={{
          background: `radial-gradient(circle at top right, ${currentTheme.primary}05, transparent)`,
        }}
        onClick={() => handleSelectDocument(item.path, item.title)}
      >
        {/* Decorative background elements */}
        <div
          className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${categoryColor}, transparent)`,
          }}
        />

        <div className="p-3 md:p-4 relative flex items-start gap-3">
          {/* Category Icon */}
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-all duration-300 flex-shrink-0 border border-primary/10">
            <CategoryIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="font-medium text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h4>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center text-xs text-muted-foreground mt-1 md:mt-2 gap-2">
              {/* Category Badge */}
              <Badge
                variant="outline"
                className="px-2 py-0.5 text-[10px] md:text-xs font-normal"
                style={{
                  borderColor: `${categoryColor}40`,
                  color: categoryColor,
                  background: `${categoryColor}10`,
                }}
              >
                {category}
              </Badge>

              {/* Time info */}
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{getTimeElapsed(item.lastReadAt)}</span>
              </div>

              {/* Date info */}
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{new Date(item.lastReadAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Recent indicator */}
          {isRecent && (
            <div className="absolute top-2 right-2 md:top-3 md:right-3 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}

          {/* Right arrow indicator */}
          <div className="flex-shrink-0 flex items-center text-muted-foreground">
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/0 group-hover:bg-primary/10 transition-all">
              <ExternalLink className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

export default HistoryList;
