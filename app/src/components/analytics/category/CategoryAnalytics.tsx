import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  Target,
  Calendar,
  FolderTree,
  Sparkles,
} from "lucide-react";
import { PiFlowArrow } from "react-icons/pi";
import { ReadingHistoryItem } from "@/hooks/useDocumentManager";
import { FileMetadata, MarkdownLoader, Category } from "@/utils/MarkdownLoader";
import { ReadingStats } from "@/utils/ReadingAnalyticsService";
import useMobile from "@/hooks/useMobile";

import RadarCategoryChart from "./RadarCategoryChart";
import SankeyKnowledgeFlow from "./SankeyKnwoledgeFlow";
import TimeFilteredHeatCalendar from "./TimeFilteredHeatCalender";
import CategoryInsights from "./CategoryInsights"; // The original component we built

interface EnhancedCategoryAnalyticsProps {
  readingHistory: ReadingHistoryItem[];
  availableDocuments: FileMetadata[];
  stats: ReadingStats;
  onSelectDocument: (path: string, title: string) => void;
}

type AnalyticsView = "overview" | "radar" | "flow" | "timeline" | "hierarchy";

const EnhancedCategoryAnalytics: React.FC<EnhancedCategoryAnalyticsProps> = ({
  readingHistory,
  availableDocuments,
  stats,
  onSelectDocument,
}) => {
  const { isMobile } = useMobile();
  const [activeView, setActiveView] = useState<AnalyticsView>("overview");
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await MarkdownLoader.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Prepare data for the radar chart
  const radarData = useMemo(() => {
    const categoryMap = new Map<string, { read: number; total: number }>();

    // Count documents by category
    availableDocuments.forEach((doc) => {
      const category = doc.path.split("/")[0];
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { read: 0, total: 0 });
      }
      const current = categoryMap.get(category)!;
      categoryMap.set(category, { ...current, total: current.total + 1 });
    });

    // Count read documents by category
    readingHistory.forEach((item) => {
      const category = item.path.split("/")[0];
      if (categoryMap.has(category)) {
        const current = categoryMap.get(category)!;
        // Avoid double-counting documents read multiple times
        const uniqueReads = new Set(
          readingHistory
            .filter((h) => h.path.startsWith(category))
            .map((h) => h.path)
        ).size;
        categoryMap.set(category, { ...current, read: uniqueReads });
      }
    });

    // Convert to array format for the radar chart
    return Array.from(categoryMap.entries())
      .map(([name, { read, total }]) => ({
        name,
        fullName: name,
        value: read,
        totalValue: total,
        percentage: total > 0 ? (read / total) * 100 : 0,
      }))
      .filter((item) => item.totalValue > 0) // Only include categories with documents
      .sort((a, b) => b.percentage - a.percentage);
  }, [availableDocuments, readingHistory]);

  // Handle item selection in visualizations
  const handleSelectItem = (
    type: "category" | "subcategory" | "document",
    path?: string
  ) => {
    if (type === "document" && path) {
      const document = availableDocuments.find((doc) => doc.path === path);
      if (document) {
        onSelectDocument(path, document.title);
      }
    }
  };

  // Calculate summary stats for display
  const summaryStat = useMemo(() => {
    const totalCategories = new Set(
      availableDocuments.map((doc) => doc.path.split("/")[0])
    ).size;
    const exploredCategories = stats.categoriesExplored.size;
    const readDocuments = stats.documentsCompleted;
    const coverageScore = Math.round(
      (exploredCategories / Math.max(totalCategories, 1)) * 100
    );

    // Calculate knowledge balance - standard deviation of coverage percentages
    const coverages = radarData.map((item) => item.percentage);
    const average =
      coverages.reduce((sum, val) => sum + val, 0) /
      Math.max(coverages.length, 1);
    const variance =
      coverages.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
      Math.max(coverages.length, 1);
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = more balanced
    const balanceScore = Math.max(0, 100 - standardDeviation);

    return {
      totalCategories,
      exploredCategories,
      readDocuments,
      coverageScore,
      balanceScore: Math.round(balanceScore),
    };
  }, [
    availableDocuments,
    stats.categoriesExplored,
    stats.documentsCompleted,
    radarData,
  ]);

  console.log("Deepak", radarData);

  return (
    <div className="space-y-6">
      {/* Introduction card */}
      <Card className="p-4 border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-xl">
            <BrainCircuit className="h-8 w-8 text-primary" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-medium">
              Enhanced Knowledge Analytics
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Advanced visualizations that reveal connections between categories
              and documents, showing how your knowledge flows and grows over
              time.
            </p>

            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-card p-2 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground">
                  Categories Explored
                </div>
                <div className="text-xl font-bold mt-1">
                  {summaryStat.exploredCategories}/{summaryStat.totalCategories}
                </div>
              </div>
              <div className="bg-card p-2 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground">
                  Coverage Score
                </div>
                <div className="text-xl font-bold mt-1">
                  {summaryStat.coverageScore}%
                </div>
              </div>
              <div className="bg-card p-2 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground">
                  Balance Score
                </div>
                <div className="text-xl font-bold mt-1">
                  {summaryStat.balanceScore}/100
                </div>
              </div>
              <div
                className={`bg-card p-2 rounded-lg border border-border ${
                  isMobile ? "hidden md:block" : ""
                }`}
              >
                <div className="text-xs text-muted-foreground">
                  Documents Read
                </div>
                <div className="text-xl font-bold mt-1">
                  {summaryStat.readDocuments}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Visualization tabs */}
      <Tabs
        value={activeView}
        onValueChange={(v) => setActiveView(v as AnalyticsView)}
        className="w-full"
      >
        <TabsList className="w-full justify-start mb-6 overflow-x-auto p-1">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-1 text-xs px-3 py-2"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className={isMobile ? "hidden" : "inline"}>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="radar"
            className="flex items-center gap-1 text-xs px-3 py-2"
          >
            <Target className="h-3.5 w-3.5" />
            <span className={isMobile ? "hidden" : "inline"}>Coverage</span>
          </TabsTrigger>
          <TabsTrigger
            value="flow"
            className="flex items-center gap-1 text-xs px-3 py-2"
          >
            <PiFlowArrow className="h-3.5 w-3.5" />
            <span className={isMobile ? "hidden" : "inline"}>
              Knowledge Flow
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="flex items-center gap-1 text-xs px-3 py-2"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span className={isMobile ? "hidden" : "inline"}>Timeline</span>
          </TabsTrigger>
          <TabsTrigger
            value="hierarchy"
            className="flex items-center gap-1 text-xs px-3 py-2"
          >
            <FolderTree className="h-3.5 w-3.5" />
            <span className={isMobile ? "hidden" : "inline"}>Hierarchy</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview View - Shows multiple visualizations */}
        {activeView === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <RadarCategoryChart
                data={radarData}
                title="Category Coverage Map"
              />

              {/* Timeline */}
              <TimeFilteredHeatCalendar
                readingHistory={readingHistory}
                availableDocuments={availableDocuments}
                onSelectCategory={(categoryId) =>
                  handleSelectItem("category", categoryId)
                }
                onSelectDocument={onSelectDocument}
              />
            </div>

            {/* Knowledge Flow */}
            <SankeyKnowledgeFlow
              readingHistory={readingHistory}
              categories={categories}
            />
          </div>
        )}

        {/* Radar Chart View */}
        {activeView === "radar" && (
          <RadarCategoryChart data={radarData} title="Category Coverage Map" />
        )}

        {/* Knowledge Flow View */}
        {activeView === "flow" && (
          <SankeyKnowledgeFlow
            readingHistory={readingHistory}
            categories={categories}
          />
        )}

        {/* Timeline View */}
        {activeView === "timeline" && (
          <TimeFilteredHeatCalendar
            readingHistory={readingHistory}
            availableDocuments={availableDocuments}
            onSelectCategory={(categoryId) =>
              handleSelectItem("category", categoryId)
            }
            onSelectDocument={onSelectDocument}
          />
        )}

        {/* Hierarchy View */}
        {activeView === "hierarchy" && (
          <CategoryInsights
            readingHistory={readingHistory}
            availableDocuments={availableDocuments}
            onSelectDocument={onSelectDocument}
          />
        )}
      </Tabs>

      {/* Learning recommendations based on insights */}
      <Card className="p-4 border-primary/10">
        <div className="flex items-center mb-3">
          <Sparkles className="h-4 w-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium">
            Smart Learning Recommendations
          </h4>
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
                {summaryStat.balanceScore < 50 && (
                  <div className="flex items-start gap-2 p-2 rounded-md bg-secondary/10">
                    <div className="p-1 bg-primary/10 rounded-full mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <p>
                      Your knowledge is concentrated in a few areas. Try
                      exploring more categories to improve your balance score.
                    </p>
                  </div>
                )}

                {radarData.filter((item) => item.percentage < 30).length >
                  0 && (
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
                          .map((item) => (
                            <li key={item.name} className="mt-1">
                              <Button
                                variant="link"
                                className="h-auto p-0 text-primary text-xs"
                                onClick={() =>
                                  handleSelectItem("category", item.name)
                                }
                              >
                                {item.name}
                              </Button>
                              <span className="text-muted-foreground ml-1">
                                ({Math.round(item.percentage)}% complete)
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}

                {summaryStat.coverageScore < 50 && (
                  <div className="flex items-start gap-2 p-2 rounded-md bg-secondary/10">
                    <div className="p-1 bg-primary/10 rounded-full mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <p>
                      You've explored {summaryStat.exploredCategories} out of{" "}
                      {summaryStat.totalCategories} categories. Discovering new
                      areas will improve your coverage score.
                    </p>
                  </div>
                )}

                {radarData.filter((item) => item.percentage > 80).length >
                  0 && (
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
    </div>
  );
};

export default EnhancedCategoryAnalytics;
