import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import type { ReadingTodoItem } from "@/services/analytics/ReadingListService";
import TodoHeader from "./TodoHeader";
import EmptyList from "./EmptyList";
import TodoItem from "./TodoItem";
import { useDocumentManager } from "@/context";

interface TodoListProps {
  handleSelectDocument: (path: string, title: string) => void;
  setShowAddTodoModal: (show: boolean) => void;
}

type Tab = "all" | "pending" | "completed";

/**
 * 🎉 TodoList Component
 *
 * This delightful component manages your reading list with style and organization!
 * It displays all your to-read documents in a beautiful, categorized layout.
 *
 * ✨ Features:
 * - Filter between all, pending, and completed reading items
 * - View documents organized by categories
 * - Track your reading progress with a visual completion bar
 * - Add new documents or clear your list with easy-to-use buttons
 *
 * The component creates a joyful reading tracking experience that helps you
 * stay organized and motivated on your learning journey! 📚✨
 */
const TodoList: React.FC<TodoListProps> = ({
  handleSelectDocument,
  setShowAddTodoModal,
}) => {
  const { todoList, removeFromTodoList, toggleTodoCompletion, clearTodoList } =
    useDocumentManager();

  /**
   * 🔍 Active Tab State
   *
   * Keeps track of which filter view the user wants to see!
   * Options include "all", "pending", or "completed" items.
   */
  const [activeTab, setActiveTab] = useState<Tab>("all");

  /**
   * 📋 Categories Organization
   *
   * Magically organizes your reading items by their categories!
   * It filters the items based on the active tab and groups them
   * by their top-level directory for a clean, organized view.
   */
  const categories = useMemo(() => {
    const filteredList = todoList.filter((item) => {
      if (activeTab === "pending") return !item.completed;
      if (activeTab === "completed") return item.completed;
      return true;
    });

    const categories: Record<string, ReadingTodoItem[]> = {};

    filteredList.forEach((item) => {
      const category = item.path.split("/")[0] || "Uncategorized";
      if (!categories[category]) categories[category] = [];
      categories[category].push(item);
    });

    return categories;
  }, [todoList, activeTab]);

  /**
   * 📊 Reading Statistics
   *
   * Calculates all the fun statistics about your reading progress!
   * Tracks how many items are pending, completed, and your overall
   * completion percentage to keep you motivated! 🎯
   */
  const { pendingCount, completedCount, completionPercentage, totalCount } =
    useMemo(() => {
      const completedCount = todoList.filter((item) => item.completed).length;
      const totalCount = todoList.length;

      return {
        pendingCount: todoList.filter((item) => !item.completed).length,
        completedCount,
        totalCount,
        completionPercentage:
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      };
    }, [todoList]) as {
      pendingCount: number;
      completedCount: number;
      completionPercentage: number;
      totalCount: number;
    };

  const tabs = [
    { key: "all", label: `All (${totalCount})` },
    { key: "pending", label: `To Read (${pendingCount})` },
    { key: "completed", label: `Completed (${completedCount})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header section with decorative elements */}
      <TodoHeader
        completedCount={completedCount}
        completionPercentage={completionPercentage}
        totalCount={totalCount}
        pendingCount={pendingCount}
        todoListLength={todoList.length}
      />

      {/* Tab navigation */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as Tab)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 bg-secondary/10 p-1">
          {tabs.map(({ key, label }) => (
            <TabsTrigger
              value={key}
              className="rounded-md text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              key={key}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Reading list content */}
      {todoList.length > 0 ? (
        <>
          <ScrollArea className="h-[450px] md:h-[500px] pr-4 -mr-4">
            <div className="space-y-6">
              {Object.entries(categories).length > 0 ? (
                Object.entries(categories).map(([category, items]) => (
                  <TodoItem
                    key={category}
                    category={category}
                    items={items}
                    toggleTodoCompletion={toggleTodoCompletion}
                    handleSelectDocument={handleSelectDocument}
                    removeFromTodoList={removeFromTodoList}
                  />
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
                className="h-9 border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 rounded-2xl"
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
        <EmptyList handleAddDocumentsModal={() => setShowAddTodoModal(true)} />
      )}
    </div>
  );
};

export default TodoList;
