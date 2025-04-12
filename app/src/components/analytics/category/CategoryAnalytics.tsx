import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Target, Calendar, FolderTree, Sparkles } from "lucide-react";
import { PiFlowArrow } from "react-icons/pi";
import { MarkdownLoader, Category } from "@/utils/MarkdownLoader";
import useMobile from "@/hooks/useMobile";

import CategoryCoverageMap from "./coverage";
import SankeyKnowledgeFlow from "./flow";
import TimeFilteredHeatCalendar from "../deep/timeline/ReadingTimeline";
import CategoryInsights from "../deep/hierarchy/CategoryInsights";
import Introduction from "./Introduction";
import Recommendations from "./recommendations";
import {
  useReadingHistory,
  useDocumentManager,
  useReadingMetrics,
} from "@/context";
import HeatMapView from "@/components/analytics/deep/timeline/HeatMapView";
import { Card } from "@/components/ui/card";

interface EnhancedCategoryAnalyticsProps {
  onSelectDocument: (path: string, title: string) => void;
}

type AnalyticsView = "overview" | "radar" | "flow" | "timeline" | "hierarchy";

const tabs = [
  {
    key: "overview",
    value: "Overview",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  {
    key: "radar",
    value: "Coverage",
    icon: <Target className="h-3.5 w-3.5" />,
  },
  {
    key: "flow",
    value: "Knowledge Flow",
    icon: <PiFlowArrow className="h-3.5 w-3.5" />,
  },
  {
    key: "timeline",
    value: "Timeline",
    icon: <Calendar className="h-3.5 w-3.5" />,
  },
  {
    key: "hierarchy",
    value: "Hierarchy",
    icon: <FolderTree className="h-3.5 w-3.5" />,
  },
];

/**
 * 📊 Category Analytics Component
 *
 * This delightful dashboard visualizes your learning journey across different knowledge categories! ✨
 *
 * It provides multiple views to help you understand your reading patterns:
 * - Overview: A comprehensive snapshot of your learning landscape
 * - Coverage Map: Shows which categories you've explored thoroughly vs. those needing attention
 * - Knowledge Flow: Visualizes how you navigate between different knowledge areas
 * - Timeline: Tracks your reading activity over time with a heat calendar
 * - Hierarchy: Breaks down your reading by category structure
 *
 * The component also calculates helpful metrics like coverage score and knowledge balance
 * to guide your learning journey! 🧠💫
 */
const CategoryAnalytics: React.FC<EnhancedCategoryAnalyticsProps> = ({
  // stats,
  onSelectDocument,
}) => {
  const { isMobile } = useMobile();
  const [activeView, setActiveView] = useState<AnalyticsView>("overview");
  const [categories, setCategories] = useState<Category[]>([]);
  const { readingHistory } = useReadingHistory();
  const { availableDocuments } = useDocumentManager();
  const { analyticsData } = useReadingMetrics();

  /*
   🌳 Fetches the category structure from your knowledge base
   */
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

  /* 
  🎯 Creates data for the radar visualization showing your category coverage
   */
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

  /*
   🔍 Handles navigation when you click on items in visualizations
   */
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

  /*
   🧮 Calculates your learning metrics to show progress and balance
   */
  const summaryStat = useMemo(() => {
    const categoriesCount = analyticsData.categoryBreakdown.length;
    const totalCategories = new Set(
      availableDocuments.map((doc) => doc.path.split("/")[0])
    ).size;
    const exploredCategories = categoriesCount;
    const readDocuments = readingHistory.length;
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
    readingHistory,
    radarData,
    analyticsData.categoryBreakdown.length,
  ]);

  return (
    <div className="space-y-6">
      <Introduction summaryStat={summaryStat} />

      {/* Visualization tabs */}
      <Tabs
        value={activeView}
        onValueChange={(v) => setActiveView(v as AnalyticsView)}
        className="w-full"
      >
        <TabsList className="w-full justify-start mb-6 overflow-x-auto p-1">
          {tabs.map(({ key, value, icon }) => {
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-1 text-xs px-3 py-2"
              >
                {icon}
                <span className={isMobile ? "hidden" : "inline"}>{value}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <CategoryCoverageMap
                data={radarData}
                title="Category Coverage Map"
              />

              <Card className="rounded-2xl p-8">
                <HeatMapView
                  filteredHistory={readingHistory}
                  usePrevNextButtons={false}
                />
              </Card>
            </div>

            {/* Knowledge Flow */}
            <SankeyKnowledgeFlow
              readingHistory={readingHistory}
              categories={categories}
            />
          </div>
        </TabsContent>

        <TabsContent value="radar">
          <CategoryCoverageMap data={radarData} title="Category Coverage Map" />
        </TabsContent>

        <TabsContent value="flow">
          <SankeyKnowledgeFlow
            readingHistory={readingHistory}
            categories={categories}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <TimeFilteredHeatCalendar
            onSelectCategory={(categoryId) =>
              handleSelectItem("category", categoryId)
            }
            onSelectDocument={onSelectDocument}
          />
        </TabsContent>

        <TabsContent value="hierarchy">
          <CategoryInsights
            readingHistory={readingHistory}
            availableDocuments={availableDocuments}
            onSelectDocument={onSelectDocument}
          />
        </TabsContent>
      </Tabs>

      <Recommendations
        radarData={radarData}
        handleSelectItem={handleSelectItem}
        readingHistory={readingHistory}
        balanceScore={summaryStat.balanceScore}
        coverageScore={summaryStat.coverageScore}
        exploredCategories={summaryStat.exploredCategories}
        totalCategories={summaryStat.totalCategories}
      />
    </div>
  );
};

export default CategoryAnalytics;
