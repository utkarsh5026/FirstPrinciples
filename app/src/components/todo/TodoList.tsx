import React, { useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CardContainer from "@/components/shared/container/CardContainer";
import { useReadingList } from "@/hooks";
import { BookOpen, Plus, BookMarked, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fromSnakeToTitleCase } from "@/utils/string";
import type { ReadingTodoItem } from "@/services/reading/reading-list-service";
import TodoHeader from "./TodoHeader";
import TodoItem from "./TodoItem";
import EmptyList from "./EmptyList";

interface ReadingTodoProps {
  handleSelectDocument: (path: string, title: string) => void;
  setShowAddTodoModal: (show: boolean) => void;
}

/**
 * Enhanced Reading To-do List with Tabs
 *
 * A beautiful, minimal interface for managing your reading queue with
 * intuitive tabbed navigation for mobile and desktop users.
 *
 * Features:
 * - Tab-based navigation for pending and completed items
 * - Mobile-optimized layout with responsive design
 * - Visual category grouping for better organization
 * - Smooth animations for a polished user experience
 * - Clean, uncluttered interface that maximizes readability
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

  useEffect(() => {
    refreshTodo();
  }, [refreshTodo]);

  const groupItemsByCategory = useCallback((items: ReadingTodoItem[]) => {
    const grouped: Record<string, ReadingTodoItem[]> = {};

    items.forEach((item) => {
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
        items: [...items].sort((a, b) => b.addedAt - a.addedAt),
      }));
  }, []);

  const groupedPendingItems = useMemo(() => {
    return groupItemsByCategory(pending);
  }, [pending, groupItemsByCategory]);

  const groupedCompletedItems = useMemo(() => {
    return groupItemsByCategory(completed);
  }, [completed, groupItemsByCategory]);

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddTodoModal(true)}
            className="rounded-full"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
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
        {todoList.length === 0 ? (
          <EmptyList
            handleAddDocumentsModal={() => setShowAddTodoModal(true)}
          />
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 rounded-full">
              <TabsTrigger
                value="pending"
                className="flex items-center gap-2 rounded-full"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">To Read</span>
                <span className="inline sm:hidden">To Read</span>
                <Badge variant="outline" className="ml-1.5 rounded-full">
                  {pending.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex items-center gap-2 rounded-full"
              >
                <CheckCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Completed</span>
                <span className="inline sm:hidden">Done</span>
                <Badge variant="outline" className="ml-1.5 rounded-full">
                  {completed.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pending.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary/20" />
                  <p className="mb-2">No pending items</p>
                  <Button
                    onClick={() => setShowAddTodoModal(true)}
                    className="mt-2 bg-primary/90 hover:bg-primary rounded-full"
                    size="sm"
                  >
                    <Plus className="mr-1.5 h-4 w-4" /> Add documents
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-380px)] md:h-[540px] pr-4 -mr-4">
                  <AnimatePresence>
                    {groupedPendingItems.map(({ category, items }) => (
                      <CategoryGroup
                        key={category}
                        category={category}
                        items={items}
                        handleSelectDocument={handleSelectDocument}
                        toggleCompletion={toggleTodo}
                        removeItem={removeFromTodo}
                      />
                    ))}
                  </AnimatePresence>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              {completed.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <BookMarked className="h-12 w-12 mx-auto mb-4 text-primary/20" />
                  <p>Nothing completed yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Items you finish will appear here
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-380px)] md:h-[540px] pr-4 -mr-4">
                  <AnimatePresence>
                    {groupedCompletedItems.map(({ category, items }) => (
                      <CategoryGroup
                        key={category}
                        category={category}
                        items={items}
                        handleSelectDocument={handleSelectDocument}
                        toggleCompletion={toggleTodo}
                        removeItem={removeFromTodo}
                      />
                    ))}
                  </AnimatePresence>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContainer>
    </div>
  );
};

// Helper component for category groups
interface CategoryGroupProps {
  category: string;
  items: ReadingTodoItem[];
  handleSelectDocument: (path: string, title: string) => void;
  toggleCompletion: (id: string) => void;
  removeItem: (id: string) => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  items,
  handleSelectDocument,
  toggleCompletion,
  removeItem,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-5"
    >
      <div className="flex items-center mb-2">
        <Badge
          variant="outline"
          className="px-2 py-0.5 text-xs bg-primary/5 border-primary/20 font-normal rounded-full"
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
              toggleCompletion={() => toggleCompletion(item.id)}
              removeItem={() => removeItem(item.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ReadingTodo;
