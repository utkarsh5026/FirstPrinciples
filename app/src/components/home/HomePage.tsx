import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Clock,
  ListTodo,
  Plus,
  BarChart,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentManager } from "@/hooks/reading/useDocumentManager";
import { Category, FileMetadata, MarkdownLoader } from "@/utils/MarkdownLoader";
import Hero from "./Hero";
import History from "./history/History";
import TodoList from "./todo/TodoList";
import Overview from "./overview/Overview";
import MobileOptimizedTabs from "./MobileOptimizedTabs";
import FileSelectionDialog from "./todo/AddTodoModal";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import AnalyticsPage from "../analytics/AnalyticsPage";
import { useTabContext } from "./context/TabContext";

interface HomePageProps {
  onSelectFile: (filepath: string) => void;
}

/**
 * HomePage component displays a personalized dashboard for the documentation app
 * with reading history, analytics, and  list for articles to read later.
 *
 * This updated version is optimized for both mobile and desktop experiences and
 * includes analytics and gamification features.
 */
const HomePage: React.FC<HomePageProps> = ({ onSelectFile }) => {
  const {
    readingHistory,
    todoList,
    addToTodoList,
    removeFromTodoList,
    toggleTodoCompletion,
    clearTodoList,
    availableDocuments,
    handleSelectDocument,
  } = useDocumentManager(onSelectFile);

  const [showFileDialog, setShowFileDialog] = useState(false);
  const { activeTab, setActiveTab } = useTabContext();

  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);

  // State for first-time analytics view
  const [showAnalyticsIntro, setShowAnalyticsIntro] = useState(false);

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

  // Check if it's the first time viewing analytics
  useEffect(() => {
    if (activeTab === "analytics") {
      const hasSeenAnalytics = localStorage.getItem("hasSeenAnalytics");
      if (!hasSeenAnalytics) {
        setShowAnalyticsIntro(true);
        // Set localStorage to mark that user has seen analytics intro
        localStorage.setItem("hasSeenAnalytics", "true");
      }
    }
  }, [activeTab]);

  const handleAddMultipleToTodoList = (files: FileMetadata[]) => {
    files.forEach((file) => {
      addToTodoList(file.path, file.title);
    });
  };

  // Dismiss analytics intro alert
  const dismissAnalyticsIntro = () => {
    setShowAnalyticsIntro(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-cascadia-code pt-2 md:pt-6 pb-20 md:pb-6">
      {/* Desktop Tabs - Hidden on mobile */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-card border border-border rounded-lg">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-l-lg flex items-center",
                activeTab === "overview"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
              )}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "px-4 py-2 text-sm font-medium flex items-center",
                activeTab === "history"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
              )}
            >
              <Clock className="h-4 w-4 mr-2" />
              Reading History
            </button>
            <button
              onClick={() => setActiveTab("todo")}
              className={cn(
                "px-4 py-2 text-sm font-medium flex items-center",
                activeTab === "todo"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
              )}
            >
              <ListTodo className="h-4 w-4 mr-2" />
              Reading List
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-r-lg flex items-center",
                activeTab === "analytics"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
              )}
            >
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </button>
          </div>

          {/* Add button for desktop */}
          {activeTab === "todo" && (
            <Button
              className="h-9 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
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
            className="h-8 w-8 p-0 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
            onClick={() => setShowFileDialog(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Analytics introduction alert */}
      {showAnalyticsIntro && activeTab === "analytics" && (
        <div className="px-4 mb-6">
          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle className="text-sm font-medium">
              New Feature: Reading Analytics
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Track your reading progress, earn achievements, and level up your
              knowledge with our new analytics dashboard. Complete challenges to
              earn XP and unlock new achievements.
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-8 text-xs text-primary"
              onClick={dismissAnalyticsIntro}
            >
              Got it
            </Button>
          </Alert>
        </div>
      )}

      {/* Tab Content - shared between mobile and desktop */}
      <div className="pt-2">
        {activeTab === "overview" && (
          <>
            <Hero
              availableDocuments={availableDocuments}
              todoList={todoList}
              readingHistory={readingHistory}
            />
            <Overview
              todoList={todoList}
              readingHistory={readingHistory}
              availableDocuments={availableDocuments}
              toggleTodoCompletion={toggleTodoCompletion}
              handleSelectDocument={handleSelectDocument}
              setShowAddTodoModal={() => setShowFileDialog(true)}
            />
          </>
        )}

        {activeTab === "history" && (
          <History handleSelectDocument={handleSelectDocument} />
        )}

        {activeTab === "todo" && (
          <TodoList
            todoList={todoList}
            toggleTodoCompletion={toggleTodoCompletion}
            handleSelectDocument={handleSelectDocument}
            removeFromTodoList={removeFromTodoList}
            clearTodoList={clearTodoList}
            setShowAddTodoModal={() => setShowFileDialog(true)}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsPage
            availableDocuments={availableDocuments}
            onSelectDocument={handleSelectDocument}
          />
        )}
      </div>

      <MobileOptimizedTabs />

      {/* File Selection Dialog - uses shadcn Dialog component */}
      <FileSelectionDialog
        open={showFileDialog}
        onOpenChange={setShowFileDialog}
        availableDocuments={availableDocuments}
        categories={categories}
        todoList={todoList}
        onAddToTodoList={handleAddMultipleToTodoList}
      />
    </div>
  );
};

export default HomePage;
