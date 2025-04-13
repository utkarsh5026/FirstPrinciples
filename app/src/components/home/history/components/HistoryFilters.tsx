import React from "react";
import { Search, Filter, CalendarClock, Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import useMobile from "@/hooks/useMobile";
import { fromSnakeToTitleCase } from "@/utils/string";
import getIconForTech from "@/components/icons/iconMap";

interface HistoryFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
  categories: string[];
}

/**
 * Enhanced HistoryFilters Component
 *
 * A beautifully styled filter interface for the reading history.
 * Features search functionality, category selection, and timeframe filtering
 * with an optimized design for both mobile and desktop.
 */
const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedTimeframe,
  setSelectedTimeframe,
  categories,
}) => {
  const { isMobile } = useMobile();

  // Clear all active filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedTimeframe("all");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    selectedTimeframe !== "all";

  if (isMobile) {
    return (
      <MobileFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
        categories={categories}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 rounded-xl group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <Input
            placeholder="Search reading history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl border-primary/10 focus:border-primary/30 bg-card/40 backdrop-blur-sm shadow-sm"
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <div className="w-40">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="h-10 rounded-xl border-primary/10 focus:border-primary/30 bg-card/40 backdrop-blur-sm shadow-sm">
                <div className="flex items-center">
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="font-cascadia-code rounded-2xl">
                {categories.map((category) => {
                  const CategoryIcon = getIconForTech(category);
                  return (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center">
                        <CategoryIcon className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        <span className="text-sm">
                          {category === "all"
                            ? "All Categories"
                            : fromSnakeToTitleCase(category)}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select
              value={selectedTimeframe}
              onValueChange={setSelectedTimeframe}
            >
              <SelectTrigger className="h-10 rounded-xl border-primary/10 focus:border-primary/30 bg-card/40 backdrop-blur-sm shadow-sm">
                <div className="flex items-center">
                  <CalendarClock className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  <SelectValue placeholder="Time" />
                </div>
              </SelectTrigger>
              <SelectContent className="font-cascadia-code rounded-xl">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-2xl border-2 border-primary hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 text-primary" />
            </Button>
          )}
        </div>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mt-3"
        >
          <div className="text-xs text-muted-foreground flex items-center mr-1">
            <Filter className="h-3 w-3 mr-1" />
            Active filters:
          </div>

          {searchQuery && (
            <Badge
              variant="outline"
              className="text-xs bg-primary/5 border-primary/20 text-primary"
            >
              Search: {searchQuery}
              <button
                className="ml-1"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedCategory !== "all" && (
            <Badge
              variant="outline"
              className="text-xs bg-primary/5 border-primary/20 text-primary"
            >
              Category: {selectedCategory}
              <button
                className="ml-1"
                onClick={() => setSelectedCategory("all")}
                title="Clear category"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedTimeframe !== "all" && (
            <Badge
              variant="outline"
              className="text-xs bg-primary/5 border-primary/20 text-primary"
            >
              Time: {getTimeframeLabel(selectedTimeframe)}
              <button
                className="ml-1"
                onClick={() => setSelectedTimeframe("all")}
                title="Clear time"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </motion.div>
      )}
    </div>
  );
};

/**
 * Enhanced MobileFilters Component
 *
 * A mobile-optimized version of the filters interface with a popover for
 * selecting categories and timeframes, and a clean display of active filters.
 */
const MobileFilters: React.FC<
  HistoryFiltersProps & {
    clearFilters: () => void;
    hasActiveFilters: boolean;
  }
> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedTimeframe,
  setSelectedTimeframe,
  categories,
  clearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="space-y-3">
      <div className="relative w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-full rounded-xl border-primary/10 focus:border-primary/30 bg-card/40 backdrop-blur-sm shadow-sm"
        />
        {searchQuery && (
          <button
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setSearchQuery("")}
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategory !== "all" && (
            <Badge
              variant="outline"
              className="text-xs bg-primary/5 border-primary/20 flex items-center gap-1"
            >
              <Tag className="h-3 w-3" /> {selectedCategory}
              <button
                onClick={() => setSelectedCategory("all")}
                title="Clear category"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTimeframe !== "all" && (
            <Badge
              variant="outline"
              className="text-xs bg-primary/5 border-primary/20 flex items-center gap-1"
            >
              <CalendarClock className="h-3 w-3" />{" "}
              {getTimeframeLabel(selectedTimeframe)}
              <button
                onClick={() => setSelectedTimeframe("all")}
                title="Clear time"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 rounded-lg"
              onClick={clearFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs flex items-center border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-lg"
              >
                <Filter className="mr-1 h-3 w-3" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-4 rounded-xl border border-primary/10 shadow-lg">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-cascadia-code flex items-center">
                    <Tag className="h-3 w-3 mr-1.5 text-primary" />
                    Category
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="h-8 text-xs rounded-lg font-cascadia-code">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="font-cascadia-code rounded-xl">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center">
                    <CalendarClock className="h-3 w-3 mr-1.5 text-primary" />
                    Time Period
                  </label>
                  <Select
                    value={selectedTimeframe}
                    onValueChange={setSelectedTimeframe}
                  >
                    <SelectTrigger className="h-8 text-xs font-cascadia-code rounded-lg">
                      <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent className="font-cascadia-code rounded-xl">
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper function to convert timeframe codes to readable labels
 */
const getTimeframeLabel = (timeframe: string): string => {
  switch (timeframe) {
    case "today":
      return "Today";
    case "week":
      return "This Week";
    case "month":
      return "This Month";
    default:
      return "All Time";
  }
};

export default HistoryFilters;
