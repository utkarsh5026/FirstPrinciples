import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronRight,
  BarChart,
  FolderTree,
  ArrowLeft,
  Filter,
  Loader2,
} from "lucide-react";
import { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";
import { FileMetadata, MarkdownLoader, Category } from "@/utils/MarkdownLoader";
import useMobile from "@/hooks/useMobile";

import Loading from "./Loading";
import useInsights from "./useInsights";
import Summary from "./Summary";
import Hierarchy from "./Hierarchy";
import EnhancedDistribution from "./Distribution";
import RadialBarChart from "./RadialBarChart";

interface CategoryInsightsProps {
  readingHistory: ReadingHistoryItem[];
  availableDocuments: FileMetadata[];
  onSelectDocument: (path: string, title: string) => void;
}

type ViewType = "hierarchy" | "treemap" | "distribution";

const tabs = [
  {
    value: "hierarchy",
    title: "Hierarchy",
    icon: <FolderTree className="h-3.5 w-3.5 mr-1" />,
  },
  {
    value: "treemap",
    title: "Treemap",
    icon: <BarChart className="h-3.5 w-3.5 mr-1" />,
  },
  {
    value: "distribution",
    title: "Distribution",
    icon: <Filter className="h-3.5 w-3.5 mr-1" />,
  },
];

const CategoryInsights: React.FC<CategoryInsightsProps> = ({
  readingHistory,
  availableDocuments,
  onSelectDocument,
}) => {
  const { isMobile } = useMobile();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [viewType, setViewType] = useState<ViewType>("hierarchy");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { distributionData, treeMapData, filteredData, categoryData } =
    useInsights(
      selectedCategory,
      selectedSubcategory,
      availableDocuments,
      categories,
      readingHistory
    );

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const fetchedCategories = await MarkdownLoader.getCategories();
        setCategories(fetchedCategories);
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load category data");
      } finally {
        setLoadingCategories(false);
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle breadcrumb navigation
  const handleNavigateBack = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  // Create breadcrumb trail
  const breadcrumbs = useMemo(() => {
    const crumbs = [];

    if (selectedCategory) {
      const category = categoryData.find((c) => c.id === selectedCategory);
      if (category) {
        crumbs.push({ id: category.id, name: category.name });

        if (selectedSubcategory) {
          const subcategory = category.children?.find(
            (sc) => sc.id === selectedSubcategory
          );
          if (subcategory) {
            crumbs.push({ id: subcategory.id, name: subcategory.name });
          }
        }
      }
    }

    return crumbs;
  }, [categoryData, selectedCategory, selectedSubcategory]);

  // Calculate overall statistics for the current view
  const viewStats = useMemo(() => {
    let totalDocuments = 0;
    let readDocuments = 0;
    let totalCategories = 0;

    if (filteredData.length > 0) {
      filteredData.forEach((category) => {
        totalDocuments += category.totalDocuments;
        readDocuments += category.count;
        totalCategories++;

        if (category.children) {
          totalCategories += category.children.length;
        }
      });
    } else {
      categoryData.forEach((category) => {
        totalDocuments += category.totalDocuments;
        readDocuments += category.count;
        totalCategories++;
      });
    }

    return {
      totalDocuments,
      readDocuments,
      completionPercentage:
        totalDocuments > 0 ? (readDocuments / totalDocuments) * 100 : 0,
      totalCategories,
    };
  }, [categoryData, filteredData]);

  const mostReadCount = readingHistory.reduce((max, item) => {
    return Math.max(max, item.readCount || 0);
  }, 0);

  const mostReadItem = readingHistory.find(
    (item) => (item.readCount || 0) === mostReadCount
  );

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <Card className="p-4 border-primary/10">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium flex items-center">
            <FolderTree className="h-4 w-4 mr-2 text-primary" />
            Category Deep Insights
          </h4>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center text-destructive">
            <p className="mb-2">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium flex items-center">
            <FolderTree className="h-4 w-4 mr-2 text-primary" />
            Category Deep Insights
          </h4>

          <Tabs
            value={viewType}
            onValueChange={(v) => setViewType(v as ViewType)}
            className="h-8"
          >
            <TabsList className="h-8 p-0.5">
              {tabs.map(({ value, title, icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="h-7 text-xs px-2"
                >
                  {icon}
                  <span className={isMobile ? "sr-only" : "inline"}>
                    {title}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Breadcrumb navigation */}
        {(selectedCategory || selectedSubcategory) && (
          <div className="flex items-center mt-3 text-xs">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mr-1"
              onClick={handleNavigateBack}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              className="h-6 px-2 text-xs hover:bg-secondary/30"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
              }}
            >
              Categories
            </Button>

            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground" />
                <Button
                  variant="ghost"
                  className="h-6 px-2 text-xs hover:bg-secondary/30"
                  onClick={() => {
                    setSelectedCategory(crumb.id);
                    if (index === 0) setSelectedSubcategory(null);
                  }}
                >
                  {crumb.name}
                </Button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Loading state for categories */}
      {loadingCategories ? (
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 mr-2 animate-spin text-primary" />
          <span>Loading categories...</span>
        </div>
      ) : (
        <>
          {/* Summary statistics */}
          <Summary
            totalDocuments={viewStats.totalDocuments}
            readDocuments={viewStats.readDocuments}
            completionPercentage={viewStats.completionPercentage}
            mostRead={mostReadItem?.title ?? "None"}
            mostReadCount={mostReadCount}
          />

          {/* Main content area */}
          <div className="p-4 pt-0">
            {viewType === "hierarchy" && (
              <Hierarchy
                selectedSubcategory={selectedSubcategory}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                setSelectedSubcategory={setSelectedSubcategory}
                filteredData={filteredData}
                onSelectDocument={onSelectDocument}
              />
            )}

            {viewType === "treemap" && (
              <div className="border rounded-lg p-4 relative h-[500px]">
                <div className="h-full">
                  {categoryData.length > 0 &&
                  treeMapData.children &&
                  treeMapData.children.length > 0 ? (
                    <RadialBarChart />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <BarChart className="h-10 w-10 mx-auto mb-2 opacity-25" />
                        <p>No data to visualize</p>
                        {selectedCategory && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => setSelectedCategory(null)}
                          >
                            View all categories
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewType === "distribution" && (
              <EnhancedDistribution
                selectedSubcategory={selectedSubcategory}
                selectedCategory={selectedCategory}
                distributionData={distributionData}
                onSelectDocument={onSelectDocument}
                isMobile={isMobile}
              />
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default CategoryInsights;
