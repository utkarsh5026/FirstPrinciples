import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Clock,
  Calendar,
  ChevronRight,
  CheckCircle2,
  LayoutGrid,
  ListFilter,
  RefreshCcw,
  Search,
  FilterX,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import { ReadingHistoryItem } from "@/components/home/types";
import { cn } from "@/lib/utils";

interface EnhancedHistoryProps {
  readingHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
  handleExploreDocuments: () => void;
  handleClearHistory: () => void;
}

// Helper type for enhanced reading history with progress
interface EnhancedReadingItem extends ReadingHistoryItem {
  progress: number;
  timeSpent: number;
  category: string;
  section?: string;
  dateGroup: string;
}

const EnhancedHistory: React.FC<EnhancedHistoryProps> = ({
  readingHistory,
  handleSelectDocument,
  handleExploreDocuments,
  handleClearHistory,
}) => {
  // State for view type (list or grid)
  const [viewType, setViewType] = useState<"list" | "grid" | "timeline">(
    "list"
  );

  // State for filter
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // State for search
  const [searchQuery, setSearchQuery] = useState("");

  // State for enhanced reading history
  const [enhancedHistory, setEnhancedHistory] = useState<EnhancedReadingItem[]>(
    []
  );

  // State for categories
  const [categories, setCategories] = useState<
    { name: string; count: number }[]
  >([]);

  // Tabs state
  const [activeTab, setActiveTab] = useState("all");

  // Process reading history to add progress and categories
  useEffect(() => {
    if (readingHistory.length === 0) {
      setEnhancedHistory([]);
      setCategories([]);
      return;
    }

    // Simulate progress for each reading item
    const processed: EnhancedReadingItem[] = readingHistory.map((item) => {
      // Extract category from path
      const pathParts = item.path.split("/");
      const category = pathParts[0] || "Uncategorized";

      // Extract section if available (second part of path)
      const section = pathParts.length > 1 ? pathParts[1] : undefined;

      // Generate a deterministic but realistic progress value based on readCount
      // First time reading might be 20-50%, subsequent readings increase progress
      const baseProgress = (item.path.length % 30) + 20; // 20-50% base progress
      const progressIncrement =
        item.readCount > 1 ? Math.min((item.readCount - 1) * 25, 50) : 0;
      const progress = Math.min(baseProgress + progressIncrement, 100);

      // Simulate time spent (5-30 minutes)
      const timeSpent = Math.max(5, (item.title.length % 25) + 5);

      // Determine date grouping
      const itemDate = new Date(item.lastReadAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      let dateGroup = "Older";
      if (itemDate >= today) {
        dateGroup = "Today";
      } else if (itemDate >= yesterday) {
        dateGroup = "Yesterday";
      } else if (itemDate >= weekStart) {
        dateGroup = "This Week";
      } else if (itemDate >= monthStart) {
        dateGroup = "This Month";
      }

      return {
        ...item,
        progress,
        timeSpent,
        category,
        section,
        dateGroup,
      };
    });

    // Sort by most recent first
    processed.sort((a, b) => b.lastReadAt - a.lastReadAt);

    // Extract and count categories
    const categoryMap: Record<string, number> = {};
    processed.forEach((item) => {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
    });

    const categoryList = Object.entries(categoryMap)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    setEnhancedHistory(processed);
    setCategories(categoryList);
  }, [readingHistory]);

  // Filter history based on category and search
  const filteredHistory = enhancedHistory.filter((item) => {
    // Filter by category if set
    if (categoryFilter && item.category !== categoryFilter) {
      return false;
    }

    // Filter by search term
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.section && item.section.toLowerCase().includes(query))
      );
    }

    // Filter by tab
    if (activeTab === "completed" && item.progress < 100) {
      return false;
    }

    if (activeTab === "in-progress" && item.progress === 100) {
      return false;
    }

    return true;
  });

  // Group history by date
  const groupedHistory: Record<string, EnhancedReadingItem[]> = {};

  // Define sort order for date groups
  const dateGroupOrder = [
    "Today",
    "Yesterday",
    "This Week",
    "This Month",
    "Older",
  ];

  // Group items
  filteredHistory.forEach((item) => {
    if (!groupedHistory[item.dateGroup]) {
      groupedHistory[item.dateGroup] = [];
    }
    groupedHistory[item.dateGroup].push(item);
  });

  // Generate CSS variable for circular progress
  const getProgressStyle = (progress: number) => {
    return {
      background: `conic-gradient(var(--primary) ${progress}%, transparent 0%)`,
    };
  };

  // Calculate total stats
  const totalDocuments = enhancedHistory.length;
  const uniqueDocuments = new Set(enhancedHistory.map((item) => item.path))
    .size;
  const completedDocuments = enhancedHistory.filter(
    (item) => item.progress === 100
  ).length;
  const totalTimeSpent = enhancedHistory.reduce(
    (total, item) => total + item.timeSpent,
    0
  );

  // Format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="text-xs text-muted-foreground">Reading Sessions</div>
          <div className="mt-2 text-2xl font-bold">{totalDocuments}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {enhancedHistory.length > 0 &&
              `Last: ${new Date(
                enhancedHistory[0].lastReadAt
              ).toLocaleDateString()}`}
          </div>
        </Card>

        <Card className="p-4 border-primary/10">
          <div className="text-xs text-muted-foreground">Unique Documents</div>
          <div className="mt-2 text-2xl font-bold">{uniqueDocuments}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {Math.round((uniqueDocuments / totalDocuments) * 100) || 0}% unique
            reads
          </div>
        </Card>

        <Card className="p-4 border-primary/10">
          <div className="text-xs text-muted-foreground">Completed</div>
          <div className="mt-2 text-2xl font-bold">{completedDocuments}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {Math.round((completedDocuments / uniqueDocuments) * 100) || 0}%
            completion rate
          </div>
        </Card>

        <Card className="p-4 border-primary/10">
          <div className="text-xs text-muted-foreground">Total Time</div>
          <div className="mt-2 text-2xl font-bold">
            {formatTime(totalTimeSpent)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Avg:{" "}
            {totalDocuments
              ? formatTime(Math.round(totalTimeSpent / totalDocuments))
              : "0 min"}
            /doc
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background/50 border-border/50 focus-visible:ring-primary/20 text-sm rounded-md w-full sm:w-48 md:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                title="Search"
              >
                <FilterX size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <select
              className="h-9 bg-background/50 border-border/50 focus-visible:ring-primary/20 text-sm rounded-md pl-3 pr-8 appearance-none"
              value={categoryFilter || ""}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none transform rotate-90" />
          </div>

          {(searchQuery || categoryFilter) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter(null);
              }}
            >
              <FilterX className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* View Type Toggle */}
        <div className="flex items-center">
          <div className="bg-secondary/20 rounded-lg p-1 flex">
            <button
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium",
                viewType === "list"
                  ? "bg-card text-foreground"
                  : "text-muted-foreground"
              )}
              onClick={() => setViewType("list")}
            >
              <span className="hidden sm:inline">List</span>
              <ListFilter className="h-4 w-4 sm:hidden" />
            </button>
            <button
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium",
                viewType === "grid"
                  ? "bg-card text-foreground"
                  : "text-muted-foreground"
              )}
              onClick={() => setViewType("grid")}
            >
              <span className="hidden sm:inline">Grid</span>
              <LayoutGrid className="h-4 w-4 sm:hidden" />
            </button>
            <button
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium",
                viewType === "timeline"
                  ? "bg-card text-foreground"
                  : "text-muted-foreground"
              )}
              onClick={() => setViewType("timeline")}
            >
              <span className="hidden sm:inline">Timeline</span>
              <BarChart3 className="h-4 w-4 sm:hidden" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="text-xs">
            All History
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Completed ({completedDocuments})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="text-xs">
            In Progress ({totalDocuments - completedDocuments})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content based on view type */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-6">
          {/* List View */}
          {viewType === "list" && (
            <div className="space-y-6">
              {dateGroupOrder.map((dateGroup) => {
                if (!groupedHistory[dateGroup]) return null;

                return (
                  <div key={dateGroup}>
                    <div className="flex items-center mb-2">
                      <h3 className="text-sm font-medium">{dateGroup}</h3>
                      <Separator className="ml-3 flex-grow" />
                    </div>

                    <div className="space-y-3">
                      {groupedHistory[dateGroup].map((item) => (
                        <Card
                          key={`${item.path}-${item.lastReadAt}`}
                          className="p-4 hover:border-primary/20 transition-colors cursor-pointer"
                          onClick={() =>
                            handleSelectDocument(item.path, item.title)
                          }
                        >
                          <div className="flex gap-4">
                            {/* Left: Progress circle */}
                            <div className="relative flex-shrink-0">
                              <div
                                className="w-14 h-14 rounded-full flex items-center justify-center border-4 border-secondary/20"
                                style={getProgressStyle(item.progress)}
                              >
                                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                                  <span className="text-xs font-bold">
                                    {item.progress}%
                                  </span>
                                </div>
                              </div>
                              {item.progress === 100 && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                                  <CheckCircle2 size={14} />
                                </div>
                              )}
                            </div>

                            {/* Right: Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-base line-clamp-1">
                                    {item.title}
                                  </h4>
                                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                    <Badge
                                      variant="secondary"
                                      className="mr-2 bg-primary/5 text-primary border-none"
                                    >
                                      {item.category}
                                    </Badge>
                                    <Clock size={12} className="mr-1" />
                                    {formatTime(item.timeSpent)} reading time
                                  </div>
                                </div>
                                <ArrowUpRight
                                  size={16}
                                  className="text-muted-foreground flex-shrink-0"
                                />
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div>
                                    <Calendar
                                      size={12}
                                      className="inline mr-1"
                                    />
                                    {new Date(item.lastReadAt).toLocaleString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </div>
                                  {item.readCount > 1 && (
                                    <Badge
                                      variant="outline"
                                      className="h-5 text-[10px]"
                                    >
                                      Read {item.readCount}×
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[10px]",
                                      item.progress === 100
                                        ? "border-green-500 text-green-500"
                                        : item.progress >= 75
                                        ? "border-blue-500 text-blue-500"
                                        : item.progress >= 50
                                        ? "border-yellow-500 text-yellow-500"
                                        : "border-orange-500 text-orange-500"
                                    )}
                                  >
                                    {item.progress === 100
                                      ? "Completed"
                                      : "In Progress"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grid View */}
          {viewType === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map((item) => (
                <Card
                  key={`${item.path}-${item.lastReadAt}`}
                  className="p-4 hover:border-primary/20 transition-colors cursor-pointer flex flex-col"
                  onClick={() => handleSelectDocument(item.path, item.title)}
                >
                  {/* Top: Document info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <Badge
                        variant="secondary"
                        className="mb-2 bg-primary/5 text-primary border-none"
                      >
                        {item.category}
                      </Badge>
                      <div className="relative w-8 h-8">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-secondary/20"
                          style={getProgressStyle(item.progress)}
                        >
                          <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center">
                            <span className="text-[9px] font-bold">
                              {item.progress}%
                            </span>
                          </div>
                        </div>
                        {item.progress === 100 && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                            <CheckCircle2 size={10} />
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="font-medium text-sm line-clamp-2 mt-1">
                      {item.title}
                    </h4>

                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={12} className="mr-1" />
                      {formatTime(item.timeSpent)}

                      {item.readCount > 1 && (
                        <Badge variant="outline" className="h-5 text-[10px]">
                          Read {item.readCount}×
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Date and status */}
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground truncate">
                      <Calendar size={12} className="inline mr-1" />
                      {item.dateGroup}
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        item.progress === 100
                          ? "border-green-500 text-green-500"
                          : item.progress >= 75
                          ? "border-blue-500 text-blue-500"
                          : item.progress >= 50
                          ? "border-yellow-500 text-yellow-500"
                          : "border-orange-500 text-orange-500"
                      )}
                    >
                      {item.progress === 100 ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Timeline View */}
          {viewType === "timeline" && (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border/50"></div>

              <div className="space-y-6 ml-6 pl-6">
                {dateGroupOrder.map((dateGroup) => {
                  if (!groupedHistory[dateGroup]) return null;

                  return (
                    <div key={dateGroup}>
                      <div className="flex items-center mb-4 -ml-12">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                          <Clock
                            size={12}
                            className="text-primary-foreground"
                          />
                        </div>
                        <h3 className="ml-4 text-sm font-medium">
                          {dateGroup}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {groupedHistory[dateGroup].map((item) => (
                          <div
                            key={`${item.path}-${item.lastReadAt}`}
                            className="relative"
                          >
                            <div className="absolute -left-10 top-4 w-4 h-4 rounded-full bg-secondary/50 z-10"></div>

                            <Card
                              className="p-4 hover:border-primary/20 transition-colors cursor-pointer"
                              onClick={() =>
                                handleSelectDocument(item.path, item.title)
                              }
                            >
                              <div className="flex gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center mb-1">
                                        <Badge
                                          variant="secondary"
                                          className="mr-2 bg-primary/5 text-primary"
                                        >
                                          {item.category}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(
                                            item.lastReadAt
                                          ).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>

                                      <h4 className="font-medium text-sm line-clamp-1">
                                        {item.title}
                                      </h4>
                                    </div>

                                    <div className="flex items-center">
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-[10px] mr-2",
                                          item.progress === 100
                                            ? "border-green-500 text-green-500"
                                            : "border-orange-500 text-orange-500"
                                        )}
                                      >
                                        {item.progress === 100
                                          ? "Completed"
                                          : `${item.progress}%`}
                                      </Badge>

                                      <ArrowUpRight
                                        size={16}
                                        className="text-muted-foreground flex-shrink-0"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-3 flex items-center text-xs text-muted-foreground">
                                    <Clock size={12} className="mr-1" />
                                    {formatTime(item.timeSpent)} reading time
                                    {item.readCount > 1 && (
                                      <Badge
                                        variant="outline"
                                        className="h-5 text-[10px] ml-2"
                                      >
                                        Read {item.readCount}×
                                      </Badge>
                                    )}
                                  </div>

                                  <Progress
                                    value={item.progress}
                                    className={cn(
                                      "h-1 mt-3",
                                      item.progress === 100
                                        ? "bg-green-500"
                                        : item.progress >= 75
                                        ? "bg-blue-500"
                                        : item.progress >= 50
                                        ? "bg-yellow-500"
                                        : "bg-orange-500"
                                    )}
                                  />
                                </div>
                              </div>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Showing {filteredHistory.length} of {enhancedHistory.length}{" "}
              entries
            </span>

            {filteredHistory.length !== enhancedHistory.length && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter(null);
                  setActiveTab("all");
                }}
              >
                <RefreshCcw className="h-3 w-3 mr-1.5" />
                Show All
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to clear your reading history? This cannot be undone."
                  )
                ) {
                  handleClearHistory();
                }
              }}
            >
              Clear History
            </Button>
          </div>
        </div>
      ) : (
        // Empty state
        <div className="bg-card rounded-xl border border-border/40 shadow-sm p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 opacity-50" />
          </div>
          <p className="text-base font-medium">No reading history yet</p>
          <p className="text-sm mt-1 mb-6 text-muted-foreground">
            {searchQuery || categoryFilter
              ? "No results match your current filters"
              : "Documents you read will appear here"}
          </p>

          {searchQuery || categoryFilter ? (
            <Button
              variant="outline"
              className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter(null);
              }}
            >
              Clear Filters
            </Button>
          ) : (
            <Button
              variant="outline"
              className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
              onClick={handleExploreDocuments}
            >
              Explore documents
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedHistory;
