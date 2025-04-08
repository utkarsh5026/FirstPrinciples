import React from "react";
import { Search, Filter } from "lucide-react";
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
import useMobile from "@/hooks/useMobile";

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
 * 🌟 HistoryFilters Component
 *
 * This delightful component is your go-to for filtering through your reading history! 📚✨
 * It provides a charming interface that allows you to search for specific entries,
 * select categories, and choose timeframes, making it super easy to find what you're looking for! 🕵️‍♀️💖
 *
 * Whether you're on a mobile device or desktop, it adapts beautifully to your screen,
 * ensuring a smooth and enjoyable experience! 📱🌈
 *
 * With a search input for quick lookups and dropdowns for categories and timeframes,
 * it helps you manage your reading history effortlessly! 🎉
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

  if (isMobile)
    return (
      <MobileFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
        categories={categories}
      />
    );

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 rounded-4xl">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 rounded-2xl"
        />
      </div>

      <div className="flex gap-2">
        <div className="w-40">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="font-cascadia-code rounded-2xl">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-32">
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent className="font-cascadia-code rounded-2xl">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

/**
 * 🌟 MobileFilters Component
 *
 * This charming little component is designed to provide a delightful filtering experience for your reading history! 📚✨
 * It allows users to easily search through their history and filter by category and time period, making it a breeze to find what they're looking for! 🕵️‍♀️💖
 *
 * With a user-friendly interface, it adapts beautifully to mobile devices, ensuring that you can manage your reading history on the go! 📱🌈
 *
 * The component features a search input for quick lookups, and it displays selected filters in a cute way, so you always know what you're filtering by! 🎉
 *
 * Plus, it includes a handy popover for selecting categories and timeframes, making the filtering process smooth and enjoyable! 🌟
 */
const MobileFilters: React.FC<HistoryFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedTimeframe,
  setSelectedTimeframe,
  categories,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-full"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {selectedCategory !== "all" && (
            <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
              {selectedCategory}
            </div>
          )}
          {selectedTimeframe !== "all" && (
            <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
              {getTimeframeLabel(selectedTimeframe)}
            </div>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs flex items-center"
            >
              <Filter className="mr-1 h-3 w-3" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-3">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-cascadia-code">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-8 text-xs rounded-2xl font-cascadia-code">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="font-cascadia-code rounded-2xl">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Time Period
                </label>
                <Select
                  value={selectedTimeframe}
                  onValueChange={setSelectedTimeframe}
                >
                  <SelectTrigger className="h-8 text-xs font-cascadia-code rounded-2xl">
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent className="font-cascadia-code rounded-2xl">
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
  );
};

/**
 * 🎉 This function helps to convert a timeframe string into a user-friendly label!
 * It makes it easy for users to understand the selected time period at a glance. 😊
 *
 * Depending on the input, it returns a friendly label that can be displayed in the UI.
 * If the user selects "today", it shows "Today", and similarly for "week" and "month".
 * If none of these match, it defaults to "All Time", ensuring clarity for the user. 🌟
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
