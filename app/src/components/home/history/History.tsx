import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { ReadingHistoryItem } from "@/components/home/types";
import { useTheme } from "@/components/theme/context/ThemeContext";

import HistoryHeader from "./components/HistoryHeader";
import HistoryFilters from "./components/HistoryFilters";
import HistoryList from "./components/HistoryList";
import HistoryTimeline from "./components/HistoryTimeline";
import HistoryTrends from "./components/HistoryTrends";
import EmptyHistory from "./components/EmptyHistory";

interface HistoryProps {
  readingHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
  formatDate: (timestamp: number) => string;
}

const History: React.FC<HistoryProps> = ({
  readingHistory,
  handleSelectDocument,
  formatDate,
}) => {
  const { currentTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "timeline" | "trends">(
    "list"
  );
  const [filteredHistory, setFilteredHistory] =
    useState<ReadingHistoryItem[]>(readingHistory);

  // Extract all categories from reading history
  const categories = [
    "all",
    ...new Set(
      readingHistory.map((item) => item.path.split("/")[0] || "uncategorized")
    ),
  ];

  // Get time-based stats
  const getTimeStats = () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    return {
      today: readingHistory.filter((item) => now - item.lastReadAt < oneDay)
        .length,
      thisWeek: readingHistory.filter((item) => now - item.lastReadAt < oneWeek)
        .length,
      thisMonth: readingHistory.filter(
        (item) => now - item.lastReadAt < oneMonth
      ).length,
      total: readingHistory.length,
    };
  };

  const timeStats = getTimeStats();

  // Apply filters to history items
  useEffect(() => {
    let filtered = [...readingHistory];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.path.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => {
        const category = item.path.split("/")[0] || "uncategorized";
        return category === selectedCategory;
      });
    }

    // Apply time filter
    if (selectedTimeframe !== "all") {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      if (selectedTimeframe === "today") {
        filtered = filtered.filter((item) => now - item.lastReadAt < oneDay);
      } else if (selectedTimeframe === "week") {
        filtered = filtered.filter(
          (item) => now - item.lastReadAt < 7 * oneDay
        );
      } else if (selectedTimeframe === "month") {
        filtered = filtered.filter(
          (item) => now - item.lastReadAt < 30 * oneDay
        );
      }
    }

    // Sort by most recent
    filtered.sort((a, b) => b.lastReadAt - a.lastReadAt);

    setFilteredHistory(filtered);
  }, [readingHistory, searchQuery, selectedCategory, selectedTimeframe]);

  // Generate monthly reading data for trends
  const generateMonthlyData = () => {
    const months: Record<string, number> = {};
    const now = new Date();

    // Create last 6 months entries
    for (let i = 0; i < 6; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      months[monthKey] = 0;
    }

    // Fill with actual data
    readingHistory.forEach((item) => {
      const date = new Date(item.lastReadAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (months[monthKey] !== undefined) {
        months[monthKey]++;
      }
    });

    // Convert to array format for visualization
    return Object.entries(months)
      .map(([key, count]) => {
        const [year, month] = key.split("-").map(Number);
        const date = new Date(year, month - 1);
        return {
          name: date.toLocaleDateString("en-US", { month: "short" }),
          count,
          date,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const monthlyData = generateMonthlyData();

  return (
    <div className="space-y-4 md:space-y-6 px-1 md:px-0 pb-20 md:pb-0">
      <HistoryHeader
        timeStats={timeStats}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <HistoryFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
        categories={categories}
      />

      {readingHistory.length === 0 ? (
        <EmptyHistory />
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-6 md:py-12 border border-primary/10 rounded-lg bg-primary/5">
          <Search className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 text-primary/30" />
          <h3 className="text-base md:text-lg font-medium">
            No matching results
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="mt-4">
          {viewMode === "list" && (
            <HistoryList
              filteredHistory={filteredHistory}
              handleSelectDocument={handleSelectDocument}
              formatDate={formatDate}
            />
          )}

          {viewMode === "timeline" && (
            <HistoryTimeline
              filteredHistory={filteredHistory}
              handleSelectDocument={handleSelectDocument}
              formatDate={formatDate}
            />
          )}

          {viewMode === "trends" && (
            <HistoryTrends
              readingHistory={readingHistory}
              monthlyData={monthlyData}
              currentTheme={currentTheme}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default History;
