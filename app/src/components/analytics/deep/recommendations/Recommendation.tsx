import { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Award,
  BarChart2,
  Target,
  Calendar,
  ArrowRight,
  Lightbulb,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { fromSnakeToTitleCase } from "@/utils/string";
import getIconForTech from "@/components/icons";
import type { ReadingHistoryItem } from "@/components/home/types";
import { cn } from "@/lib/utils";
import { useReadingHistory } from "@/context/history/HistoryContext";

interface RecommendationsProps {
  readingHistory: ReadingHistoryItem[];
  radarData: {
    name: string;
    fullName: string;
    value: number;
    totalValue: number;
    percentage: number;
  }[];
  balanceScore: number;
  coverageScore: number;
  exploredCategories: number;
  totalCategories: number;
  handleSelectItem: (
    type: "category" | "subcategory" | "document",
    path?: string
  ) => void;
}

/**
 * 🌟 Enhanced Recommendations Component
 *
 * Provides personalized learning suggestions based on reading patterns,
 * with an improved UI that highlights actionable insights and learning paths.
 * Optimized for both mobile and desktop viewing experiences.
 */
const Recommendations: React.FC<RecommendationsProps> = ({
  radarData,
  balanceScore,
  coverageScore,
  exploredCategories,
  totalCategories,
  handleSelectItem,
}) => {
  const { readingHistory } = useReadingHistory();
  const [dismissedRecommendations, setDismissedRecommendations] = useState<
    string[]
  >([]);
  const [activeTab, setActiveTab] = useState("all");

  // Find the most and least read categories
  const leastReadCategories = radarData
    .filter((item) => item.percentage < 30)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);

  // Generate personalized recommendations
  const generateRecommendations = () => {
    const recommendations = [];

    // Knowledge balance recommendation
    if (balanceScore < 60) {
      recommendations.push({
        id: "balance",
        type: "balance",
        title: "Diversify Your Knowledge",
        description: `Your learning is focused in a few areas. Explore more categories to build a well-rounded knowledge base.`,
        actionText: "Explore categories",
        icon: <BarChart2 className="h-5 w-5" />,
        importance: "high",
        progress: balanceScore,
        categories: leastReadCategories.slice(0, 2).map((c) => c.name),
        action: () => {
          if (leastReadCategories.length > 0) {
            handleSelectItem("category", leastReadCategories[0].name);
          }
        },
      });
    }

    // Low coverage categories recommendation
    if (leastReadCategories.length > 0) {
      recommendations.push({
        id: "low-coverage",
        type: "explore",
        title: "Knowledge Gaps Detected",
        description: `You have limited exposure to ${leastReadCategories.length} important categories. Filling these gaps will strengthen your knowledge foundation.`,
        actionText: "Fill knowledge gaps",
        icon: <Target className="h-5 w-5" />,
        importance: "medium",
        categories: leastReadCategories.map((c) => c.name),
        action: () => handleSelectItem("category", leastReadCategories[0].name),
      });
    }

    // Category completion recommendation
    if (coverageScore < 50) {
      recommendations.push({
        id: "coverage",
        type: "explore",
        title: "Broaden Your Horizons",
        description: `You've explored ${exploredCategories} of ${totalCategories} categories (${Math.round(
          coverageScore
        )}% coverage). Discovering new areas will give you a more complete perspective.`,
        actionText: "Discover new topics",
        icon: <Lightbulb className="h-5 w-5" />,
        importance: "medium",
        progress: coverageScore,
        action: () => {
          // Find an unexplored category
          const exploredCategoryNames = radarData.map((c) => c.name);
          const unexploredCategory = radarData.find(
            (c) => !exploredCategoryNames.includes(c.name)
          );
          if (unexploredCategory) {
            handleSelectItem("category", unexploredCategory.name);
          }
        },
      });
    }

    // Mastery recommendation
    const highMasteryCategories = radarData.filter(
      (item) => item.percentage > 80
    );
    if (highMasteryCategories.length > 0) {
      recommendations.push({
        id: "mastery",
        type: "mastery",
        title: "Building Expertise",
        description: `You're becoming an expert in ${
          highMasteryCategories.length
        } ${
          highMasteryCategories.length === 1 ? "category" : "categories"
        }! Consider exploring advanced content or connecting this knowledge with related areas.`,
        actionText: "Continue mastery path",
        icon: <Award className="h-5 w-5" />,
        importance: "low",
        categories: highMasteryCategories.map((c) => c.name),
        action: () =>
          handleSelectItem("category", highMasteryCategories[0].name),
      });
    }

    // Consistency recommendation
    if (readingHistory.length > 0) {
      const lastReadDate = new Date(
        Math.max(...readingHistory.map((item) => item.lastReadAt))
      );
      const daysSinceLastRead = Math.floor(
        (Date.now() - lastReadDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastRead > 3) {
        recommendations.push({
          id: "consistency",
          type: "habit",
          title: "Build a Reading Habit",
          description: `It's been ${daysSinceLastRead} days since your last reading session. Regular reading helps with knowledge retention and continuous learning.`,
          actionText: "Resume reading",
          icon: <Calendar className="h-5 w-5" />,
          importance: "high",
          action: () => {
            // Recommend the most recently read category
            const recentReads = [...readingHistory].sort(
              (a, b) => b.lastReadAt - a.lastReadAt
            );
            if (recentReads.length > 0) {
              const category = recentReads[0].path.split("/")[0];
              handleSelectItem("category", category);
            }
          },
        });
      }
    }

    // Get started recommendation for new users
    if (readingHistory.length === 0) {
      recommendations.push({
        id: "get-started",
        type: "explore",
        title: "Begin Your Learning Journey",
        description:
          "Start reading to receive personalized recommendations based on your interests and reading patterns.",
        actionText: "Start reading",
        icon: <BookOpen className="h-5 w-5" />,
        importance: "high",
        action: () => {
          // Suggest a popular category
          if (radarData.length > 0) {
            handleSelectItem("category", radarData[0].name);
          }
        },
      });
    }

    // Filter out dismissed recommendations
    return recommendations.filter(
      (rec) => !dismissedRecommendations.includes(rec.id)
    );
  };

  const recommendations = generateRecommendations();

  // Filter recommendations based on active tab
  const filteredRecommendations =
    activeTab === "all"
      ? recommendations
      : recommendations.filter((rec) => rec.type === activeTab);

  // Dismiss a recommendation
  const dismissRecommendation = (id: string) => {
    setDismissedRecommendations((prev) => [...prev, id]);
  };

  if (readingHistory.length === 0 && recommendations.length === 0) {
    return (
      <Card className="p-6 border-primary/10">
        <div className="flex items-center mb-4">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-medium">
            Smart Learning Recommendations
          </h3>
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">
            Start reading to unlock personalized recommendations
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2 max-w-md">
            As you explore different categories and documents, we'll analyze
            your reading patterns to provide tailored suggestions for your
            learning journey.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-primary/10 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-medium">
            Smart Learning Recommendations
          </h3>
        </div>

        {/* Recommendation type filter tabs */}
        <div className="flex gap-2 text-xs">
          <Badge
            variant={activeTab === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveTab("all")}
          >
            All
          </Badge>
          <Badge
            variant={activeTab === "explore" ? "default" : "outline"}
            className="cursor-pointer hidden sm:inline-flex"
            onClick={() => setActiveTab("explore")}
          >
            Explore
          </Badge>
          <Badge
            variant={activeTab === "mastery" ? "default" : "outline"}
            className="cursor-pointer hidden sm:inline-flex"
            onClick={() => setActiveTab("mastery")}
          >
            Mastery
          </Badge>
          <Badge
            variant={activeTab === "balance" ? "default" : "outline"}
            className="cursor-pointer hidden sm:inline-flex"
            onClick={() => setActiveTab("balance")}
          >
            Balance
          </Badge>
        </div>
      </div>

      <Separator className="mb-4" />

      {filteredRecommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Award className="h-12 w-12 text-primary/30 mb-4" />
          <p className="text-muted-foreground">
            No recommendations in this category
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2 max-w-md">
            You're doing great! Continue reading and we'll provide more
            personalized recommendations.
          </p>

          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setActiveTab("all")}
          >
            View all recommendations
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={cn(
                  "p-4 relative overflow-hidden",
                  recommendation.importance === "high" &&
                    "border-primary/30 bg-primary/5",
                  recommendation.importance === "medium" &&
                    "border-secondary/40",
                  recommendation.importance === "low" && "border-muted"
                )}
              >
                {/* Dismiss button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-40 hover:opacity-100"
                  onClick={() => dismissRecommendation(recommendation.id)}
                >
                  <X className="h-3 w-3" />
                </Button>

                <div className="flex gap-3">
                  <div
                    className={cn(
                      "flex-shrink-0 rounded-lg h-10 w-10 flex items-center justify-center",
                      recommendation.importance === "high"
                        ? "bg-primary/10 text-primary"
                        : recommendation.importance === "medium"
                        ? "bg-secondary/20 text-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {recommendation.icon}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1 pr-5">
                      {recommendation.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {recommendation.description}
                    </p>

                    {/* Progress bar if applicable */}
                    {recommendation.progress !== undefined && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span
                            className={cn(
                              recommendation.progress < 30
                                ? "text-red-500"
                                : recommendation.progress < 70
                                ? "text-amber-500"
                                : "text-green-500"
                            )}
                          >
                            {Math.round(recommendation.progress)}%
                          </span>
                        </div>
                        <Progress
                          value={recommendation.progress}
                          className="h-1.5"
                        />
                      </div>
                    )}

                    {/* Category tags if applicable */}
                    {recommendation.categories &&
                      recommendation.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {recommendation.categories.map((category) => {
                            const CategoryIcon = getIconForTech(category);
                            return (
                              <Badge
                                key={category}
                                variant="secondary"
                                className="text-xs cursor-pointer"
                                onClick={() =>
                                  handleSelectItem("category", category)
                                }
                              >
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {fromSnakeToTitleCase(category)}
                              </Badge>
                            );
                          })}
                        </div>
                      )}

                    <Button
                      variant="link"
                      size="sm"
                      className={cn(
                        "p-0 h-6 text-xs",
                        recommendation.importance === "high"
                          ? "text-primary"
                          : "text-foreground"
                      )}
                      onClick={recommendation.action}
                    >
                      {recommendation.actionText}{" "}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Decorative element for high importance */}
                {recommendation.importance === "high" && (
                  <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 transform rotate-45 bg-primary/10" />
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {dismissedRecommendations.length > 0 && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setDismissedRecommendations([])}
          >
            Restore {dismissedRecommendations.length} dismissed recommendations
          </Button>
        </div>
      )}
    </Card>
  );
};

export default Recommendations;
