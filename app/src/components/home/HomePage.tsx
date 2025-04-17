import React, { useState, useEffect, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Clock, ListTodo, Plus, BarChart } from "lucide-react";
import { Category, MarkdownLoader } from "@/utils/MarkdownLoader";
import Hero from "./Hero";
import FileSelectionDialog from "@/components/todo/AddTodoModal";
import { useTabContext, TabType } from "./context/TabContext";
import { useInit, useDocumentStore } from "@/stores";
import MobileOptimizedTabs from "./MobileOptimizedTabs";
import {
  OverviewTabLoader,
  HistoryTabLoader,
  TodoListLoader,
  AnalyticsTabLoader,
} from "./TabLoaders";

const Overview = lazy(() => import("./overview/Overview"));
const History = lazy(() => import("./history/History"));
const TodoList = lazy(() => import("@/components/todo/TodoList"));
const AnalyticsView = lazy(() => import("../analytics/AnalyticsView"));

interface HomePageProps {
  onSelectFile: (filepath: string) => void;
}

/**
 * Enhanced HomePage Component
 *
 * Features:
 * - Uses Shadcn UI Tabs for better accessibility and design consistency
 * - Implements async loading for tab content to improve performance
 * - Artistic abstract SVG loaders with descriptive text for each tab
 * - Optimized for both mobile and desktop experiences
 * - Clean, uncluttered design that improves readability
 */
const HomePage: React.FC<HomePageProps> = () => {
  useInit();
  const availableDocuments = useDocumentStore(
    (state) => state.availableDocuments
  );
  const handleSelectDocument = useDocumentStore(
    (state) => state.handleSelectDocument
  );

  const [showFileDialog, setShowFileDialog] = useState(false);
  const { activeTab, setActiveTab } = useTabContext();

  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);

  // Loading categories from the MarkdownLoader
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const loadedCategories = await MarkdownLoader.getCategories();
        setCategories(loadedCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-cascadia-code pt-2 md:pt-6 pb-20 md:pb-6">
      {/* Desktop Tabs - Hidden on mobile */}
      <div className="hidden md:block mb-6">
        <div className="flex items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="bg-card/60 backdrop-blur-sm border border-border rounded-xl grid grid-cols-4 h-11">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-l-xl flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                <span>Reading History</span>
              </TabsTrigger>
              <TabsTrigger
                value="todo"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-2"
              >
                <ListTodo className="h-4 w-4" />
                <span>Reading List</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-r-xl flex items-center gap-2"
              >
                <BarChart className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Add button for desktop */}
          {activeTab === "todo" && (
            <Button
              className="h-10 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 ml-4 rounded-xl"
              onClick={() => setShowFileDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Documents
            </Button>
          )}
        </div>
      </div>

      {/* Mobile tab heading with add button - visible only on mobile */}
      <div className="md:hidden mb-4 flex items-center justify-between">
        <h2 className="text-xl font-medium flex items-center">
          {activeTab === "overview" && (
            <LayoutDashboard className="h-5 w-5 mr-2 text-primary" />
          )}
          {activeTab === "history" && (
            <Clock className="h-5 w-5 mr-2 text-primary" />
          )}
          {activeTab === "todo" && (
            <ListTodo className="h-5 w-5 mr-2 text-primary" />
          )}
          {activeTab === "analytics" && (
            <BarChart className="h-5 w-5 mr-2 text-primary" />
          )}
          {activeTab === "overview" && "Overview"}
          {activeTab === "history" && "Reading History"}
          {activeTab === "todo" && "Reading List"}
          {activeTab === "analytics" && "Analytics"}
        </h2>

        {/* Add button for mobile */}
        {activeTab === "todo" && (
          <Button
            className="h-9 w-9 p-0 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
            onClick={() => setShowFileDialog(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tab Content with Suspense for lazy loading */}
      <div className="pt-2">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="overview" className="mt-0">
            {/* Hero component is eagerly loaded for better initial experience */}
            <Hero />
            <Suspense fallback={<OverviewTabLoader />}>
              <Overview
                handleSelectDocument={handleSelectDocument}
                setShowAddTodoModal={() => setShowFileDialog(true)}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Suspense fallback={<HistoryTabLoader />}>
              <History handleSelectDocument={handleSelectDocument} />
            </Suspense>
          </TabsContent>

          <TabsContent value="todo" className="mt-0">
            <Suspense fallback={<TodoListLoader />}>
              <TodoList
                handleSelectDocument={handleSelectDocument}
                setShowAddTodoModal={() => setShowFileDialog(true)}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <Suspense fallback={<AnalyticsTabLoader />}>
              <AnalyticsView
                availableDocuments={availableDocuments}
                onSelectDocument={handleSelectDocument}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile optimized tabs at the bottom of the screen */}
      <MobileOptimizedTabs />

      {/* File Selection Dialog - uses shadcn Dialog component */}
      <FileSelectionDialog
        open={showFileDialog}
        onOpenChange={setShowFileDialog}
        availableDocuments={availableDocuments}
        categories={categories}
      />
    </div>
  );
};

export default HomePage;
