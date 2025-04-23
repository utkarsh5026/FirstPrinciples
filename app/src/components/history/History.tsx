import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import CardContainer from "@/components/container/CardContainer";
import { Calendar, Search, Filter, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HistoryList from "./HistoryList";
import HistoryTimeline from "./HistoryTimeline";
import FilterPopover from "@/components/utils/filter/FilterPopover";
import { TimeRange } from "@/utils/time";
import HistoryHeader from "./HistoryHeader";
import { useReadingHistory } from "@/hooks";

interface HistoryProps {
  handleSelectDocument: (path: string, title: string) => void;
}

/**
 * Minimal History Component
 *
 * A beautifully designed, minimal interface for browsing reading history
 * with intuitive filtering, clean visuals, and elegant animations.
 */
const History: React.FC<HistoryProps> = ({ handleSelectDocument }) => {
  const { history, refreshHistory, filterHistory } = useReadingHistory();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeRange>("all");
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
  const [filteredHistory, setFilteredHistory] =
    useState<ReadingHistoryItem[]>(history);

  useEffect(() => {
    refreshHistory();
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
    const filter = async () => {
      const filtered = await filterHistory({
        category: selectedCategory,
        timePeriod: selectedTimeframe,
      });

      setFilteredHistory(filtered);
    };
    filter();
  }, [selectedCategory, selectedTimeframe, filterHistory]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedTimeframe("all");
  };

  const timeStats = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return {
      today: filteredHistory.filter((item) => now - item.lastReadAt < oneDay)
        .length,
      thisWeek: filteredHistory.filter(
        (item) => now - item.lastReadAt < 7 * oneDay
      ).length,
      thisMonth: filteredHistory.filter(
        (item) => now - item.lastReadAt < 30 * oneDay
      ).length,
      total: filteredHistory.length,
    };
  }, [filteredHistory]);

  console.log(filteredHistory);

  if (history.length === 0) {
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
    <div className="space-y-4 max-w-5xl mx-auto px-1 md:px-0">
      <HistoryHeader timeStats={timeStats} />

      <CardContainer
        title="Reading History"
        icon={CalendarDays}
        description="Your reading journey and progress"
        variant="subtle"
        headerAction={
          <Tabs
            defaultValue={viewMode}
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "list" | "timeline")}
            className="w-full"
          >
            <TabsList className="bg-secondary/20 rounded-2xl h-8">
              <TabsTrigger
                value="list"
                className="h-6 text-xs rounded-2xl data-[state=active]:bg-primary/10"
              >
                <span className="mx-2">List</span>
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="h-6 text-xs rounded-2xl data-[state=active]:bg-primary/10 mx-2 p-2"
              >
                <span className="mx-2">Timeline</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        {/* Filters section */}
        <div className="mb-4 flex flex-row sm:flex-row">
          <div className="flex-1" />
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

        {selectedCategory !== "all" || selectedTimeframe !== "all" ? (
          <div className="flex items-center justify-between mb-3 bg-primary/5 px-3 py-1.5 rounded-lg">
            <div className="flex items-center text-xs text-muted-foreground">
              <Filter className="h-3 w-3 mr-1" />
              <span>Filtered results: {filteredHistory.length} documents</span>
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
        ) : null}

        {/* Content based on view mode */}
        <AnimatePresence mode="wait">
          {filteredHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <Search className="h-10 w-10 mx-auto mb-3 text-primary/30" />
              <h3 className="text-base font-medium">No matching results</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="rounded-full border-primary/30 bg-primary/5"
              >
                Clear filters
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === "list" ? (
                <HistoryList
                  filteredHistory={filteredHistory}
                  handleSelectDocument={handleSelectDocument}
                />
              ) : (
                <HistoryTimeline
                  filteredHistory={filteredHistory}
                  handleSelectDocument={handleSelectDocument}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContainer>
    </div>
  );
};

export default History;
