import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  BookOpen,
  BarChart,
  FolderTree,
  Clock,
  BookOpenCheck,
  ArrowLeft,
  Filter,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReadingHistoryItem } from "@/hooks/useDocumentManager";
import { FileMetadata, MarkdownLoader, Category } from "@/utils/MarkdownLoader";
import useMobile from "@/hooks/useMobile";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Treemap,
} from "recharts";
import { COLORS } from "../../utils";
import Loading from "./Loading";

interface CategoryInsightsProps {
  readingHistory: ReadingHistoryItem[];
  availableDocuments: FileMetadata[];
  onSelectDocument: (path: string, title: string) => void;
}

// Processing categories and files to create a hierarchical structure with analytics
interface CategoryNode {
  id: string;
  name: string;
  count: number;
  totalDocuments: number;
  percentage: number;
  icon?: string;
  children?: CategoryNode[];
  documents?: {
    path: string;
    title: string;
    count: number;
    lastRead?: number;
  }[];
}

// Analytics view type
type ViewType = "hierarchy" | "treemap" | "distribution";

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

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await MarkdownLoader.getCategories();
        setCategories(fetchedCategories);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Process reading history to get counts by document path
  const documentCounts = useMemo(() => {
    const counts: Record<string, { count: number; lastRead?: number }> = {};

    readingHistory.forEach((item) => {
      if (!counts[item.path]) {
        counts[item.path] = { count: 0 };
      }
      counts[item.path].count += 1;

      // Track most recent read timestamp
      if (
        !counts[item.path].lastRead ||
        item.lastReadAt > (counts[item.path].lastRead || 0)
      ) {
        counts[item.path].lastRead = item.lastReadAt;
      }
    });

    return counts;
  }, [readingHistory]);

  // Build hierarchical data structure with read counts
  const categoryData = useMemo(() => {
    if (categories.length === 0 || availableDocuments.length === 0) {
      return [];
    }

    // Process categories to build hierarchical structure
    const processCategory = (category: Category): CategoryNode => {
      let totalDocs = 0;
      let readDocs = 0;
      const documents: CategoryNode["documents"] = [];

      // Process files directly in this category
      if (category.files) {
        category.files.forEach((file) => {
          totalDocs++;
          const readCount = documentCounts[file.path]?.count || 0;
          if (readCount > 0) readDocs++;

          documents.push({
            path: file.path,
            title: file.title,
            count: readCount,
            lastRead: documentCounts[file.path]?.lastRead,
          });
        });
      }

      // Process subcategories
      const children: CategoryNode[] = [];
      if (category.subcategories) {
        category.subcategories.forEach((subcategory) => {
          const subcategoryNode = processCategory(subcategory);
          children.push(subcategoryNode);
          totalDocs += subcategoryNode.totalDocuments;
          readDocs += subcategoryNode.count;
        });
      }

      return {
        id: category.id,
        name: category.name,
        count: readDocs,
        totalDocuments: totalDocs,
        percentage: totalDocs > 0 ? (readDocs / totalDocs) * 100 : 0,
        icon: category.icon,
        children: children.length > 0 ? children : undefined,
        documents: documents.length > 0 ? documents : undefined,
      };
    };

    return categories.map(processCategory);
  }, [categories, availableDocuments, documentCounts]);

  // Filter data based on selected category
  const filteredData = useMemo(() => {
    if (!selectedCategory) {
      return categoryData;
    }

    const category = categoryData.find((c) => c.id === selectedCategory);
    if (!category) return [];

    if (!selectedSubcategory) {
      return [category];
    }

    const subcategory = category.children?.find(
      (sc) => sc.id === selectedSubcategory
    );
    return subcategory ? [subcategory] : [];
  }, [categoryData, selectedCategory, selectedSubcategory]);

  // Data for TreeMap visualization
  const treeMapData = useMemo(() => {
    // If we're looking at a specific category or subcategory, use that data
    const sourceData = filteredData.length > 0 ? filteredData : categoryData;

    const mapData = sourceData.map((category) => ({
      name: category.name,
      size: category.count,
      value: category.count,
      children: category.children?.map((subcategory) => ({
        name: subcategory.name,
        size: subcategory.count,
        value: subcategory.count,
      })),
    }));

    return { name: "Categories", children: mapData };
  }, [categoryData, filteredData]);

  // Data for distribution chart
  const distributionData = useMemo(() => {
    // If looking at a specific category/subcategory, get document distribution
    if (selectedCategory) {
      const category = categoryData.find((c) => c.id === selectedCategory);
      if (!category) return [];

      if (selectedSubcategory) {
        const subcategory = category.children?.find(
          (sc) => sc.id === selectedSubcategory
        );
        return (
          subcategory?.documents
            ?.map((doc) => ({
              name:
                doc.title.length > 15
                  ? doc.title.substring(0, 15) + "..."
                  : doc.title,
              fullName: doc.title,
              count: doc.count,
              path: doc.path,
            }))
            .sort((a, b) => b.count - a.count) || []
        );
      }

      // Show subcategories distribution
      return (
        category.children
          ?.map((subcategory) => ({
            name: subcategory.name,
            count: subcategory.count,
            totalDocuments: subcategory.totalDocuments,
            percentage: subcategory.percentage,
          }))
          .sort((a, b) => b.count - a.count) || []
      );
    }

    // Default: show main categories distribution
    return categoryData
      .map((category) => ({
        name: category.name,
        count: category.count,
        totalDocuments: category.totalDocuments,
        percentage: category.percentage,
      }))
      .sort((a, b) => b.count - a.count);
  }, [categoryData, selectedCategory, selectedSubcategory]);

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

  // Show loading state
  if (isLoading) {
    return <Loading />;
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
              <TabsTrigger value="hierarchy" className="h-7 text-xs px-2">
                <FolderTree className="h-3.5 w-3.5 mr-1.5" />
                <span className={isMobile ? "" : "inline"}>Hierarchy</span>
              </TabsTrigger>
              <TabsTrigger value="treemap" className="h-7 text-xs px-2">
                <BarChart className="h-3.5 w-3.5 mr-1.5" />
                <span className={isMobile ? "" : "inline"}>Treemap</span>
              </TabsTrigger>
              <TabsTrigger value="distribution" className="h-7 text-xs px-2">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <span className={isMobile ? "" : "inline"}>Distribution</span>
              </TabsTrigger>
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

      {/* Summary statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
        <div className="bg-secondary/10 rounded-lg p-3 flex flex-col justify-between">
          <div className="text-xs text-muted-foreground flex items-center">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Documents
          </div>
          <div className="text-xl font-bold mt-1">
            {viewStats.totalDocuments}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total available
          </div>
        </div>

        <div className="bg-secondary/10 rounded-lg p-3 flex flex-col justify-between">
          <div className="text-xs text-muted-foreground flex items-center">
            <BookOpenCheck className="h-3.5 w-3.5 mr-1.5" />
            Read
          </div>
          <div className="text-xl font-bold mt-1">
            {viewStats.readDocuments}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Documents completed
          </div>
        </div>

        <div className="bg-secondary/10 rounded-lg p-3 flex flex-col justify-between">
          <div className="text-xs text-muted-foreground flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Completion
          </div>
          <div className="text-xl font-bold mt-1">
            {Math.round(viewStats.completionPercentage)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            <Progress
              value={viewStats.completionPercentage}
              className="h-1 mt-1"
            />
          </div>
        </div>

        <div className="bg-secondary/10 rounded-lg p-3 flex flex-col justify-between">
          <div className="text-xs text-muted-foreground flex items-center">
            <BookMarked className="h-3.5 w-3.5 mr-1.5" />
            Most Read
          </div>
          <div className="text-lg font-bold mt-1 truncate">
            {distributionData.length > 0
              ? "fullName" in distributionData[0]
                ? distributionData[0].fullName
                : distributionData[0].name
              : "None"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {distributionData.length > 0
              ? `${distributionData[0].count} reads`
              : "No data"}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="p-4 pt-0">
        {viewType === "hierarchy" && (
          <div
            className={cn(
              "border rounded-lg p-2 overflow-hidden",
              selectedSubcategory ? "h-[400px]" : "h-[500px]"
            )}
          >
            <ScrollArea className="h-full pr-4">
              {filteredData.length > 0 ? (
                filteredData.map((category) => (
                  <div key={category.id} className="mb-4">
                    {/* Category header */}
                    <div
                      className="flex items-center py-2 px-3 rounded-md hover:bg-secondary/10 cursor-pointer transition-colors"
                      onClick={() => {
                        if (!selectedCategory) {
                          setSelectedCategory(category.id);
                        } else if (!selectedSubcategory && category.children) {
                          // Already selected, do nothing or collapse
                        }
                      }}
                    >
                      <div className="flex-1 flex items-center">
                        <FolderTree className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {category.count}/{category.totalDocuments}
                      </Badge>
                      <div className="ml-3 w-16">
                        <Progress
                          value={category.percentage}
                          className="h-1.5"
                        />
                      </div>
                    </div>

                    {/* Subcategories */}
                    {category.children && (
                      <div className="ml-6 mt-1 space-y-1 border-l border-border/40 pl-3">
                        {category.children.map((subcategory) => (
                          <div key={subcategory.id}>
                            <div
                              className="flex items-center py-1.5 px-2 rounded-md hover:bg-secondary/10 cursor-pointer transition-colors"
                              onClick={() => {
                                setSelectedCategory(category.id);
                                setSelectedSubcategory(subcategory.id);
                              }}
                            >
                              <div className="flex-1 flex items-center">
                                <FolderTree className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                <span className="text-sm">
                                  {subcategory.name}
                                </span>
                              </div>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {subcategory.count}/{subcategory.totalDocuments}
                              </Badge>
                              <div className="ml-3 w-12">
                                <Progress
                                  value={subcategory.percentage}
                                  className="h-1"
                                />
                              </div>
                            </div>

                            {/* Documents within subcategory */}
                            {selectedSubcategory === subcategory.id &&
                              subcategory.documents && (
                                <div className="ml-4 mt-1 space-y-1 border-l border-border/30 pl-3">
                                  {subcategory.documents.map((doc) => (
                                    <div
                                      key={doc.path}
                                      className={cn(
                                        "flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors",
                                        doc.count > 0
                                          ? "hover:bg-primary/10"
                                          : "hover:bg-secondary/10",
                                        doc.count > 0
                                          ? "text-primary"
                                          : "text-muted-foreground"
                                      )}
                                      onClick={() =>
                                        onSelectDocument(doc.path, doc.title)
                                      }
                                    >
                                      <BookOpen className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                      <span className="text-xs truncate flex-1">
                                        {doc.title}
                                      </span>
                                      <Badge
                                        variant={
                                          doc.count > 0 ? "default" : "outline"
                                        }
                                        className={cn(
                                          "ml-2 text-xs h-5",
                                          doc.count > 0
                                            ? "bg-primary/20 hover:bg-primary/30"
                                            : "text-muted-foreground"
                                        )}
                                      >
                                        {doc.count > 0
                                          ? `${doc.count}×`
                                          : "Unread"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Documents directly in category */}
                    {selectedCategory === category.id &&
                      !selectedSubcategory &&
                      category.documents && (
                        <div className="ml-6 mt-1 space-y-1 border-l border-border/40 pl-3">
                          {category.documents.map((doc) => (
                            <div
                              key={doc.path}
                              className={cn(
                                "flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors",
                                doc.count > 0
                                  ? "hover:bg-primary/10"
                                  : "hover:bg-secondary/10",
                                doc.count > 0
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                              onClick={() =>
                                onSelectDocument(doc.path, doc.title)
                              }
                            >
                              <BookOpen className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="text-sm truncate flex-1">
                                {doc.title}
                              </span>
                              <Badge
                                variant={doc.count > 0 ? "default" : "outline"}
                                className={cn(
                                  "ml-2 text-xs",
                                  doc.count > 0
                                    ? "bg-primary/20 hover:bg-primary/30"
                                    : "text-muted-foreground"
                                )}
                              >
                                {doc.count > 0 ? `${doc.count}×` : "Unread"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderTree className="h-10 w-10 mx-auto mb-2 opacity-25" />
                  <p>No categories found</p>
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {viewType === "treemap" && (
          <div className="border rounded-lg p-4 h-[500px]">
            <div className="h-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treeMapData.children}
                    dataKey="value"
                    nameKey="name"
                    stroke="#444"
                    fill="#8884d8"
                  >
                    <RechartsTooltip
                      formatter={(value: number, name: string) => [
                        `${value} documents read`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: "rgba(22, 22, 22, 0.9)",
                        border: "1px solid #333",
                        borderRadius: "4px",
                      }}
                    />
                  </Treemap>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart className="h-10 w-10 mx-auto mb-2 opacity-25" />
                    <p>No data to visualize</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {viewType === "distribution" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bar chart distribution */}
            <div className="border rounded-lg p-4 h-[500px]">
              <h5 className="text-xs uppercase text-muted-foreground font-medium mb-3">
                {selectedSubcategory
                  ? "Document Distribution"
                  : selectedCategory
                  ? "Subcategory Distribution"
                  : "Category Distribution"}
              </h5>

              {distributionData.length > 0 ? (
                <div className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={distributionData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fontSize: 11 }}
                      />
                      <RechartsTooltip
                        formatter={(
                          value: number,
                          _name: string,
                          props: {
                            payload?: {
                              name: string;
                              value: number;
                              full?: string;
                              totalDocuments?: number;
                            };
                          }
                        ) => {
                          const item = props.payload;
                          return item?.full
                            ? [`${value} reads`, item.full]
                            : [
                                `${value} documents read`,
                                item?.name || "Unknown",
                              ];
                        }}
                        contentStyle={{
                          backgroundColor: "rgba(22, 22, 22, 0.9)",
                          border: "1px solid #333",
                          borderRadius: "4px",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--primary)"
                        onClick={(data) => {
                          if (data.path) {
                            onSelectDocument(
                              data.path,
                              data.fullName || data.name
                            );
                          }
                        }}
                        cursor={selectedSubcategory ? "pointer" : "default"}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart className="h-10 w-10 mx-auto mb-2 opacity-25" />
                    <p>No data to visualize</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pie chart distribution */}
            <div className="border rounded-lg p-4 h-[500px]">
              <h5 className="text-xs uppercase text-muted-foreground font-medium mb-3">
                Reading Completion
              </h5>

              {distributionData.length > 0 ? (
                <div className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData.map((item) => ({
                          name: item.name,
                          value: item.count,
                          full: "fullName" in item ? item.fullName : undefined,
                          path: "path" in item ? item.path : undefined,
                          totalDocuments:
                            "totalDocuments" in item
                              ? item.totalDocuments
                              : undefined,
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={{ stroke: "var(--primary)", strokeWidth: 1 }}
                      >
                        {distributionData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="rgba(0, 0, 0, 0.1)"
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(
                          value: number,
                          _name: string,
                          props: {
                            payload?: {
                              name: string;
                              value: number;
                              full?: string;
                              totalDocuments?: number;
                            };
                          }
                        ) => {
                          const item = props.payload;
                          return [
                            `${value} reads${
                              item?.totalDocuments
                                ? ` (${Math.round(
                                    (value / item.totalDocuments) * 100
                                  )}%)`
                                : ""
                            }`,
                            item?.full ?? item?.name ?? "Unknown",
                          ];
                        }}
                        contentStyle={{
                          backgroundColor: "rgba(22, 22, 22, 0.9)",
                          border: "1px solid #333",
                          borderRadius: "4px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Filter className="h-10 w-10 mx-auto mb-2 opacity-25" />
                    <p>No data to visualize</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CategoryInsights;
