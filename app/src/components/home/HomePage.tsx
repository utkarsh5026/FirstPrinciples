import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Clock, ListTodo, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import useDocumentManager from "@/hooks/useDocumentManager";
import { Category, FileMetadata, MarkdownLoader } from "@/utils/MarkdownLoader";
import Hero from "./Hero";
import History from "./history/History";
import TodoList from "./todo/TodoList";
import Overview from "./overview/Overview";
import MobileOptimizedTabs from "./MobileOptimizedTabs";
import FileSelectionDialog from "./todo/AddTodoModal";

interface HomePageProps {
  onSelectFile: (filepath: string) => void;
}

/**
 * HomePage component displays a personalized dashboard for the documentation app
 * with reading history and a todo list for articles to read later.
 *
 * This updated version is optimized for both mobile and desktop experiences and
 * includes a file selection dialog with a tree view for selecting multiple files.
 */
const HomePage: React.FC<HomePageProps> = ({ onSelectFile }) => {
  // Use our custom hook to manage all document-related functionality
  const {
    readingHistory,
    clearReadingHistory,
    todoList,
    addToTodoList,
    removeFromTodoList,
    toggleTodoCompletion,
    clearTodoList,
    availableDocuments,
    handleSelectDocument,
    formatDate,
  } = useDocumentManager(onSelectFile);

  // State for file selection dialog
  const [showFileDialog, setShowFileDialog] = useState(false);

  // State for active tab
  const [activeTab, setActiveTab] = useState("overview");

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

  // Handle adding multiple files to the todo list
  const handleAddMultipleToTodoList = (files: FileMetadata[]) => {
    files.forEach((file) => {
      addToTodoList(file.path, file.title);
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-cascadia-code pt-2 md:pt-6 pb-20 md:pb-6">
      {/* Hero section with animated gradient */}
      <Hero
        availableDocuments={availableDocuments}
        todoList={todoList}
        readingHistory={readingHistory}
      />

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
                "px-4 py-2 text-sm font-medium rounded-r-lg flex items-center",
                activeTab === "todo"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
              )}
            >
              <ListTodo className="h-4 w-4 mr-2" />
              Reading List
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
          {activeTab === "overview" && "Overview"}
          {activeTab === "history" && "Reading History"}
          {activeTab === "todo" && "Reading List"}
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

      {/* Tab Content - shared between mobile and desktop */}
      <div className="pt-2">
        {activeTab === "overview" && (
          <Overview
            todoList={todoList}
            formatDate={formatDate}
            toggleTodoCompletion={toggleTodoCompletion}
            handleSelectDocument={handleSelectDocument}
            removeFromTodoList={removeFromTodoList}
            clearTodoList={clearTodoList}
            setShowAddTodoModal={() => setShowFileDialog(true)}
          />
        )}

        {activeTab === "history" && (
          <History
            readingHistory={readingHistory}
            handleSelectDocument={handleSelectDocument}
            handleExploreDocuments={() => setActiveTab("overview")}
            handleClearHistory={clearReadingHistory}
          />
        )}

        {activeTab === "todo" && (
          <TodoList
            todoList={todoList}
            formatDate={formatDate}
            toggleTodoCompletion={toggleTodoCompletion}
            handleSelectDocument={handleSelectDocument}
            removeFromTodoList={removeFromTodoList}
            clearTodoList={clearTodoList}
            setShowAddTodoModal={() => setShowFileDialog(true)}
          />
        )}
      </div>

      {/* Mobile Tabs - visible only on mobile */}
      <MobileOptimizedTabs activeTab={activeTab} setActiveTab={setActiveTab} />

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
