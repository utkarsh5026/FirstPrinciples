import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, Filter, Clock, BookOpen, Crosshair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HeatmapView from "./HeatMapView";
import GitHubStyleHeatmap from "./GithubHeatMap";
import CategoriesView from "./Categories";
import DocumentsView from "./Documents";
import useMobile from "@/hooks/useMobile";
import { type TimeRange, getStartDate } from "@/utils/time";
import { useCategoryStore, useHistoryStore } from "@/stores";
import TimelineCard from "./TimelineCard";

export type ViewMode = "heatmap" | "categories" | "documents";

interface ReadingTimelineProps {
  onSelectCategory?: (category: string) => void;
  onSelectDocument?: (path: string, title: string) => void;
}

const ReadingTimeline: React.FC<ReadingTimelineProps> = ({
  onSelectCategory,
  onSelectDocument,
}) => {
  const { isMobile } = useMobile();
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [viewMode, setViewMode] = useState<ViewMode>("heatmap");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const readingHistory = useHistoryStore((state) => state.readingHistory);
  const createCategoryBreakdown = useCategoryStore(
    (state) => state.createCategoryBreakdown
  );

  const categories = useMemo(() => {
    const result = createCategoryBreakdown(readingHistory);
    return result.map(({ category }) => category);
  }, [readingHistory, createCategoryBreakdown]);

  const filteredHistory = useMemo(() => {
    const startDate = getStartDate(timeRange);

    return readingHistory.filter(
      (item) =>
        new Date(item.lastReadAt) >= startDate &&
        (selectedCategory === null || item.path.startsWith(selectedCategory))
    );
  }, [readingHistory, timeRange, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setTimeRange(timeRange);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <Card className="border border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-primary/5 rounded-2xl">
        <div className="relative">
          {/* Background gradient decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
          </div>

          <div className="p-4 sm:p-5 relative z-10">
            {/* Header with title and controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                <h4 className="text-sm font-medium">Reading Timeline</h4>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Time range selector */}
                <Select
                  value={timeRange}
                  onValueChange={(v) => setTimeRange(v as TimeRange)}
                >
                  <SelectTrigger className="h-8 text-xs w-24 bg-card border-border/50 focus:ring-primary/20 focus:border-primary/30 rounded-2xl">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl font-cascadia-code">
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>

                {/* View mode selector */}
                <Tabs
                  value={viewMode}
                  onValueChange={(v) => setViewMode(v as ViewMode)}
                  className="h-8"
                >
                  <TabsList className="h-8 p-0.5 bg-card border border-border/50 rounded-2xl">
                    <TabsTrigger value="heatmap" className="h-7 text-xs px-2">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span className={isMobile ? "sr-only" : "inline"}>
                        Calendar
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="categories"
                      className="h-7 text-xs px-2"
                    >
                      <Filter className="h-3.5 w-3.5 mr-1.5" />
                      <span className={isMobile ? "sr-only" : "inline"}>
                        Categories
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="h-7 text-xs px-2">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      <span className={isMobile ? "sr-only" : "inline"}>
                        Documents
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Category filter for documents view */}

            {/* Content Views with Animation */}
            <AnimatePresence mode="wait">
              {viewMode === "heatmap" && (
                <motion.div
                  key="heatmap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HeatmapView filteredHistory={filteredHistory} />
                </motion.div>
              )}

              {viewMode === "categories" && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CategoriesView
                    filteredHistory={filteredHistory}
                    timeRange={timeRange}
                    onSelectCategory={onSelectCategory}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      <TimelineCard
        readingHistory={filteredHistory}
        categories={categories}
        handleCategoryChange={handleCategoryChange}
        handleTimeRangeChange={handleTimeRangeChange}
        currentTimeRange={timeRange}
        currentCategory={selectedCategory}
        props={{
          title: "Documents TimeLine",
          description: "A look at all the documents you've read in the past 🤗",
          icon: BookOpen,
          variant: "subtle",
          insights: [
            {
              icon: BookOpen,
              label: "Total Documents Read",
              value: filteredHistory.length.toString(),
              highlight: true,
            },
            {
              label: "Most Read Document",
              value:
                filteredHistory.reduce((acc, curr) => {
                  return acc.readCount > curr.readCount ? acc : curr;
                }, filteredHistory[0]).title || "No documents read",
              icon: Crosshair,
            },
          ],
        }}
      >
        {({
          readingHistory: filteredHistory,
          currentCategory: selectedCategory,
        }) => (
          <DocumentsView
            filteredHistory={filteredHistory}
            selectedCategory={selectedCategory}
            onSelectDocument={onSelectDocument}
          />
        )}
      </TimelineCard>
      <GitHubStyleHeatmap readingHistory={readingHistory} />
    </div>
  );
};

export default ReadingTimeline;
