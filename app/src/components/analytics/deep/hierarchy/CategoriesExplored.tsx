import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useReadingMetrics, useReadingHistory, useAnalytics } from "@/context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookText,
  Rocket,
  Bookmark,
  Clock,
  Award,
  PieChart,
  BarChart3,
  CalendarClock,
} from "lucide-react";
import { fromSnakeToTitleCase } from "@/utils/string";
import { COLORS } from "@/lib/constants";
import { useTheme } from "@/components/theme/context/ThemeContext";
import getIconForTech from "@/components/icons";
import useMobile from "@/hooks/useMobile";
import { formatRelativeTime } from "@/utils/time";
import { Badge } from "@/components/ui/badge";

type ViewMode = "list" | "chart" | "timeline";

const EnhancedCategoriesExplored: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const { analyticsData } = useReadingMetrics();
  const { categoryBreakdown } = analyticsData;
  const { readingHistory } = useReadingHistory();
  const { totalCategoryBreakdown } = useAnalytics();
  const { currentTheme } = useTheme();
  const { isMobile } = useMobile();

  // Enhanced category coverage data with more stats
  const categoryCoverage = useMemo(() => {
    if (!categoryBreakdown.length) return [];

    // Find the total number of reads
    const totalReads = readingHistory.length;

    return categoryBreakdown
      .map((category, index) => {
        // Calculate various metrics
        const categoryDocs = readingHistory.filter((item) =>
          item.path.startsWith(category.name)
        );

        const lastReadItem = [...categoryDocs].sort(
          (a, b) => b.lastReadAt - a.lastReadAt
        )[0];

        const totalTimeSpent = categoryDocs.reduce(
          (sum, doc) => sum + (doc.timeSpent || 0),
          0
        );

        // Format time for display
        const timeSpentMinutes = Math.floor(totalTimeSpent / (1000 * 60));
        let timeDisplay = "";
        if (timeSpentMinutes >= 60) {
          const hours = Math.floor(timeSpentMinutes / 60);
          const mins = timeSpentMinutes % 60;
          timeDisplay = `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
        } else if (timeSpentMinutes > 0) {
          timeDisplay = `${timeSpentMinutes}m`;
        }

        // Calculate readable percentage and ranking
        const percentage =
          totalReads > 0 ? Math.round((category.value / totalReads) * 100) : 0;

        return {
          name: category.name,
          displayName: fromSnakeToTitleCase(category.name),
          value: category.value,
          percentage,
          timeSpent: totalTimeSpent,
          timeDisplay,
          lastRead: lastReadItem?.lastReadAt || null,
          color: COLORS[index % COLORS.length],
          rank: index + 1,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [categoryBreakdown, readingHistory]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
  };

  // Calculate overall stats
  const stats = useMemo(() => {
    const totalCategories = categoryCoverage.length;
    const totalReads = readingHistory.length;
    const totalTime = readingHistory.reduce(
      (sum, item) => sum + (item.timeSpent || 0),
      0
    );

    // Format time
    const timeMinutes = Math.floor(totalTime / (1000 * 60));
    let timeDisplay = "";
    if (timeMinutes >= 60) {
      const hours = Math.floor(timeMinutes / 60);
      const mins = timeMinutes % 60;
      timeDisplay = `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
    } else {
      timeDisplay = `${timeMinutes}m`;
    }

    return {
      totalCategories,
      totalReads,
      timeDisplay,
    };
  }, [categoryCoverage, readingHistory]);

  // Empty state view
  if (categoryCoverage.length === 0) {
    return (
      <motion.div
        className="h-full flex items-center justify-center flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <BookText className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
        <p className="text-sm text-muted-foreground">
          No categories explored yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Start reading to discover content
        </p>
      </motion.div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* View mode selector */}
      <div className="mb-3 flex justify-between items-center">
        <h4 className="text-sm font-medium flex items-center">
          <Bookmark className="h-4 w-4 mr-2 text-primary" />
          Categories Explored
        </h4>

        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
        >
          <TabsList className="h-8 p-0.5 bg-card border border-border/30">
            <TabsTrigger
              value="list"
              className="h-7 text-xs px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <BookText className="h-3.5 w-3.5 mr-1" />
              <span className={isMobile ? "sr-only" : "inline"}>List</span>
            </TabsTrigger>
            <TabsTrigger
              value="chart"
              className="h-7 text-xs px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <BarChart3 className="h-3.5 w-3.5 mr-1" />
              <span className={isMobile ? "sr-only" : "inline"}>Chart</span>
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="h-7 text-xs px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <CalendarClock className="h-3.5 w-3.5 mr-1" />
              <span className={isMobile ? "sr-only" : "inline"}>Timeline</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content area */}
      <ScrollArea className="flex-1 overflow-y-auto pr-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {viewMode === "list" && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {categoryCoverage.map((category) => {
                  const CategoryIcon = getIconForTech(category.name);

                  return (
                    <motion.div
                      key={category.name}
                      variants={itemVariants}
                      className="bg-card/50 rounded-lg border border-border/20 p-3 hover:border-primary/20 transition-colors"
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    >
                      <div className="flex items-start">
                        <div
                          className="mr-3 p-2 rounded-md"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <CategoryIcon
                            className="w-5 h-5"
                            style={{ color: category.color }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm truncate">
                                {category.displayName}
                              </h4>
                              <div className="flex items-center mt-0.5 gap-2">
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <BookText className="w-3 h-3 mr-1" />
                                  <span>{category.value} reads</span>
                                </div>

                                {category.timeDisplay && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3 mr-1" />
                                    <span>{category.timeDisplay}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: `${category.color}40`,
                                color: category.color,
                              }}
                            >
                              {category.percentage}%
                            </Badge>
                          </div>

                          <div className="mt-2">
                            <Progress
                              value={category.percentage}
                              className="h-1.5"
                              style={{
                                backgroundImage: `linear-gradient(to right, ${category.color}10, ${category.color}05)`,
                                borderRadius: "999px",
                              }}
                              indicatorClassName="bg-none"
                              indicatorStyle={{
                                background: category.color,
                              }}
                            />
                          </div>

                          {category.lastRead && (
                            <motion.div
                              className="text-xs mt-2 flex items-center gap-1.5 text-muted-foreground"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <Bookmark className="w-3 h-3" />
                              <span>
                                Last read{" "}
                                {formatRelativeTime(category.lastRead)}
                              </span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {viewMode === "chart" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full"
              >
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <PieChart className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Chart view coming soon
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Switch to the "Distribution" tab for category charts
                  </p>
                </div>
              </motion.div>
            )}

            {viewMode === "timeline" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full"
              >
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <CalendarClock className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Timeline view coming soon
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    See your category exploration journey over time
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>

      {/* Stats footer */}
      <div className="mt-4 pt-3 border-t border-border/30">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Rocket className="w-3.5 h-3.5" />
            <span>{stats.totalCategories} categories explored</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <BookText className="w-3.5 h-3.5" />
              <span>{stats.totalReads} reads</span>
            </div>
            {stats.timeDisplay && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{stats.timeDisplay} spent</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCategoriesExplored;
