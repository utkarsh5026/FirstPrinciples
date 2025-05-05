import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CardContainer from "@/components/shared/container/CardContainer";
import { useReadingList } from "@/hooks";
import { BookOpen, Plus, BookMarked, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fromSnakeToTitleCase } from "@/utils/string";
import type { ReadingTodoItem } from "@/services/reading/reading-list-service";
import TodoHeader from "./TodoHeader";
import TodoItem from "./TodoItem";
import EmptyList from "./EmptyList";
import FilterPopover from "../utils/filter/FilterPopover";
// Filter option types
type StatusFilter = "all" | "pending" | "completed";

interface ReadingTodoProps {
  handleSelectDocument: (path: string, title: string) => void;
  setShowAddTodoModal: (show: boolean) => void;
}

/**
 * Enhanced Reading Todo List
 *
 * A beautiful, minimal interface for managing your reading queue with
 * intuitive controls and visual feedback on your progress.
 */
const ReadingTodo: React.FC<ReadingTodoProps> = ({
  handleSelectDocument,
  setShowAddTodoModal,
}) => {
  const {
    pending,
    completed,
    status,
    todoList,
    toggleTodo,
    removeFromTodo,
    clearTodo,
    refreshTodo,
  } = useReadingList();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    refreshTodo();
  }, [refreshTodo]);

  // Get unique categories
  const categories = React.useMemo(() => {
    const categorySet = new Set<string>();
    todoList.forEach((item) => {
      const category = item.path.split("/")[0] || "uncategorized";
      categorySet.add(category);
    });
    return ["all", ...Array.from(categorySet)];
  }, [todoList]);

  // Group items by category for better organization
  const groupedItems = React.useMemo(() => {
    const filteredList = todoList.filter((item) => {
      // Filter by completion status
      if (statusFilter === "pending" && item.completed) return false;
      if (statusFilter === "completed" && !item.completed) return false;

      // Filter by category
      if (categoryFilter !== "all") {
        const itemCategory = item.path.split("/")[0] || "uncategorized";
        if (itemCategory !== categoryFilter) return false;
      }

      return true;
    });

    const grouped: Record<string, ReadingTodoItem[]> = {};

    filteredList.forEach((item) => {
      const category = item.path.split("/")[0] || "Uncategorized";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => {
          // Sort by completion status first, then by added date
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          return b.addedAt - a.addedAt;
        }),
      }));
  }, [todoList, statusFilter, categoryFilter]);

  // Reset all filters
  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  // Get filter badge text
  const getFilterBadgeText = () => {
    const parts = [];

    if (statusFilter !== "all") {
      parts.push(statusFilter === "pending" ? "To Read" : "Completed");
    }

    if (categoryFilter !== "all") {
      parts.push(fromSnakeToTitleCase(categoryFilter));
    }

    if (parts.length === 0) return null;

    return parts.join(" • ");
  };

  return (
    <div className="flex flex-col gap-4">
      <TodoHeader status={status} />
      <div className="h-4"></div>

      <CardContainer
        title="Reading Queue"
        icon={BookOpen}
        description="Manage what you want to read next"
        variant="subtle"
        headerAction={
          <div className="flex items-center gap-2">
            <FilterPopover
              showCategoryFilter
              showStatusFilter
              categories={categories}
              currentCategory={categoryFilter}
              onCategoryChange={(category) => setCategoryFilter(category)}
              statusOptions={[
                {
                  id: "all",
                  label: "All",
                  count: todoList.length,
                  icon: ListFilter,
                },
                {
                  id: "pending",
                  label: "Pending",
                  count: pending.length,
                  icon: BookOpen,
                },
                {
                  id: "completed",
                  label: "Completed",
                  count: completed.length,
                  icon: BookMarked,
                },
              ]}
              currentStatus={statusFilter}
              onStatusChange={(status) =>
                setStatusFilter(status as StatusFilter)
              }
              buttonVariant="ghost"
              buttonSize="sm"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddTodoModal(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div>
              {status.pendingCount} to read • {status.completedCount} completed
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
              onClick={clearTodo}
            >
              Clear list
            </Button>
          </div>
        }
      >
        {todoList.length === 0 && (
          <EmptyList
            handleAddDocumentsModal={() => setShowAddTodoModal(true)}
          />
        )}

        {todoList.length > 0 && getFilterBadgeText() && (
          <div className="mb-4 px-3 py-2 bg-primary/5 rounded-lg flex items-center justify-between">
            <div className="flex items-center text-xs">
              <ListFilter className="h-3 w-3 mr-1.5 text-primary/70" />
              Filtering by:{" "}
              <span className="font-medium ml-1">{getFilterBadgeText()}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs hover:bg-primary/10 px-2"
              onClick={clearFilters}
            >
              Clear
            </Button>
          </div>
        )}

        {todoList.length > 0 && (
          <ScrollArea className="h-[540px] pr-4 -mr-4">
            <AnimatePresence>
              {groupedItems.length > 0 ? (
                groupedItems.map(({ category, items }) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-5"
                  >
                    <div className="flex items-center mb-2">
                      <Badge
                        variant="outline"
                        className="px-2 py-0.5 text-xs bg-primary/5 border-primary/20 font-normal"
                      >
                        {fromSnakeToTitleCase(category)}
                      </Badge>
                      <div className="h-px flex-grow bg-border/50 ml-2"></div>
                    </div>

                    <div className="space-y-3">
                      <AnimatePresence>
                        {items.map((item) => (
                          <TodoItem
                            key={item.id}
                            item={item}
                            handleSelectDocument={handleSelectDocument}
                            toggleCompletion={() => toggleTodo(item.id)}
                            removeItem={() => removeFromTodo(item.id)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookMarked className="h-10 w-10 text-primary/30 mb-3" />
                  <h3 className="text-sm font-medium mb-1">
                    No matching items
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    {statusFilter !== "all"
                      ? `No ${
                          statusFilter === "pending" ? "pending" : "completed"
                        } items found`
                      : "Try changing your filters"}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        )}
      </CardContainer>
    </div>
  );
};

export default ReadingTodo;
