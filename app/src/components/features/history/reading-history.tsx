import React, { useState, useEffect, useMemo } from "react";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import CardContainer from "@/components/shared/container/card-container";
import { Calendar, Filter, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import FilterPopover from "@/components/utils/filter/filter-popover";
import { TimeRange } from "@/utils/time";
import HistoryHeader from "./history-header";
import { useReadingHistory } from "@/hooks";
import VirtualizedHistoryView from "./virtual-history-view";

interface HistoryProps {
  handleSelectDocument: (path: string, title: string) => void;
}

/**
 * Enhanced History Component
 *
 * A modern, performance-optimized interface for browsing reading history
 * with virtualized lists for efficient rendering of large datasets.
 *
 * Features:
 * - Virtualized rendering for handling thousands of history items efficiently
 * - Multiple visualization options: list, grid, and timeline views
 * - Advanced filtering options by category and time period
 * - Mobile-optimized and responsive design
 * - Visual grouping by date for better organization
 * - Smooth animations and transitions
 */
const History: React.FC<HistoryProps> = ({ handleSelectDocument }) => {
  const { history, refreshHistory, filterHistory } = useReadingHistory();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeRange>("all");
  const [filteredHistory, setFilteredHistory] =
    useState<ReadingHistoryItem[]>(history);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      await refreshHistory();
      setIsLoading(false);
    };
    loadHistory();
  }, [refreshHistory]);

  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(
        history.map((item) => item.path.split("/")[0] ?? "uncategorized")
      ),
    ];
  }, [history]);

  useEffect(() => {
    const applyFilters = async () => {
      setIsLoading(true);
      try {
        const filtered = await filterHistory({
          category: selectedCategory,
          timePeriod: selectedTimeframe,
        });

        setFilteredHistory(filtered);
      } catch (error) {
        console.error("Error filtering history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    applyFilters();
  }, [selectedCategory, selectedTimeframe, filterHistory]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedTimeframe("all");
  };

  const timeStats = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return {
      today: history.filter((item) => now - item.lastReadAt < oneDay).length,
      thisWeek: history.filter((item) => now - item.lastReadAt < 7 * oneDay)
        .length,
      thisMonth: history.filter((item) => now - item.lastReadAt < 30 * oneDay)
        .length,
      total: history.length,
    };
  }, [history]);

  if (history.length === 0 && !isLoading) {
    return (
      <CardContainer
        title="Reading History"
        icon={Calendar}
        description="Your reading journey hasn't begun yet"
        variant="subtle"
      >
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Calendar className="h-12 w-12 text-primary/30 mb-4" />
          <h3 className="text-base md:text-lg font-medium mb-2">
            No Reading History
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            Your reading history will appear here once you start reading
            documents.
          </p>
          <Button className="bg-primary/90 hover:bg-primary text-primary-foreground rounded-full">
            Start Reading
          </Button>
        </div>
      </CardContainer>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-1 md:px-0">
      {/* Stats Summary */}
      <HistoryHeader timeStats={timeStats} />

      {/* Main Content Container */}
      <CardContainer
        title="Reading Activity"
        icon={CalendarDays}
        description="Your complete reading journey and progress"
        variant="subtle"
        className="overflow-hidden"
        insights={[
          {
            label: "Recent Activity",
            value: `${timeStats.thisWeek} items`,
            icon: Clock,
            highlight: timeStats.thisWeek > 0,
          },
        ]}
      >
        {/* Filters section */}
        <div className="mb-4 flex flex-row justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {!isLoading && `${history.length} total items`}
          </div>
          <div>
            <FilterPopover
              showCategoryFilter
              showTimeFilter
              categories={categories}
              currentCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              currentTimeRange={selectedTimeframe}
              onTimeRangeChange={setSelectedTimeframe}
              buttonVariant="ghost"
            />
          </div>
        </div>

        {/* Active filter indicators */}
        {(selectedCategory !== "all" || selectedTimeframe !== "all") && (
          <div className="flex items-center justify-between mb-3 bg-primary/5 px-3 py-1.5 rounded-lg">
            <div className="flex items-center text-xs text-muted-foreground">
              <Filter className="h-3 w-3 mr-1" />
              <span>
                Filtered results: {isLoading ? "..." : filteredHistory.length}{" "}
                documents
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs hover:bg-primary/10 px-2"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Virtualized content */}
        <ScrollArea className="overflow-y-visible overflow-x-hidden max-h-[600px]">
          {isLoading && filteredHistory.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full mb-2"></div>
                <span className="text-sm text-muted-foreground">
                  Loading history...
                </span>
              </div>
            </div>
          ) : (
            <VirtualizedHistoryView
              filteredHistory={filteredHistory}
              handleSelectDocument={handleSelectDocument}
              isLoading={isLoading}
            />
          )}
        </ScrollArea>
      </CardContainer>
    </div>
  );
};

export default History;
