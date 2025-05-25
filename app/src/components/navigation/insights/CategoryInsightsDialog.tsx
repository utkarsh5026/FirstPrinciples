import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Info,
  BookOpen,
  BookMarked,
  Clock,
  FileText,
  Layers,
  PieChart,
} from "lucide-react";
import { Document } from "@/stores/document/document-store";
import { cn } from "@/lib/utils";
import { fromSnakeToTitleCase } from "@/utils/string";

interface CategoryInsightsDialogProps {
  category: Document;
  children?: React.ReactNode;
}

/**
 * 📊 Category Insights Dialog
 *
 * This component provides a comprehensive view of reading statistics and progress
 * for a specific category. It displays various metrics to help users understand
 * their learning journey within each topic area.
 *
 * The dialog is designed to be mobile-first while maintaining excellent desktop
 * usability. It uses visual indicators like progress bars and statistics cards
 * to make the information easily digestible at a glance.
 */
const CategoryInsightsDialog: React.FC<CategoryInsightsDialogProps> = ({
  category,
  children,
}) => {
  // Calculate derived statistics for deeper insights
  const insights = useMemo(() => {
    const { fileCount = 0, readFiles, todoFiles } = category;

    const readPercentage =
      fileCount > 0 ? Math.round((readFiles.length / fileCount) * 100) : 0;

    const todoPercentage =
      fileCount > 0 ? Math.round((todoFiles.length / fileCount) * 100) : 0;

    const untouchedFiles = fileCount - readFiles.length;
    const untouchedPercentage =
      fileCount > 0 ? Math.round((untouchedFiles / fileCount) * 100) : 0;

    return {
      readPercentage,
      todoPercentage,
      untouchedFiles,
      untouchedPercentage,
    };
  }, [category]);

  // Calculate subcategory count
  const subcategoriesCount = category.documents?.length ?? 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 rounded-full",
              "hover:bg-primary/20 hover:text-primary",
              "transition-all duration-200",
              "flex items-center justify-center",
              "touch-manipulation" // Better mobile touch handling
            )}
            onClick={(e) => e.stopPropagation()} // Prevent category expansion
          >
            <Info size={14} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-w-md w-[calc(100vw-2rem)] font-type-mono", // Mobile-friendly width
          "max-h-[85vh]", // Prevent overflow on mobile
          "p-0", // Remove default padding for custom layout
          "rounded-2xl",
          "bg-gradient-to-b from-background to-background/95"
        )}
      >
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <PieChart size={20} className="text-primary" />
            </div>
            {fromSnakeToTitleCase(category.name)} Insights
          </DialogTitle>
          <DialogDescription className="mt-2">
            Your learning progress and statistics for this category
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)] px-6 pb-6">
          <div className="flex flex-col gap-8">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">
                  {insights.readPercentage}% Complete
                </span>
              </div>
              <Progress value={insights.readPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatisticCard
                icon={<FileText size={18} />}
                iconBgColor="bg-secondary/50"
                iconColor="text-foreground"
                value={category.fileCount ?? 0}
                label="Total Files"
              />

              {subcategoriesCount > 0 && (
                <StatisticCard
                  icon={<Layers size={18} />}
                  iconBgColor="bg-blue-500/10"
                  iconColor="text-blue-500"
                  value={subcategoriesCount}
                  label="Subcategories"
                />
              )}
            </div>

            {/* Detailed Statistics */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground/80">
                Reading Statistics
              </h4>

              <StatisticItem
                icon={<BookMarked size={16} />}
                bgColor="bg-primary/10"
                iconColor="text-primary"
                valueColor="text-primary"
                label="Reading List"
                value={category.todoFiles.length}
                percentage={insights.todoPercentage}
              />

              <StatisticItem
                icon={<Clock size={16} />}
                bgColor="bg-green-200/10"
                iconColor="text-green-200"
                valueColor="text-green-200"
                label="Previously Read"
                value={category.readFiles.length}
                percentage={insights.readPercentage}
              />

              <StatisticItem
                icon={<BookOpen size={16} />}
                bgColor="bg-secondary/30"
                iconColor="text-muted-foreground"
                valueColor="text-muted-foreground"
                label="Not Yet Started"
                value={insights.untouchedFiles}
                percentage={insights.untouchedPercentage}
              />
            </div>

            {/* Progress Visualization */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-foreground/80">
                Progress Breakdown
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs">Completed</span>
                  <div className="flex-1">
                    <Progress
                      value={insights.readPercentage}
                      className="h-1.5"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {insights.readPercentage}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs">In Progress</span>
                  <div className="flex-1">
                    <Progress
                      value={insights.todoPercentage}
                      className="h-1.5"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {insights.todoPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

interface StatisticCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  value: number;
  label: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  icon,
  iconBgColor,
  iconColor,
  value,
  label,
}) => (
  <Card className="p-4 hover:shadow-md transition-shadow rounded-2xl">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${iconBgColor}`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </Card>
);

interface StatisticItemProps {
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  valueColor: string;
  label: string;
  value: number;
  percentage: number;
}

const StatisticItem: React.FC<StatisticItemProps> = ({
  icon,
  bgColor,
  iconColor,
  valueColor,
  label,
  value,
  percentage,
}) => (
  <div
    className={`flex items-center justify-between p-3 rounded-2xl ${bgColor}`}
  >
    <div className="flex items-center gap-2">
      <div className={iconColor}>{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="text-right">
      <span className={`text-sm font-semibold ${valueColor}`}>{value}</span>
      <span className="text-xs text-muted-foreground ml-1">
        ({percentage}%)
      </span>
    </div>
  </div>
);

export default CategoryInsightsDialog;
