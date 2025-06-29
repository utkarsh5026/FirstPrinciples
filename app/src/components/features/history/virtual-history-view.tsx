import React, { useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, BookOpen, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import getIconForTech from "@/components/shared/icons/icon-map";
import { fromSnakeToTitleCase } from "@/utils/string";
import { formatDate } from "@/components/home/utils";

interface VirtualizedHistoryViewProps {
  filteredHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
  isLoading?: boolean;
}

const formatDisplayDate = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) {
    return "Today";
  } else if (date.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
};

/**
 * VirtualizedHistoryView - A minimalist component for displaying reading history
 *
 * Features:
 * - Virtualized rendering for performance with large datasets
 * - Clean, minimal design
 * - Grouped display by date
 * - Smooth animations
 */
const VirtualizedHistoryView: React.FC<VirtualizedHistoryViewProps> = ({
  filteredHistory,
  handleSelectDocument,
  isLoading = false,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const groupedHistoryItems = useMemo(() => {
    const grouped: Record<string, ReadingHistoryItem[]> = {};

    filteredHistory.forEach((item) => {
      const date = new Date(item.lastReadAt);
      const dateKey = date.toISOString().split("T")[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(item);
    });

    return Object.entries(grouped)
      .sort(
        ([dateA], [dateB]) =>
          new Date(dateB).getTime() - new Date(dateA).getTime()
      )
      .map(([dateKey, items]) => ({
        date: dateKey,
        displayDate: formatDisplayDate(new Date(dateKey)),
        items,
      }));
  }, [filteredHistory]);

  const flattenedItems = useMemo(() => {
    const items: Array<{
      type: "header" | "item";
      index: number;
      dateKey?: string;
      displayDate?: string;
      item?: ReadingHistoryItem;
    }> = [];

    groupedHistoryItems.forEach((group) => {
      items.push({
        type: "header",
        index: items.length,
        dateKey: group.date,
        displayDate: group.displayDate,
      });
      group.items.forEach((item) => {
        items.push({
          type: "item",
          index: items.length,
          item,
        });
      });
    });

    return items;
  }, [groupedHistoryItems]);

  // Setup virtualizer
  const rowVirtualizer = useVirtualizer({
    count: flattenedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(
      (index) => {
        const item = flattenedItems[index];
        return item.type === "header" ? 48 : 68;
      },
      [flattenedItems]
    ),
    overscan: 10,
  });

  const renderListItem = (item: ReadingHistoryItem) => {
    const category = item.path.split("/")[0] || "uncategorized";
    const CategoryIcon = getIconForTech(category);
    const title = fromSnakeToTitleCase(
      item.path.split("/").pop()?.replace(".md", "") ?? ""
    );

    const isRecent = Date.now() - item.lastReadAt < 24 * 60 * 60 * 1000;

    return (
      <div
        className="group border border-border/50 hover:border-border hover:bg-muted/30 
                  rounded-2xl p-3 cursor-pointer transition-all duration-200 ease-out m-4"
        onClick={() => handleSelectDocument(item.path, item.title)}
      >
        <div className="flex items-center">
          <div
            className="h-8 w-8 rounded-md bg-muted flex items-center justify-center mr-3 flex-shrink-0 
                         group-hover:bg-primary/10 transition-colors"
          >
            <CategoryIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm text-foreground truncate mb-1">
              {title}
            </h4>
            <div className="flex items-center text-xs text-muted-foreground gap-3">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(item.lastReadAt)}
              </span>
              <Badge variant="secondary" className="text-xs h-5 rounded-md">
                {fromSnakeToTitleCase(category)}
              </Badge>
            </div>
          </div>

          {isRecent && (
            <div className="ml-3 w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          )}
        </div>
      </div>
    );
  };

  const renderDateHeader = (displayDate: string) => {
    return (
      <div className="flex items-center py-2 mb-1">
        <h3 className="text-sm font-medium text-foreground/80">
          {displayDate}
        </h3>
        <div className="h-px flex-grow bg-border/30 ml-3"></div>
      </div>
    );
  };

  const renderSkeleton = () => {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-3 flex items-center">
            <Skeleton className="h-8 w-8 rounded-md mr-3" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <div className="flex gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVirtualItem = (
    virtualRow: ReturnType<typeof rowVirtualizer.getVirtualItems>[number]
  ) => {
    const item = flattenedItems[virtualRow.index];

    if (item.type === "header") {
      return renderDateHeader(item.displayDate!);
    } else if (item.type === "item") {
      return renderListItem(item.item!);
    }
    return null;
  };

  if (isLoading) {
    return renderSkeleton();
  }

  return (
    <div className="w-full">
      {/* Simple header with count */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Reading History</h2>
        <div className="text-sm text-muted-foreground">
          {filteredHistory.length}{" "}
          {filteredHistory.length === 1 ? "item" : "items"}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredHistory.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 text-center"
          >
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-medium mb-2">No history items found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Your reading history will appear here once you start reading
              documents
            </p>
            <Button variant="outline" size="sm" className="rounded-lg">
              <BookOpen className="h-4 w-4 mr-2" />
              Start Reading
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="history-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <div
              ref={parentRef}
              className="overflow-auto rounded-2xl border-none bg-transparent"
              style={{
                height: `${Math.min(
                  700,
                  Math.max(400, window.innerHeight * 0.7)
                )}px`,
              }}
            >
              <div
                className="relative w-full p-4"
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                  <div
                    key={virtualRow.index}
                    className="absolute top-0 left-0 w-full px-4"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {renderVirtualItem(virtualRow)}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VirtualizedHistoryView;
