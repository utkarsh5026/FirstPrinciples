import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCategoryStore } from "@/stores";
import { useReadingHistory, useDocumentList } from "@/hooks";
import { formatRelativeTime } from "@/utils/time";
import CardContainer from "@/components/shared/container/card-container";
import getIconForTech from "@/components/shared/icons";

type CategoryItem = {
  category: string;
  displayName: string;
  lastAccessed: number;
  daysSinceAccess: number;
  status: "fresh" | "recent" | "stale" | "overdue";
  documentsInCategory: number;
  readDocuments: number;
  completionPercentage: number;
};

export const ContentRecencyTimeline: React.FC = () => {
  const categoryBreakdown = useCategoryStore(
    (state) => state.categoryBreakdown
  );
  const { history } = useReadingHistory();
  const { fileMap } = useDocumentList();

  const recencyData = useMemo(() => {
    if (!categoryBreakdown || categoryBreakdown.length === 0) {
      return null;
    }

    const now = Date.now();

    const reviewIntervals = {
      fresh: 7 * 24 * 60 * 60 * 1000, // 7 days
      recent: 30 * 24 * 60 * 60 * 1000, // 30 days
      stale: 90 * 24 * 60 * 60 * 1000, // 90 days
    };

    const categoryAccessTimes: Record<
      string,
      {
        lastAccessed: number;
        daysSinceAccess: number;
        status: "fresh" | "recent" | "stale" | "overdue";
        documentsInCategory: number;
        readDocuments: number;
        completionPercentage: number;
      }
    > = {};

    categoryBreakdown.forEach((cat) => {
      const categoryHistory = history.filter(
        (item) => item.path.split("/")[0] === cat.category
      );

      // Find most recent access
      const lastAccessed =
        categoryHistory.length > 0
          ? Math.max(...categoryHistory.map((item) => item.lastReadAt))
          : 0;

      const daysSinceAccess =
        lastAccessed > 0
          ? Math.floor((now - lastAccessed) / (24 * 60 * 60 * 1000))
          : Infinity;

      // Determine status based on time since last access
      let status: "fresh" | "recent" | "stale" | "overdue" = "overdue";
      if (lastAccessed === 0) {
        status = "overdue";
      } else if (now - lastAccessed < reviewIntervals.fresh) {
        status = "fresh";
      } else if (now - lastAccessed < reviewIntervals.recent) {
        status = "recent";
      } else if (now - lastAccessed < reviewIntervals.stale) {
        status = "stale";
      }

      // Count documents in this category
      const documentsInCategory = Object.keys(fileMap).filter(
        (doc) => doc.split("/")[0] === cat.category
      ).length;

      // Count read documents in this category
      const uniqueReadPaths = new Set(categoryHistory.map((item) => item.path));
      const readDocuments = uniqueReadPaths.size;

      // Calculate completion percentage
      const completionPercentage =
        documentsInCategory > 0
          ? Math.round((readDocuments / documentsInCategory) * 100)
          : 0;

      categoryAccessTimes[cat.category] = {
        lastAccessed,
        daysSinceAccess,
        status,
        documentsInCategory,
        readDocuments,
        completionPercentage,
      };
    });

    // Convert to array for display
    const accessArray = Object.entries(categoryAccessTimes)
      .map(([category, data]) => ({
        category,
        displayName: category.charAt(0).toUpperCase() + category.slice(1),
        ...data,
      }))
      .sort((a, b) => {
        // Sort by status, then by days since access
        const statusOrder = { fresh: 0, recent: 1, stale: 2, overdue: 3 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return a.daysSinceAccess - b.daysSinceAccess;
      });

    // Calculate overall stats
    const totalCategories = accessArray.length;
    const freshCategories = accessArray.filter(
      (c) => c.status === "fresh"
    ).length;
    const recentCategories = accessArray.filter(
      (c) => c.status === "recent"
    ).length;
    const staleCategories = accessArray.filter(
      (c) => c.status === "stale"
    ).length;
    const overdueCategories = accessArray.filter(
      (c) => c.status === "overdue"
    ).length;

    // Filter by category if specified
    const filteredArray = accessArray;

    return {
      categories: filteredArray,
      stats: {
        totalCategories,
        freshCategories,
        recentCategories,
        staleCategories,
        overdueCategories,
      },
    };
  }, [categoryBreakdown, history, fileMap]);

  if (!recencyData) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground text-sm"
        >
          Loading recency data...
        </motion.div>
      </div>
    );
  }

  if (recencyData.categories.length === 0) {
    return (
      <motion.div
        className="h-full flex items-center justify-center flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Calendar className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
        <p className="text-sm text-muted-foreground">
          No recency data available
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Read documents across multiple categories to see recency patterns
        </p>
      </motion.div>
    );
  }

  return (
    <CardContainer
      title="Content Recency Timeline"
      description="Visualize how recently different content areas have been revisited"
      icon={Calendar}
      baseColor="primary"
      variant="default"
      insights={[
        {
          label: "Recent Content",
          value: `${recencyData.stats.freshCategories} recent, ${
            recencyData.stats.staleCategories +
            recencyData.stats.overdueCategories
          } need review`,
          icon: Calendar,
        },
      ]}
    >
      <ScrollArea className="flex-1 max-h-[200px] sm:max-h-[250px] md:max-h-[300px] lg:max-h-[350px] overflow-y-auto">
        <div className="space-y-3">
          {recencyData.categories.map((cat, index) => {
            const Icon = getIconForTech(cat.category);
            return (
              <CategoryItem
                key={cat.category}
                cat={cat}
                index={index}
                Icon={Icon}
              />
            );
          })}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <div className="mt-2 border-t border-border/30 pt-2 grid grid-cols-2 gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Fresh: &lt;7 days</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Recent: 7-30 days</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span>Stale: 30-90 days</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span>Overdue: &gt;90 days</span>
        </div>
      </div>
    </CardContainer>
  );
};

