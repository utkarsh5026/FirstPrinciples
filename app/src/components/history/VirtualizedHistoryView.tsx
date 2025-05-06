import React, { useState, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, BookOpen, Grid3X3, LayoutList, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import getIconForTech from "@/components/shared/icons/iconMap";
import { fromSnakeToTitleCase } from "@/utils/string";
import { formatDate } from "@/components/home/utils";
import useMobile from "@/hooks/device/use-mobile";

// Component interfaces
interface VirtualizedHistoryViewProps {
  filteredHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
  isLoading?: boolean;
}

const formatDisplayDate = (date: Date, isMobile: boolean): string => {
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
      weekday: isMobile ? "short" : "long",
      month: "short",
      day: "numeric",
    });
  }
};

type HistoryViewType = "list" | "grid" | "timeline";

/**
 * VirtualizedHistoryView - An optimized component for displaying large history datasets
 *
 * Features:
 * - Virtualized rendering for handling large amounts of data efficiently
 * - Multiple view options: List, Grid, and Timeline
 * - Responsive design for both mobile and desktop
 * - Smooth animations and transitions
 * - Grouped display by date for better organization
 * - Progressive loading indicators
 */
const VirtualizedHistoryView: React.FC<VirtualizedHistoryViewProps> = ({
  filteredHistory,
  handleSelectDocument,
  isLoading = false,
}) => {
  // Viewport reference for virtualization
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Get mobile status
  const { isMobile } = useMobile();

  // View state
  const [viewType, setViewType] = useState<HistoryViewType>("list");

  // Group history items by date for better organization
  const groupedHistoryItems = useMemo(() => {
    // Create an object to hold grouped items
    const grouped: Record<string, ReadingHistoryItem[]> = {};

    // Process each history item
    filteredHistory.forEach((item) => {
      // Create a date key for grouping (YYYY-MM-DD)
      const date = new Date(item.lastReadAt);
      const dateKey = date.toISOString().split("T")[0];

      // Initialize group if it doesn't exist
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      // Add item to its date group
      grouped[dateKey].push(item);
    });

    // Convert grouped object to array and sort by date (newest first)
    return Object.entries(grouped)
      .sort(
        ([dateA], [dateB]) =>
          new Date(dateB).getTime() - new Date(dateA).getTime()
      )
      .map(([dateKey, items]) => ({
        date: dateKey,
        displayDate: formatDisplayDate(new Date(dateKey), isMobile),
        items,
      }));
  }, [filteredHistory]);

  // Format date for display

  // Create a flattened array for virtualization
  const flattenedItems = useMemo(() => {
    const items: Array<{
      type: "header" | "item";
      index: number;
      dateKey?: string;
      displayDate?: string;
      item?: ReadingHistoryItem;
    }> = [];

    groupedHistoryItems.forEach((group) => {
      // Add date header
      items.push({
        type: "header",
        index: items.length,
        dateKey: group.date,
        displayDate: group.displayDate,
      });

      // Add items for this date
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
        // Estimate row heights based on content type
        const item = flattenedItems[index];
        if (item.type === "header") {
          return 60; // Header height
        }
        return viewType === "grid" ? (isMobile ? 140 : 180) : 90; // Item height based on view
      },
      [flattenedItems, viewType, isMobile]
    ),
    overscan: 10, // Render extra items for smoother scrolling
  });

  // Render function for list view items
  const renderListItem = (item: ReadingHistoryItem, animate = true) => {
    const category = item.path.split("/")[0] || "uncategorized";
    const CategoryIcon = getIconForTech(category);
    const title = fromSnakeToTitleCase(
      item.path.split("/").pop()?.replace(".md", "") ?? ""
    );

    // Calculate how recent the read was
    const isRecent = Date.now() - item.lastReadAt < 24 * 60 * 60 * 1000;

    const itemContent = (
      <div
        className="border border-primary/10 hover:border-primary/30 hover:bg-primary/5 
                  rounded-2xl p-3 cursor-pointer transition-colors h-full"
        onClick={() => handleSelectDocument(item.path, item.title)}
      >
        <div className="flex items-center h-full">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
            <CategoryIcon className="h-4 w-4 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm truncate">{title}</h4>
            <div className="flex items-center text-xs text-muted-foreground mt-1 flex-wrap gap-x-3">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(item.lastReadAt)}
              </span>
              <Badge className="text-[10px] h-4 bg-primary/10 text-primary/80 hover:bg-primary/20 rounded-full">
                {fromSnakeToTitleCase(category)}
              </Badge>
            </div>
          </div>

          {isRecent && (
            <div className="ml-2 w-2 h-2 rounded-full bg-green-500" />
          )}
        </div>
      </div>
    );

    if (!animate) return itemContent;

    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -1, transition: { duration: 0.2 } }}
        className="w-full"
      >
        {itemContent}
      </motion.div>
    );
  };

  // Render function for grid view items
  const renderGridItem = (item: ReadingHistoryItem, animate = true) => {
    const category = item.path.split("/")[0] || "uncategorized";
    const CategoryIcon = getIconForTech(category);
    const title = fromSnakeToTitleCase(
      item.path.split("/").pop()?.replace(".md", "") ?? ""
    );

    const isRecent = Date.now() - item.lastReadAt < 24 * 60 * 60 * 1000;

    const gridItemContent = (
      <div
        className="border border-primary/10 hover:border-primary/30 hover:bg-primary/5 
                  rounded-2xl p-3 cursor-pointer transition-colors h-full flex flex-col"
        onClick={() => handleSelectDocument(item.path, item.title)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <CategoryIcon className="h-4 w-4 text-primary" />
          </div>
          {isRecent && <div className="w-2 h-2 rounded-full bg-green-500" />}
        </div>

        <h4 className="font-medium text-sm line-clamp-2 mb-auto">{title}</h4>

        <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
          <Badge className="text-[10px] h-4 bg-primary/10 text-primary/80 hover:bg-primary/20 rounded-full">
            {fromSnakeToTitleCase(category)}
          </Badge>
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(item.lastReadAt)}
          </span>
        </div>
      </div>
    );

    if (!animate) return gridItemContent;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{
          y: -2,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          transition: { duration: 0.2 },
        }}
        className="h-full"
      >
        {gridItemContent}
      </motion.div>
    );
  };

  const renderTimelineItem = (item: ReadingHistoryItem, animate = true) => {
    const category = item.path.split("/")[0] || "uncategorized";
    const CategoryIcon = getIconForTech(category);
    const title = fromSnakeToTitleCase(
      item.path.split("/").pop()?.replace(".md", "") ?? ""
    );

    const timelineItemContent = (
      <div
        className="border border-primary/10 hover:border-primary/30 hover:bg-primary/5 rounded-2xl 
                  flex items-center cursor-pointer p-3 ml-5"
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
      </div>
    );

    if (!animate) return timelineItemContent;

    return (
      <motion.div
        initial={{ opacity: 0, x: 5 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full relative"
      >
        {timelineItemContent}
      </motion.div>
    );
  };

  // Render date header for groups
  const renderDateHeader = (
    dateKey: string,
    displayDate: string,
    animate = true
  ) => {
    const headerContent =
      viewType === "timeline" ? (
        <div className="flex items-center mb-2 mt-4 ml-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center z-10 mr-3">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-base font-medium text-primary/90">
            {displayDate}
          </h3>
        </div>
      ) : (
        <div className="flex items-center mb-2 mt-4">
          <Badge
            variant="outline"
            className="mr-2 bg-primary/5 text-primary border-primary/20"
          >
            <Calendar className="h-3 w-3 mr-1" />
            {displayDate}
          </Badge>
          <div className="h-px flex-grow bg-primary/10"></div>
        </div>
      );

    if (!animate) return headerContent;

    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-1"
      >
        {headerContent}
      </motion.div>
    );
  };

  // Loading skeletons for items
  const renderSkeleton = () => {
    return viewType === "grid" ? (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-3 h-36">
            <div className="flex justify-between mb-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-3" />
            <div className="flex justify-between mt-auto">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border rounded-2xl p-3 flex items-center">
            <Skeleton className="h-9 w-9 rounded-full mr-3" />
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
      return renderDateHeader(item.dateKey!, item.displayDate!, false);
    } else if (item.type === "item") {
      switch (viewType) {
        case "grid":
          return renderGridItem(item.item!, false);
        case "timeline":
          return renderTimelineItem(item.item!, false);
        default:
          return renderListItem(item.item!, false);
      }
    }
    return null;
  };

  if (isLoading) {
    return renderSkeleton();
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <Tabs
          value={viewType}
          onValueChange={(v) => setViewType(v as HistoryViewType)}
          className="mr-auto"
        >
          <TabsList className="bg-secondary/20 rounded-2xl h-8">
            <TabsTrigger
              value="list"
              className="h-6 text-xs rounded-2xl data-[state=active]:bg-primary/10"
            >
              <LayoutList className="h-3.5 w-3.5 mr-1.5" />
              <span className={isMobile ? "hidden" : "inline"}>List</span>
            </TabsTrigger>
            <TabsTrigger
              value="grid"
              className="h-6 text-xs rounded-2xl data-[state=active]:bg-primary/10"
            >
              <Grid3X3 className="h-3.5 w-3.5 mr-1.5" />
              <span className={isMobile ? "hidden" : "inline"}>Grid</span>
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="h-6 text-xs rounded-2xl data-[state=active]:bg-primary/10"
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              <span className={isMobile ? "hidden" : "inline"}>Timeline</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="text-xs text-muted-foreground ml-2">
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
            className="py-12 text-center"
          >
            <Search className="h-10 w-10 mx-auto mb-3 text-primary/30" />
            <h3 className="text-base font-medium">No history items found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Your reading history will appear here once you start reading
              documents
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-primary/30 bg-primary/5"
            >
              <BookOpen className="h-4 w-4 mr-1.5" />
              Start Reading
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={viewType}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {viewType === "timeline" && (
              <div className="absolute left-4 top-20 bottom-0 w-0.5 bg-primary/10 z-0"></div>
            )}

            {/* Virtualized content container */}
            <div
              ref={parentRef}
              className="overflow-auto max-h-[70vh] relative"
              style={{
                height: `${Math.min(
                  700,
                  Math.max(400, window.innerHeight * 0.7)
                )}px`,
              }}
            >
              {/* Virtualized items */}
              <div
                className="relative w-full"
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                }}
              >
                {viewType === "grid" ? (
                  <div
                    className="absolute top-0 left-0 right-0"
                    style={{
                      transform: `translateY(${
                        rowVirtualizer.getVirtualItems()[0]?.start ?? 0
                      }px)`,
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const item = flattenedItems[virtualRow.index];

                      if (item.type === "header") {
                        return (
                          <div
                            key={`header-${virtualRow.index}`}
                            style={{ height: virtualRow.size }}
                          >
                            {renderDateHeader(
                              item.dateKey!,
                              item.displayDate!,
                              false
                            )}
                          </div>
                        );
                      }

                      // Find all items for the current render batch that should be in the grid
                      const gridItems = rowVirtualizer
                        .getVirtualItems()
                        .filter((vr) => {
                          const i = flattenedItems[vr.index];
                          return (
                            i.type === "item" &&
                            Math.floor(vr.index / 6) ===
                              Math.floor(virtualRow.index / 6)
                          );
                        })
                        .map((vr) => flattenedItems[vr.index])
                        .filter((i) => i.type === "item");

                      // Only render grid container for the first item in each batch
                      if (gridItems.length > 0 && gridItems[0] === item) {
                        return (
                          <div
                            key={`grid-${virtualRow.index}`}
                            className="mb-3"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {gridItems.map((gridItem, idx) => (
                                <div
                                  key={`grid-item-${idx}-${virtualRow.index}`}
                                  className="h-full"
                                >
                                  {renderGridItem(gridItem.item!, false)}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                ) : (
                  rowVirtualizer.getVirtualItems().map((virtualRow) => (
                    <div
                      key={virtualRow.index}
                      className="absolute top-0 left-0 w-full"
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div className="p-1">{renderVirtualItem(virtualRow)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VirtualizedHistoryView;
