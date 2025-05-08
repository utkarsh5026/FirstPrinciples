import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import CardContainer from "@/components/shared/container/CardContainer";
import { useReadingList } from "@/hooks";
import { BookOpen, Plus, BookMarked, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReadingTodoItem } from "@/services/reading/reading-list-service";
import TodoHeader from "./TodoHeader";
import EmptyList from "./EmptyList";
import CategoryGroup from "./CategoryGroup";

interface ReadingTodoProps {
  handleSelectDocument: (path: string, title: string) => void;
  setShowAddTodoModal: (show: boolean) => void;
}

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

  const [expandedParents, setExpandedParents] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    refreshTodo();
  }, [refreshTodo]);

  const toggleExpandParent = (categoryParentKey: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [categoryParentKey]: !prev[categoryParentKey],
    }));
  };

  const groupedPendingItems = useMemo(() => {
    return groupItemsByHierarchy(pending);
  }, [pending]);

  const groupedCompletedItems = useMemo(() => {
    return groupItemsByHierarchy(completed);
  }, [completed]);

  useEffect(() => {
    const newExpandedStates: Record<string, boolean> = {};
    const shouldAutoExpand = todoList.length < 30;

    groupedPendingItems.forEach(({ category, parentGroups }) => {
      Object.keys(parentGroups).forEach((parent) => {
        const key = `${category}-${parent}-pending`;
        if (expandedParents[key] === undefined) {
          newExpandedStates[key] = shouldAutoExpand;
        }
      });
    });

    groupedCompletedItems.forEach(({ category, parentGroups }) => {
      Object.keys(parentGroups).forEach((parent) => {
        const key = `${category}-${parent}-completed`;
        if (expandedParents[key] === undefined) {
          newExpandedStates[key] = shouldAutoExpand;
        }
      });
    });

    if (Object.keys(newExpandedStates).length > 0) {
      setExpandedParents((prev) => ({ ...prev, ...newExpandedStates }));
    }
  }, [
    groupedPendingItems,
    groupedCompletedItems,
    todoList.length,
    expandedParents,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <TodoHeader status={status} />
      <div className="h-4"></div>

      <CardContainer
        title="Reading Queue"
        icon={BookOpen}
        description="Manage what you want to read next"
        variant="subtle"
        baseColor="indigo"
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
        insights={[
          {
            label: "Pending",
            value: pending.length.toString(),
            icon: BookOpen,
          },
          {
            label: "Completed",
            value: completed.length.toString(),
            icon: BookMarked,
            highlight: true,
          },
        ]}
        footer={
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div>
              {status.pendingCount} to read • {status.completedCount} completed
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-red-500 hover:text-red-600 cursor-pointer"
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

            {/* Pending Items Tab */}
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
                <ScrollArea className="h-[calc(100vh-380px)] md:h-[440px] pr-4 -mr-4">
                  <AnimatePresence>
                    {groupedPendingItems.map(({ category, parentGroups }) => (
                      <CategoryGroup
                        key={`${category}-pending`}
                        category={category}
                        parentGroups={parentGroups}
                        type="pending"
                        expandedParents={expandedParents}
                        toggleExpandParent={toggleExpandParent}
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
                    {groupedCompletedItems.map(({ category, parentGroups }) => (
                      <CategoryGroup
                        key={`${category}-completed`}
                        category={category}
                        parentGroups={parentGroups}
                        type="completed"
                        expandedParents={expandedParents}
                        toggleExpandParent={toggleExpandParent}
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

const getImmediateParent = (path: string): string => {
  const parts = path.split("/");

  if (parts.length <= 2) return "root";

  return parts[parts.length - 2];
};

const groupItemsByHierarchy = (items: ReadingTodoItem[]) => {
  const grouped: Record<string, Record<string, ReadingTodoItem[]>> = {};

  items.forEach((item) => {
    const category = item.path.split("/")[0] || "Uncategorized";
    const parent = getImmediateParent(item.path);

    if (!grouped[category]) {
      grouped[category] = {};
    }

    if (!grouped[category][parent]) {
      grouped[category][parent] = [];
    }

    grouped[category][parent].push(item);
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, parentGroups]) => ({
      category,
      parentGroups: Object.fromEntries(
        Object.entries(parentGroups)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([parent, items]) => [
            parent,
            [...items].sort((a, b) => b.addedAt - a.addedAt),
          ])
      ),
    }));
};

export default ReadingTodo;