interface CategoryItemProps {
  cat: CategoryItem;
  index: number;
  Icon: React.ElementType;
}
const CategoryItem: React.FC<CategoryItemProps> = ({ cat, index, Icon }) => {
  return (
    <motion.div
      key={cat.category}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn("border border-border rounded-2xl p-3 transition-all")}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            <Icon className={cn("h-4 w-4", getStatusColor(cat.status))} />
          </div>
          <div>
            <h4 className="text-sm font-medium">{cat.displayName}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cat.lastAccessed > 0
                ? `Last accessed: ${formatRelativeTime(cat.lastAccessed)}`
                : "Never accessed"}
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            cat.status === "fresh"
              ? "text-green-500"
              : cat.status === "recent"
              ? "text-blue-500"
              : cat.status === "stale"
              ? "text-amber-500"
              : "text-red-500"
          )}
        >
          {getStatusLabel(cat.status)}
        </Badge>
      </div>

      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Completion</span>
          <span className="font-medium">{cat.completionPercentage}%</span>
        </div>
        <Progress value={cat.completionPercentage} className="h-1.5" />
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">
          {cat.readDocuments} of {cat.documentsInCategory} documents
        </Badge>

        {cat.status !== "fresh" && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              cat.status === "recent"
                ? "text-blue-500"
                : cat.status === "stale"
                ? "text-amber-500"
                : "text-red-500"
            )}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Review recommended
          </Badge>
        )}
      </div>
    </motion.div>
  );
};
const getStatusLabel = (status: string) => {
  switch (status) {
    case "fresh":
      return "Recently reviewed";
    case "recent":
      return "Review soon";
    case "stale":
      return "Review needed";
    case "overdue":
      return "Overdue for review";
    default:
      return "Unknown";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "fresh":
      return "text-green-500";
    case "recent":
      return "text-blue-500";
    case "stale":
      return "text-amber-500";
    case "overdue":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
};

export default ContentRecencyTimeline;
