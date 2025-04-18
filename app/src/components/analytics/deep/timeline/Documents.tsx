import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, BookText, Search } from "lucide-react";
import { ReadingHistoryItem } from "@/services/history";
import { COLORS } from "@/lib/constants";
import getIconForTech from "@/components/icons";
import { formatTimeAgo } from "@/utils/time";
import { fromSnakeToTitleCase } from "@/utils/string";

interface DocumentsViewProps {
  filteredHistory: ReadingHistoryItem[];
  selectedCategory: string | null;
  onSelectDocument?: (path: string, title: string) => void;
}

type DocumentData = {
  path: string;
  title: string;
  count: number;
  lastReadAt: number;
  category: string;
  color: string;
};

const DocumentsView: React.FC<DocumentsViewProps> = ({
  filteredHistory,
  selectedCategory,
  onSelectDocument,
}) => {
  const documentData = useMemo(() => {
    const documentMap: Record<string, DocumentData> = {};
    filteredHistory.forEach((item) => {
      if (selectedCategory && !item.path.startsWith(selectedCategory)) {
        return;
      }

      const category = item.path.split("/")[0] || "uncategorized";
      const color = COLORS[category.charCodeAt(0) % COLORS.length];

      if (!documentMap[item.path]) {
        documentMap[item.path] = {
          path: item.path,
          title: item.title,
          count: 0,
          lastReadAt: 0,
          category,
          color,
        };
      }

      documentMap[item.path].count += 1;
      documentMap[item.path].lastReadAt = Math.max(
        documentMap[item.path].lastReadAt,
        item.lastReadAt
      );
    });

    return Object.values(documentMap).sort(
      (a, b) => b.lastReadAt - a.lastReadAt
    );
  }, [filteredHistory, selectedCategory]);

  if (documentData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 text-muted-foreground"
      >
        <div className="relative w-16 h-16 mx-auto mb-3">
          <motion.div
            animate={{
              rotate: [0, 5, 0, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Clock className="h-16 w-16 mx-auto opacity-10" />
          </motion.div>
          <Search className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30" />
        </div>
        <p>No document data for this time period</p>
        {selectedCategory && (
          <p className="text-xs mt-1">Try removing the category filter</p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
        {documentData.map(
          ({ category, path, title, count, lastReadAt, color }) => {
            const CategoryIcon = getIconForTech(category);
            return (
              <motion.div
                key={path}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 cursor-pointer hover:border-primary/20 hover:bg-secondary/5 transition-all"
                onClick={() =>
                  onSelectDocument && onSelectDocument(path, title)
                }
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Left color indicator */}
                <div
                  className="w-1.5 self-stretch rounded-full"
                  style={{ backgroundColor: color }}
                />

                {/* Document icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/20">
                  {count > 2 ? (
                    <BookText className="h-5 w-5 text-foreground/70" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-foreground/70" />
                  )}
                </div>

                {/* Document info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-medium truncate">{title}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span>Last read {formatTimeAgo(lastReadAt)}</span>

                    {/* Category tag */}
                    <div className="ml-3 flex items-center">
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      <span>{fromSnakeToTitleCase(category)}</span>
                    </div>
                  </div>
                </div>

                {/* Read count badge */}
                <Badge
                  variant="default"
                  className="bg-primary/20 text-primary text-xs"
                >
                  {count}×
                </Badge>
              </motion.div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default DocumentsView;
