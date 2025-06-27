import React, { useState, useMemo } from "react";
import { Calendar, Filter, BookOpen, Crosshair } from "lucide-react";
import HeatmapView from "./heat-map";
import GitHubStyleHeatmap from "./github-heatmap";
import CategoriesView from "./categories";
import DocumentsView from "./documents";
import { type TimeRange, getStartDate } from "@/utils/time";
import { useCategoryStore, useHistoryStore } from "@/stores";
import CardContainer from "@/components/shared/container/CardContainer";
import TimeRangeSelect from "@/components/utils/select/TimeRangeSelect";
import CategorySelect from "@/components/utils/select/CategorySelect";

interface ReadingTimelineProps {
  onSelectCategory?: (category: string) => void;
  onSelectDocument?: (path: string, title: string) => void;
}

const ReadingTimeline: React.FC<ReadingTimelineProps> = ({
  onSelectCategory,
  onSelectDocument,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
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
      <CardContainer
        title="Heatmap"
        description="A look at all the documents you've read in the past 🤗"
        icon={Calendar}
        variant="subtle"
        insights={[
          {
            icon: Calendar,
            label: "Total Documents Read",
            value: filteredHistory.length.toString(),
            highlight: true,
          },
        ]}
        headerAction={
          <div className="flex items-center gap-2">
            <CategorySelect
              categories={categories}
              onCategoryChange={handleCategoryChange}
              currentCategory={selectedCategory ?? "all"}
            />
          </div>
        }
      >
        <HeatmapView filteredHistory={filteredHistory} />
      </CardContainer>
      <CardContainer
        title="Documents TimeLine"
        description="A look at all the documents you've read in the past 🤗"
        icon={BookOpen}
        variant="subtle"
        insights={[
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
        ]}
        headerAction={
          <div className="flex items-center gap-2">
            <TimeRangeSelect
              onTimeRangeChange={handleTimeRangeChange}
              currentTimeRange={timeRange}
            />
            <CategorySelect
              categories={categories}
              onCategoryChange={handleCategoryChange}
              currentCategory={selectedCategory ?? "all"}
            />
          </div>
        }
      >
        <DocumentsView
          filteredHistory={filteredHistory}
          selectedCategory={selectedCategory}
          onSelectDocument={onSelectDocument}
        />
      </CardContainer>

      <CardContainer
        title="Categories"
        icon={Filter}
        description="A look at all the categories you've read in the past 🤗"
        headerAction={
          <TimeRangeSelect
            onTimeRangeChange={handleTimeRangeChange}
            currentTimeRange={timeRange}
          />
        }
      >
        <CategoriesView
          filteredHistory={filteredHistory}
          timeRange={timeRange}
          onSelectCategory={onSelectCategory}
        />
      </CardContainer>
      <GitHubStyleHeatmap readingHistory={readingHistory} />
    </div>
  );
};

export default ReadingTimeline;
