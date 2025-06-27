// src/components/home/HomePage.tsx
import React, { useState, useEffect, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Clock,
  ListTodo,
  Plus,
  BarChart,
  RefreshCcw,
} from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { type Category, getCategories } from "@/services/document";
import { useDocumentList } from "@/hooks";

const Overview = lazy(() =>
  import("@/components/home/overview/overview").catch((error) => {
    console.error("Failed to load Overview component:", error);
    return { default: () => <FallbackComponent name="Overview" /> };
  })
);

const History = lazy(() =>
  import("@/components/history/History").catch((error) => {
    console.error("Failed to load History component:", error);
    return { default: () => <FallbackComponent name="History" /> };
  })
);

const TodoList = lazy(() =>
  import("@/components/todo/TodoList").catch((error) => {
    console.error("Failed to load TodoList component:", error);
    return { default: () => <FallbackComponent name="Reading List" /> };
  })
);

const AnalyticsView = lazy(() =>
  import("@/components/analytics/AnalyticsView").catch((error) => {
    console.error("Failed to load AnalyticsView component:", error);
    return { default: () => <FallbackComponent name="Analytics" /> };
  })
);

// Fallback component for when lazy loading fails
const FallbackComponent = ({ name }: { name: string }) => (
  <Card className="p-6 text-center border-dashed border-2 border-primary/20 bg-primary/5 flex flex-col items-center justify-center rounded-2xl">
    <div className="h-12 w-12 md:h-16 md:w-16 mb-3 md:mb-4 bg-primary/10 rounded-full flex items-center justify-center">
      <RefreshCcw className="h-6 w-6 md:h-8 md:w-8 text-primary/50" />
    </div>
    <h3 className="text-base md:text-lg font-medium mb-1 md:mb-2">
      Unable to load {name}
    </h3>
    <p className="text-sm text-muted-foreground max-w-md mb-4 md:mb-6">
      We encountered an issue loading this content. This might be due to network
      issues or a recent update.
    </p>
    <Button
      onClick={() => window.location.reload()}
      className="bg-primary text-primary-foreground text-sm"
    >
      <RefreshCcw className="mr-2 h-4 w-4" />
      Refresh Page
    </Button>
  </Card>
);

/**
 * 🏠 HomePage Component
 *
 * A beautiful, responsive dashboard for managing your reading activities.
 *
 * ✨ Features:
 * - Tabbed interface for easy navigation between different views
 * - Responsive design that works on both mobile and desktop
 * - Resilient error handling for component loading
 * - Lazy-loaded content for better performance
 *
 * 📱 Mobile Experience:
 * - Compact header with current tab name
 * - Bottom navigation for easy thumb access
 * - Optimized spacing for smaller screens
 * - Smooth transitions between sections
 *
 * 💻 Desktop Experience:
 * - Full tab navigation with text labels
 * - Spacious layout optimized for larger screens
 * - Consistent design language across all views
 *
 * 📚 Reading Management:
 * - Overview of your reading activity
 * - Track reading history
 * - Maintain a reading list
 * - Analyze your reading habits
 */
const HomePage: React.FC = () => {
  useInit();
  const { documents } = useDocumentList();
  const handleSelectDocument = useDocumentStore(
    (state) => state.handleSelectDocument
  );
  const navigate = useNavigate();

  const [showFileDialog, setShowFileDialog] = useState(false);
  const { activeTab, setActiveTab, handlers } = useTabContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tabError, setTabError] = useState<string | null>(null);

  const handleSelectFile = (filepath: string, title: string) => {
    const encodedPath = encodeURIComponent(filepath);
    navigate(`/documents/${encodedPath}`);
    handleSelectDocument(filepath, title);
  };

  /*
   🔄 Load categories from the MarkdownLoader
  */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const loadedCategories = await getCategories();
        setCategories(loadedCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  /*
   🔄 Handle tab change
  */
  const handleTabChange = (value: string) => {
    // Reset any previous error when changing tabs
    setTabError(null);
    setActiveTab(value as TabType);
  };

  /*
   🛠️ Error handler for Suspense fallbacks
  */
  const handleComponentError = (error: Error) => {
    console.error("Error loading component:", error);
    setTabError(error.message);
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto font-cascadia-code pt-2 md:pt-6 pb-20 md:pb-6"
      {...handlers}
    >
      {/* 🖥️ Desktop Tabs - Hidden on mobile */}
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

          {/* ➕ Add button for desktop */}
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

      {/* 📑 Tab Content with Suspense for lazy loading */}
      <div className="pt-2">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="overview" className="mt-0">
            {/* 🌟 Hero component is eagerly loaded for better initial experience */}
            <Hero />
            <Suspense fallback={<OverviewTabLoader />}>
              <ErrorBoundary onError={handleComponentError}>
                <Overview
                  handleSelectDocument={handleSelectFile}
                  setShowAddTodoModal={() => setShowFileDialog(true)}
                />
              </ErrorBoundary>
            </Suspense>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Suspense fallback={<HistoryTabLoader />}>
              <ErrorBoundary onError={handleComponentError}>
                <History handleSelectDocument={handleSelectFile} />
              </ErrorBoundary>
            </Suspense>
          </TabsContent>

          <TabsContent value="todo" className="mt-0">
            <Suspense fallback={<TodoListLoader />}>
              <ErrorBoundary onError={handleComponentError}>
                <TodoList
                  handleSelectDocument={handleSelectFile}
                  setShowAddTodoModal={() => setShowFileDialog(true)}
                />
              </ErrorBoundary>
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <Suspense fallback={<AnalyticsTabLoader />}>
              <ErrorBoundary onError={handleComponentError}>
                <AnalyticsView
                  availableDocuments={documents}
                  onSelectDocument={handleSelectFile}
                />
              </ErrorBoundary>
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      {/* Display error message if component loading fails */}
      {tabError && (
        <Card className="p-4 mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
          <p className="mb-2 font-medium">Error loading content:</p>
          <p className="text-muted-foreground">{tabError}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-3 w-3 mr-1" /> Refresh Page
          </Button>
        </Card>
      )}

      {/* 📲 Mobile optimized tabs at the bottom of the screen */}
      <MobileOptimizedTabs />

      {/* 📂 File Selection Dialog - uses shadcn Dialog component */}
      <FileSelectionDialog
        open={showFileDialog}
        onOpenChange={setShowFileDialog}
        availableDocuments={documents}
        categories={categories}
      />
    </div>
  );
};

// Component-level error boundary for catching errors in child components
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  onError: (error: Error) => void;
}> {
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.props.children;
  }
}

export default HomePage;
