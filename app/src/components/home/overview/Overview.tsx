import React, { useState, useEffect } from "react";
import {
  Clock,
  BookOpen,
  Star,
  Calendar,
  BookMarked,
  Flame,
  ArrowUpRight,
  Zap,
  FileText,
  ListTodo,
  Activity,
  BookCopy,
  Brain,
  Trophy,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { ReadingHistoryItem, ReadingTodoItem } from "@/components/home/types";
import { FileMetadata } from "@/utils/MarkdownLoader";
import { ReadingAnalyticsService } from "@/utils/ReadingAnalyticsService";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

interface EnhancedOverviewProps {
  todoList: ReadingTodoItem[];
  readingHistory: ReadingHistoryItem[];
  availableDocuments: FileMetadata[];
  handleSelectDocument: (path: string, title: string) => void;
  toggleTodoCompletion: (id: string) => void;
  formatDate: (timestamp: number) => string;
  setShowAddTodoModal: () => void;
}

const EnhancedOverview: React.FC<EnhancedOverviewProps> = ({
  todoList,
  readingHistory,
  availableDocuments,
  handleSelectDocument,
  toggleTodoCompletion,
  formatDate,
  setShowAddTodoModal,
}) => {
  const { currentTheme } = useTheme();

  // Reading stats from analytics service
  const [stats, setStats] = useState(() =>
    ReadingAnalyticsService.getReadingStats()
  );
  const [featuredDocs, setFeaturedDocs] = useState<FileMetadata[]>([]);
  const [categoryData, setCategoryData] = useState<
    { name: string; value: number }[]
  >([]);
  const [weekdayData, setWeekdayData] = useState<
    { name: string; count: number }[]
  >([]);
  const [mostReadCategory, setMostReadCategory] = useState<string>("None yet");

  // Generate dynamic chart colors based on theme
  const generateChartColors = () => {
    return [
      currentTheme.primary,
      `${currentTheme.primary}DD`,
      `${currentTheme.primary}BB`,
      `${currentTheme.primary}99`,
      `${currentTheme.primary}77`,
    ];
  };

  const COLORS = generateChartColors();

  useEffect(() => {
    // Update stats when history or todo list changes
    setStats(ReadingAnalyticsService.getReadingStats());

    // Generate category data for pie chart
    const categories: Record<string, number> = {};
    readingHistory.forEach((item) => {
      const category = item.path.split("/")[0] || "uncategorized";
      categories[category] = (categories[category] || 0) + 1;
    });

    const categoriesArray = Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
    setCategoryData(categoriesArray);

    // Find most read category
    if (categoriesArray.length > 0) {
      const sorted = [...categoriesArray].sort((a, b) => b.value - a.value);
      setMostReadCategory(sorted[0].name);
    }

    // Generate weekday data
    const weekdays = [
      { name: "Mon", count: 0 },
      { name: "Tue", count: 0 },
      { name: "Wed", count: 0 },
      { name: "Thu", count: 0 },
      { name: "Fri", count: 0 },
      { name: "Sat", count: 0 },
      { name: "Sun", count: 0 },
    ];

    readingHistory.forEach((item) => {
      const day = new Date(item.lastReadAt).getDay();
      // Convert from 0-6 (Sunday-Saturday) to weekdays array index
      const index = day === 0 ? 6 : day - 1;
      weekdays[index].count++;
    });

    setWeekdayData(weekdays);

    // Get featured/recommended documents
    if (availableDocuments.length > 0) {
      // Try to recommend based on most read category
      let recommended: FileMetadata[] = [];

      if (categoriesArray.length > 0) {
        const topCategory = categoriesArray[0].name;
        // Find unread docs from top category
        recommended = availableDocuments
          .filter(
            (doc) =>
              doc.path.startsWith(topCategory) &&
              !readingHistory.some((item) => item.path === doc.path)
          )
          .slice(0, 4);
      }

      // If not enough recommended docs, add some random ones
      if (recommended.length < 4) {
        const remaining = 4 - recommended.length;
        const otherDocs = availableDocuments
          .filter(
            (doc) =>
              !recommended.includes(doc) &&
              !readingHistory.some((item) => item.path === doc.path)
          )
          .sort(() => 0.5 - Math.random())
          .slice(0, remaining);

        recommended = [...recommended, ...otherDocs];
      }

      setFeaturedDocs(recommended);
    }
  }, [readingHistory, todoList, availableDocuments, currentTheme]);

  // Format reading time
  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate next milestone
  const getNextMilestone = () => {
    const completedCount = readingHistory.length;
    if (completedCount < 5) return { target: 5, progress: completedCount };
    if (completedCount < 10) return { target: 10, progress: completedCount };
    if (completedCount < 20) return { target: 20, progress: completedCount };
    if (completedCount < 50) return { target: 50, progress: completedCount };
    return { target: 100, progress: completedCount };
  };

  const nextMilestone = getNextMilestone();
  const milestoneProgress =
    (nextMilestone.progress / nextMilestone.target) * 100;

  // Get unread documents count
  const unreadDocs = availableDocuments.length - readingHistory.length;

  // Get reading streak info
  const streakEmoji =
    stats.currentStreak >= 7 ? "🔥" : stats.currentStreak >= 3 ? "🔆" : "✨";

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (readingHistory.length / Math.max(availableDocuments.length, 1)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Top stats cards with visual improvements */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Reading Progress */}
        <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
          {/* Decorative accent */}
          <div
            className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary}, transparent)`,
            }}
          ></div>

          <div className="flex items-center mb-2">
            <div className="mr-2 p-1.5 rounded-md bg-primary/10">
              <BookCopy className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground">
              Overall Progress
            </div>
          </div>

          <div className="flex items-baseline mb-1">
            <span className="text-2xl font-bold">{completionPercentage}%</span>
            <span className="text-muted-foreground text-xs ml-1">complete</span>
          </div>

          <Progress
            value={completionPercentage}
            className="h-1.5 mb-2"
            style={{
              background: `${currentTheme.secondary}`,
              overflow: "hidden",
            }}
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{readingHistory.length} read</span>
            <span>{unreadDocs} left</span>
          </div>
        </Card>

        {/* Reading Streak */}
        <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
          {/* Decorative accent */}
          <div
            className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary}, transparent)`,
            }}
          ></div>

          <div className="flex items-center mb-2">
            <div className="mr-2 p-1.5 rounded-md bg-primary/10">
              <Flame className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>

          <div className="flex items-center mb-3">
            <span className="text-2xl font-bold">{stats.currentStreak}</span>
            <span className="text-xl ml-1">{streakEmoji}</span>
            <span className="text-muted-foreground text-xs ml-1">days</span>
          </div>

          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Best: {stats.longestStreak} days</span>
            {stats.currentStreak > 0 && <span>Keep it up!</span>}
          </div>
        </Card>

        {/* Reading Time */}
        <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
          {/* Decorative accent */}
          <div
            className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary}, transparent)`,
            }}
          ></div>

          <div className="flex items-center mb-2">
            <div className="mr-2 p-1.5 rounded-md bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground">Total Reading</div>
          </div>

          <div className="flex mb-3">
            <span className="text-2xl font-bold">
              {formatReadingTime(stats.totalReadingTime)}
            </span>
          </div>

          <div className="text-xs text-muted-foreground flex justify-between">
            <span>~{formatNumber(stats.estimatedWordsRead)} words</span>
            <span>
              Today: {formatReadingTime(stats.lastSessionDuration || 0)}
            </span>
          </div>
        </Card>

        {/* Next Milestone */}
        <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
          {/* Decorative accent */}
          <div
            className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary}, transparent)`,
            }}
          ></div>

          <div className="flex items-center mb-2">
            <div className="mr-2 p-1.5 rounded-md bg-primary/10">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground">Next Milestone</div>
          </div>

          <div className="flex items-baseline mb-1">
            <span className="text-2xl font-bold">{nextMilestone.target}</span>
            <span className="text-muted-foreground text-xs ml-1">docs</span>
          </div>

          <Progress
            value={milestoneProgress}
            className="h-1.5 mb-2"
            style={{
              background: `${currentTheme.secondary}`,
              overflow: "hidden",
            }}
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {nextMilestone.progress} / {nextMilestone.target}
            </span>
            <span>{nextMilestone.target - nextMilestone.progress} to go</span>
          </div>
        </Card>
      </div>

      {/* Middle section - Reading patterns and Up Next */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reading patterns */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center">
            <Activity className="mr-2 h-4 w-4 text-primary" />
            Reading Insights
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Category breakdown */}
            <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-30"></div>

              <div className="relative">
                <div className="text-xs text-muted-foreground mb-2 flex items-center">
                  <Brain className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                  Categories
                </div>

                {categoryData.length > 0 ? (
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={45}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="transparent"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${entry.name}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value, name) => [`${value} docs`, name]}
                          contentStyle={{
                            background: currentTheme.cardBg,
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: "4px",
                            color: currentTheme.foreground,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-36 flex items-center justify-center text-center">
                    <div className="text-muted-foreground text-xs">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>
                        Read more documents
                        <br />
                        to see patterns
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-center text-muted-foreground mt-1">
                  Most read:{" "}
                  <span className="font-medium text-primary/90">
                    {mostReadCategory}
                  </span>
                </div>
              </div>
            </Card>

            {/* Weekly pattern */}
            <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-30"></div>

              <div className="relative">
                <div className="text-xs text-muted-foreground mb-2 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                  Weekly Pattern
                </div>

                {weekdayData.some((day) => day.count > 0) ? (
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={weekdayData}
                        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                      >
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          fontSize={10}
                          tick={{ fill: currentTheme.foreground + "80" }}
                        />
                        <RechartsTooltip
                          formatter={(value) => [`${value} docs`, "Read"]}
                          contentStyle={{
                            background: currentTheme.cardBg,
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: "4px",
                            color: currentTheme.foreground,
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill={currentTheme.primary}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-36 flex items-center justify-center text-center">
                    <div className="text-muted-foreground text-xs">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>
                        Read more to see
                        <br />
                        your weekly patterns
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-center text-muted-foreground mt-1">
                  {weekdayData.some((day) => day.count > 0) ? (
                    <span>
                      Best day:{" "}
                      <span className="font-medium text-primary/90">
                        {
                          weekdayData.reduce((prev, current) =>
                            prev.count > current.count ? prev : current
                          ).name
                        }
                      </span>
                    </span>
                  ) : (
                    <span>Track your reading patterns</span>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Recent activity */}
          <Card className="p-4 border-primary/10 bg-gradient-to-r from-secondary/5 to-transparent hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary/70" />
                Recent Activity
              </h4>
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: currentTheme.primary + "30",
                  color: currentTheme.primary,
                }}
              >
                Latest
              </Badge>
            </div>

            {readingHistory.length > 0 ? (
              <div className="space-y-2">
                {readingHistory.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/5 transition-colors cursor-pointer group"
                    onClick={() => handleSelectDocument(item.path, item.title)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1 inline-block" />
                        <span>{formatDate(item.lastReadAt)}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No reading activity yet</p>
                <p className="text-xs mt-1">
                  Your recent reads will appear here
                </p>
              </div>
            )}

            {readingHistory.length > 3 && (
              <div className="text-center mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary hover:bg-primary/10"
                >
                  View all activity
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Up Next and Tasks section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center">
            <Zap className="mr-2 h-4 w-4 text-primary" />
            Continue Learning
          </h3>

          {/* Featured/Recommended Docs */}
          <Card className="p-4 border-primary/10 hover:border-primary/30 transition-colors overflow-hidden relative">
            {/* Decorative background element */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-radial from-primary/5 to-transparent rounded-full -mr-8 -mt-8 opacity-50"></div>

            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium flex items-center">
                  <Star className="h-4 w-4 mr-2 text-primary/70" />
                  Recommended for You
                </h4>
                {mostReadCategory !== "None yet" && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-primary/10 border-none text-primary"
                  >
                    Based on {mostReadCategory}
                  </Badge>
                )}
              </div>

              {featuredDocs.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {featuredDocs.map((doc, idx) => (
                    <button
                      key={idx}
                      className="p-3 rounded-lg border border-border/40 hover:border-primary/20 hover:bg-primary/5 transition-all text-left flex flex-col"
                      onClick={() => handleSelectDocument(doc.path, doc.title)}
                    >
                      <span className="text-sm font-medium line-clamp-2">
                        {doc.title}
                      </span>
                      <div className="mt-auto pt-2 flex items-center text-xs text-muted-foreground">
                        <FileText className="h-3 w-3 mr-1" />
                        <span className="truncate">
                          {doc.path.split("/")[0]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground bg-card/50 rounded-lg">
                  <Star className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No recommendations yet</p>
                  <p className="text-xs mt-1">
                    Read more to get personalized suggestions
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Upcoming Tasks / Reading List Preview */}
          <Card className="p-4 border-primary/10 bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium flex items-center">
                <BookMarked className="h-4 w-4 mr-2 text-primary/70" />
                Upcoming Reads
              </h4>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                onClick={setShowAddTodoModal}
              >
                <ListTodo className="h-3 w-3 mr-1.5" />
                Add
              </Button>
            </div>

            {todoList.filter((item) => !item.completed).length > 0 ? (
              <div className="space-y-2">
                {todoList
                  .filter((item) => !item.completed)
                  .slice(0, 3)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-2 rounded-md hover:bg-primary/5 transition-colors group"
                    >
                      <button
                        className="mt-1 flex-shrink-0 h-5 w-5 rounded-full border border-primary/30 hover:border-primary/50 transition-colors group-hover:bg-primary/10"
                        onClick={() => toggleTodoCompletion(item.id)}
                        aria-label="Mark as read"
                      />
                      <div className="min-w-0 flex-1">
                        <button
                          className="text-left text-sm font-medium hover:text-primary transition-colors line-clamp-1 w-full"
                          onClick={() =>
                            handleSelectDocument(item.path, item.title)
                          }
                        >
                          {item.title}
                        </button>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Added {formatDate(item.addedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground bg-card/50 rounded-lg">
                <ListTodo className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Your reading list is empty</p>
                <p className="text-xs mt-1">
                  Add documents you want to read later
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                  onClick={setShowAddTodoModal}
                >
                  Add documents
                </Button>
              </div>
            )}

            {todoList.filter((item) => !item.completed).length > 3 && (
              <div className="text-center mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary hover:bg-primary/10"
                >
                  View all ({todoList.filter((item) => !item.completed).length})
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom section - Daily Challenge */}
      <Card className="p-4 border-primary/10 hover:border-primary/30 transition-colors relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-30"></div>

        <div className="relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium flex items-center">
              <Flame className="mr-2 h-4 w-4 text-primary" />
              Daily Challenge
            </h3>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-none"
            >
              +50 XP
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <BookMarked className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Read 3 documents today</p>
                <div className="flex items-center mt-1.5">
                  <Progress
                    value={Math.min(
                      (readingHistory.filter((item) => {
                        const today = new Date().setHours(0, 0, 0, 0);
                        return (
                          new Date(item.lastReadAt).setHours(0, 0, 0, 0) ===
                          today
                        );
                      }).length /
                        3) *
                        100,
                      100
                    )}
                    className="h-1.5 w-32"
                    style={{
                      background: `${currentTheme.background}40`,
                    }}
                  />
                  <span className="ml-2 text-xs text-muted-foreground">
                    {
                      readingHistory.filter((item) => {
                        const today = new Date().setHours(0, 0, 0, 0);
                        return (
                          new Date(item.lastReadAt).setHours(0, 0, 0, 0) ===
                          today
                        );
                      }).length
                    }{" "}
                    / 3
                  </span>
                </div>
              </div>
            </div>

            <Button className="h-8 text-xs bg-primary/90 hover:bg-primary text-primary-foreground">
              Start Reading
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedOverview;
