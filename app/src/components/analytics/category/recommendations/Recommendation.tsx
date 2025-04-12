import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ReadingHistoryItem } from "@/components/home/types";
import { Button } from "@/components/ui/button";
import { useReadingHistory } from "@/context/history/HistoryContext";
import { fromSnakeToTitleCase } from "@/utils/string";
import getIconForTech from "@/components/icons";

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
 * 🎉 Recommendations Component
 *
 * This component serves up personalized learning recommendations based on your reading habits!
 * It analyzes your reading history and provides insights to help you explore new categories and
 * improve your knowledge balance. 🌟
 *
 * If you're just starting out, it encourages you to dive into reading to unlock tailored suggestions.
 * For those with established reading patterns, it highlights areas where you might want to expand your
 * knowledge or where you're excelling! 📚✨
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
  return (
    <Card className="p-4 border-primary/10">
      <div className="flex items-center mb-3">
        <Sparkles className="h-4 w-4 mr-2 text-primary" />
        <h4 className="text-sm font-medium">Smart Learning Recommendations</h4>
      </div>

      <div className="text-sm">
        <p className="text-muted-foreground">
          Based on your learning patterns, here are personalized
          recommendations:
        </p>

        <div className="mt-3 space-y-2">
          {readingHistory.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Start reading to get personalized recommendations
              </p>
            </div>
          ) : (
            <>
              {/* Dynamic recommendations based on analytics insights */}
              {balanceScore < 50 && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-secondary/10">
                  <div className="p-1 bg-primary/10 rounded-full mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <p>
                    Your knowledge is concentrated in a few areas. Try exploring
                    more categories to improve your balance score.
                  </p>
                </div>
              )}

              {radarData.filter((item) => item.percentage < 30).length > 0 && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-secondary/10">
                  <div className="p-1 bg-primary/10 rounded-full mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <p>Low coverage detected in these categories:</p>
                    <ul className="mt-1 ml-4 text-xs list-disc">
                      {radarData
                        .filter((item) => item.percentage < 30)
                        .slice(0, 3)
                        .map((item) => {
                          const CategoryIcon = getIconForTech(item.name);
                          return (
                            <li key={item.name} className="mt-1 list-none">
                              <Button
                                variant="link"
                                className="h-auto p-0 text-primary text-xs"
                                onClick={() =>
                                  handleSelectItem("category", item.name)
                                }
                              >
                                <CategoryIcon className="h-2 w-2 mr-2" />
                                {fromSnakeToTitleCase(item.name)} (
                                {Math.round(item.percentage)}% complete)
                              </Button>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              )}

              {coverageScore < 50 && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-secondary/10">
                  <div className="p-1 bg-primary/10 rounded-full mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <p>
                    You've explored {exploredCategories} out of{" "}
                    {totalCategories} categories. Discovering new areas will
                    improve your coverage score.
                  </p>
                </div>
              )}

              {radarData.filter((item) => item.percentage > 80).length > 0 && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-secondary/10">
                  <div className="p-1 bg-primary/10 rounded-full mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <p>
                    You're making excellent progress in{" "}
                    {radarData.filter((item) => item.percentage > 80).length}{" "}
                    categories! Consider connecting this knowledge with other
                    areas.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Recommendations;
