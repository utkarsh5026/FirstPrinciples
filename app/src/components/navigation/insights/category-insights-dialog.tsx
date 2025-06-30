import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Clock,
  BookMarked,
  CheckCircle2,
  Files,
  TrendingUp,
  Target,
  Zap,
  FolderTree,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fromSnakeToTitleCase } from "@/utils/string";
import getTopicIcon from "@/components/shared/icons/topic-icon";
import { Document } from "@/stores/document/document-store";

interface CategoryInsightsDialogProps {
  category: Document;
  children: React.ReactNode;
}

const CategoryInsightsDialog: React.FC<CategoryInsightsDialogProps> = ({
  category,
  children,
}) => {
  // Calculate insights
  const totalFiles = category.fileCount ?? 0;
  const readCount = category.readFiles.length;
  const todoCount = category.todoFiles.length;
  const unreadCount = Math.max(0, totalFiles - readCount);
  const completionRate =
    totalFiles > 0 ? Math.round((readCount / totalFiles) * 100) : 0;

  const CategoryIcon = () => getTopicIcon(category.path);

  const stats = [
    {
      label: "Total Files",
      value: totalFiles,
      icon: Files,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Read",
      value: readCount,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "In Reading List",
      value: todoCount,
      icon: BookMarked,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Unread",
      value: unreadCount,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  const insights = [
    {
      title: "Reading Progress",
      value: `${completionRate}%`,
      description: `${readCount} of ${totalFiles} files completed`,
      icon: TrendingUp,
      color:
        completionRate > 75
          ? "text-green-500"
          : completionRate > 50
          ? "text-blue-500"
          : "text-amber-500",
    },
    {
      title: "Status",
      value:
        todoCount > 0 ? "Active" : readCount > 0 ? "Visited" : "Unexplored",
      description:
        todoCount > 0
          ? "Has items in reading list"
          : readCount > 0
          ? "Previously accessed"
          : "Not yet explored",
      icon: Target,
      color:
        todoCount > 0
          ? "text-primary"
          : readCount > 0
          ? "text-green-500"
          : "text-muted-foreground",
    },
  ];

  const path = category.path.split("/").filter(Boolean);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] p-0 gap-0 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl font-cascadia-code">
        <DialogHeader className="p-6 pb-4 space-y-0">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-shrink-0 p-2.5 rounded-full bg-primary/10"
            >
              <CategoryIcon />
            </motion.div>
            <div className="flex-1 min-w-0  flex items-start">
              <DialogTitle className="text-base font-semibold text-foreground leading-tight">
                {fromSnakeToTitleCase(category.name)}
              </DialogTitle>
            </div>
          </div>

          {path.length > 1 && (
            <div className="mt-2 bg-background/90 rounded-2xl p-3 text-xs">
              <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
                <FolderTree size={14} className="text-primary/70" />
                <span className="font-medium">Directory Tree</span>
              </div>
              <div className="space-y-1">
                {path.map((segment, index) => (
                  <div
                    key={segment}
                    className="flex items-center gap-1.5"
                    style={{ marginLeft: `${index * 16}px` }}
                  >
                    {index < path.length - 1 ? (
                      <div className="w-[14px] h-[14px] flex items-center justify-center">
                        <ChevronRight
                          size={12}
                          className="text-muted-foreground/50"
                        />
                      </div>
                    ) : (
                      <div className="w-[14px] h-[14px] flex items-center justify-center text-primary">
                        {getTopicIcon(path.slice(0, index + 1).join("/"))}
                      </div>
                    )}
                    <span
                      className={cn(
                        "transition-colors",
                        index === path.length - 1
                          ? "font-medium text-primary"
                          : "text-muted-foreground hover:text-foreground/70"
                      )}
                    >
                      {fromSnakeToTitleCase(segment)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-120px)]">
          <div className="px-6 pb-6 space-y-6">
            {/* Quick Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border border-border/50",
                      "bg-gradient-to-br from-card to-card/50 p-4",
                      "hover:shadow-lg transition-all duration-300 group"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">
                          {stat.label}
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <div className={cn("p-2 rounded-2xl", stat.bgColor)}>
                        <stat.icon size={16} className={stat.color} />
                      </div>
                    </div>

                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <Separator className="my-6" />

            {/* Detailed Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                Insights
              </h3>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-shrink-0 p-1.5 rounded-md bg-background/80">
                      <insight.icon size={14} className={insight.color} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {insight.title}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {insight.value}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Empty State */}
            {totalFiles === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center py-8 space-y-3"
              >
                <div className="p-3 rounded-full bg-muted/50 inline-block">
                  <Files size={24} className="text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Empty Category
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This category doesn't contain any files yet.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryInsightsDialog;
