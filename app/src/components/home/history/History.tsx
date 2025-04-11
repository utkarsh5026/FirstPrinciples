import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { useReadingHistory } from "@/context";

interface HistoryProps {
  handleSelectDocument: (path: string, title: string) => void;
}

/**
 * Enhanced History Component
 *
 * This component displays your reading history with a beautiful, modern design
 * that works well on both mobile and desktop devices. It includes animations,
 * improved spacing, and visual enhancements while maintaining all functionality.
 */
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

  // Get unique categories from reading history
  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(
        readingHistory.map((item) => item.path.split("/")[0] || "uncategorized")
      ),
    ];
  }, [readingHistory]);

  // Calculate time statistics
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

  // Filter reading history based on search query, category, and timeframe
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
    const monthsToShow = 6;

    // Create a key for each month (YYYY-MM)
    const createMonthKey = (date: Date) =>
      `${date.getFullYear()}-${date.getMonth() + 1}`;

    // Initialize data for the last 6 months
    const initMonthlyData = (date: Date) => {
      for (let i = 0; i < monthsToShow; i++) {
        const d = new Date(date);
        d.setMonth(d.getMonth() - i);
        const monthKey = createMonthKey(d);
        months[monthKey] = 0;
      }
    };

    // Fill month data with reading counts
    const fillMonthData = () => {
      readingHistory.forEach((item) => {
        const date = new Date(item.lastReadAt);
        const monthKey = createMonthKey(date);
        if (months[monthKey] !== undefined) {
          months[monthKey]++;
        }
      });
    };

    initMonthlyData(now);
    fillMonthData();

    // Convert to array format for charts
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

  if (readingHistory.length === 0) return <EmptyHistory />;

  return (
    <div className="space-y-6 px-1 md:px-4 pb-20 md:pb-6 max-w-5xl mx-auto">
      {/* Glowing background effect */}
      <div
        className="absolute top-20 right-0 w-72 h-72 rounded-full opacity-10 blur-3xl -z-10"
        style={{
          background: `radial-gradient(circle, ${currentTheme.primary}, transparent)`,
        }}
      ></div>
      <div
        className="absolute bottom-20 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl -z-10"
        style={{
          background: `radial-gradient(circle, ${currentTheme.primary}, transparent)`,
        }}
      ></div>

      {/* Header section with statistics */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <HistoryHeader
          timeStats={timeStats}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </motion.div>

      {/* Filters section */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-card/60 backdrop-blur-sm border border-primary/10 p-4 rounded-2xl shadow-sm"
      >
        <HistoryFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedTimeframe={selectedTimeframe}
          setSelectedTimeframe={setSelectedTimeframe}
          categories={categories}
        />
      </motion.div>

      {/* Content section with animated transitions */}
      <AnimatePresence mode="wait">
        {filteredHistory.length === 0 ? (
          <motion.div
            key="empty-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyFilteredResult />
          </motion.div>
        ) : (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-card/50 backdrop-blur-sm border border-primary/10 p-4 md:p-6 rounded-2xl shadow-sm"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle mesh grid background pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5 -z-20"
        style={{
          backgroundImage: `radial-gradient(${currentTheme.primary}30 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      ></div>
    </div>
  );
};

export default History;
