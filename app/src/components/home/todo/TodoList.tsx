import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Plus,
  CheckCircle2,
  X,
  Calendar,
  ListTodo,
  Clock,
  PlusCircle,
  FileText,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/context/ThemeContext";
import type { ReadingTodoItem } from "@/hooks/useDocumentManager";
import StatCard from "./StatCard";

interface EnhancedReadingListProps {
  todoList: ReadingTodoItem[];
  toggleTodoCompletion: (id: string) => void;
  handleSelectDocument: (path: string, title: string) => void;
  removeFromTodoList: (id: string) => void;
  clearTodoList: () => void;
  setShowAddTodoModal: (show: boolean) => void;
  formatDate: (date: number) => string;
}

const TodoList: React.FC<EnhancedReadingListProps> = ({
  todoList,
  toggleTodoCompletion,
  handleSelectDocument,
  removeFromTodoList,
  clearTodoList,
  setShowAddTodoModal,
  formatDate,
}) => {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">(
    "all"
  );

  // Filter list based on active tab
  const filteredList = todoList.filter((item) => {
    if (activeTab === "pending") return !item.completed;
    if (activeTab === "completed") return item.completed;
    return true;
  });

  // Group items by category for better organization
  const categories: Record<string, ReadingTodoItem[]> = {};

  filteredList.forEach((item) => {
    const category = item.path.split("/")[0] || "Uncategorized";

    if (!categories[category]) {
      categories[category] = [];
    }

    categories[category].push(item);
  });

  // Calculate statistics
  const pendingCount = todoList.filter((item) => !item.completed).length;
  const completedCount = todoList.filter((item) => item.completed).length;
  const totalCount = todoList.length;
  const completionPercentage = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  const stats = [
    {
      icon: <BookOpen className="h-4 w-4 text-primary" />,
      label: "To Read",
      value: pendingCount,
    },
    {
      icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
      label: "Completed",
      value: completedCount,
    },
    {
      icon: <Clock className="h-4 w-4 text-primary" />,
      label: "Progress",
      value: completionPercentage,
      suffix: "%",
    },
  ];
  return (
    <div className="space-y-6">
      {/* Header section with decorative elements */}
      <div className="relative overflow-hidden border border-primary/20 bg-card p-6 rounded-4xl">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-primary/5 blur-xl"></div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(${currentTheme.primary}60 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div className="relative">
          {/* Header with icon */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ListTodo className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Reading List</h2>
                <p className="text-sm text-muted-foreground">
                  Track documents you want to read
                </p>
              </div>
            </div>

            <Button
              className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
              onClick={() => setShowAddTodoModal(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add
            </Button>
          </div>

          {/* Reading list stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {todoList.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-muted-foreground mb-1">
                Completion
              </div>
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-primary">
                      {completedCount}
                    </span>{" "}
                    of {totalCount} completed
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-secondary/20">
                  <div
                    style={{ width: `${completionPercentage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary/80 transition-all duration-500"
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "all" | "pending" | "completed")
        }
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 bg-secondary/10 p-1">
          <TabsTrigger
            value="all"
            className="rounded-md text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            All ({todoList.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-md text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            To Read ({pendingCount})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-md text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Completed ({completedCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Reading list content */}
      {todoList.length > 0 ? (
        <>
          <ScrollArea className="h-[450px] md:h-[500px] pr-4 -mr-4">
            <div className="space-y-6">
              {Object.entries(categories).length > 0 ? (
                Object.entries(categories).map(([category, items]) => (
                  <div key={category} className="space-y-3">
                    {/* Category header */}
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className="mr-2 px-2 py-0.5 border-primary/20 text-primary bg-primary/5 text-xs font-normal"
                      >
                        {category}
                      </Badge>
                      <div className="h-px flex-grow bg-border/50"></div>
                      <Badge className="ml-2 bg-primary/10 text-primary border-none">
                        {items.length}
                      </Badge>
                    </div>

                    {/* Items in this category */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <Card
                          key={item.id}
                          className={cn(
                            "relative overflow-hidden transition-all duration-200 hover:shadow-md",
                            item.completed
                              ? "bg-primary/5 border-primary/10"
                              : "hover:border-primary/20 hover:bg-secondary/5"
                          )}
                        >
                          {/* Background decorative element */}
                          <div
                            className={cn(
                              "absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10",
                              item.completed
                                ? "bg-primary/20"
                                : "bg-secondary/20"
                            )}
                          ></div>

                          <div className="p-4 relative flex items-start gap-3">
                            {/* Checkbox */}
                            <button
                              className={cn(
                                "mt-1 flex-shrink-0 h-5 w-5 rounded-full transition-colors",
                                item.completed
                                  ? "bg-primary/20 text-primary border border-primary/40 flex items-center justify-center"
                                  : "border border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                              )}
                              onClick={() => toggleTodoCompletion(item.id)}
                              aria-label={
                                item.completed
                                  ? "Mark as unread"
                                  : "Mark as read"
                              }
                            >
                              {item.completed && <Check className="h-3 w-3" />}
                            </button>

                            {/* Content */}
                            <div className="flex-grow min-w-0">
                              <button
                                className={cn(
                                  "text-left text-sm font-medium w-full transition-colors hover:text-primary",
                                  item.completed &&
                                    "line-through text-muted-foreground"
                                )}
                                onClick={() =>
                                  handleSelectDocument(item.path, item.title)
                                }
                              >
                                {item.title}
                              </button>

                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Added {formatDate(item.addedAt)}
                                </div>

                                {/* File path badge */}
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 h-4 bg-secondary/10 border-secondary/20"
                                >
                                  <FileText className="h-2.5 w-2.5 mr-1" />
                                  {item.path.split("/").slice(1).join("/")}
                                </Badge>
                              </div>
                            </div>

                            {/* Remove button */}
                            <button
                              className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                              onClick={() => removeFromTodoList(item.id)}
                              aria-label="Remove from reading list"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <p>No items match the current filter</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer with stats and actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-border pt-4">
            <div className="text-sm text-muted-foreground">
              {pendingCount} to read • {completedCount} completed
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-primary/20 text-primary bg-primary/5 hover:bg-primary/10"
                onClick={() => setShowAddTodoModal(true)}
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Add document
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-destructive hover:bg-destructive/10"
                onClick={clearTodoList}
              >
                Clear list
              </Button>
            </div>
          </div>
        </>
      ) : (
        // Empty state
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-card border border-border/40 rounded-xl text-center">
          <div className="relative h-20 w-20 mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ListTodo className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
          </div>

          <h3 className="text-lg font-medium">Your reading list is empty</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-md">
            Add documents you want to read later to keep track of your learning
            journey
          </p>

          <Button
            className="bg-primary/80 hover:bg-primary text-primary-foreground"
            onClick={() => setShowAddTodoModal(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add documents
          </Button>
        </div>
      )}
    </div>
  );
};

export default TodoList;
