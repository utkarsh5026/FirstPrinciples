import React, { useState, useEffect, useMemo } from "react";

import { ReadingHistoryItem } from "@/components/home/types";
import { useTheme } from "@/components/theme/context/ThemeContext";

import HistoryHeader from "./components/HistoryHeader";
import HistoryFilters from "./components/HistoryFilters";
import HistoryList from "./components/HistoryList";
import HistoryTimeline from "./components/HistoryTimeline";
import HistoryTrends from "./components/HistoryTrends";
import EmptyHistory from "./components/EmptyHistory";
import EmptyFilteredResult from "./components/EmptyFilteredResult";

import { formatDate } from "../utils";
import { useReadingHistory } from "@/hooks";

interface HistoryProps {
  handleSelectDocument: (path: string, title: string) => void;
}

const History: React.FC<HistoryProps> = ({ handleSelectDocument }) => {
  const { readingHistory } = useReadingHistory();
  const { currentTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "timeline" | "trends">(
    "list"
  );
  const [filteredHistory, setFilteredHistory] =
    useState<ReadingHistoryItem[]>(readingHistory);

  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(
        readingHistory.map((item) => item.path.split("/")[0] || "uncategorized")
      ),
    ];
  }, [readingHistory]);

  const timeStats = useMemo(() => {
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
  }, [readingHistory]);

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
  const monthlyData = useMemo(() => {
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
  }, [readingHistory]);

  if (readingHistory.length === 0) {
    return <EmptyHistory />;
  }

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

      {filteredHistory.length === 0 ? (
        <EmptyFilteredResult />
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
