import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Clock,
  Plus,
  Search,
  FileText,
  LayoutDashboard,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useDocumentManager from "@/hooks/useDocumentManager";
import Hero from "./Hero";
import History from "./history/History";
import TodoList from "./todo/TodoList";
import Overview from "./overview/Overview";
interface HomePageProps {
  onSelectFile: (filepath: string) => void;
}

/**
 * HomePage component displays a personalized dashboard for the documentation app
 * with reading history and a todo list for articles to read later.
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
    filteredDocuments,
    searchQuery,
    setSearchQuery,

    handleSelectDocument,
    formatDate,
  } = useDocumentManager(onSelectFile);

  // State for add todo modal
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);

  // State for active tab
  const [activeTab, setActiveTab] = useState("overview");

  // Handle adding document and closing modal
  const handleAddToTodoList = (path: string, title: string) => {
    addToTodoList(path, title);
    setShowAddTodoModal(false);
    setSearchQuery("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-cascadia-code pt-2 md:pt-6">
      {/* Hero section with animated gradient */}
      <Hero
        availableDocuments={availableDocuments}
        todoList={todoList}
        readingHistory={readingHistory}
      />

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6 w-full sm:w-auto bg-card border border-border">
          <TabsTrigger
            value="overview"
            className="flex-1 sm:flex-initial data-[state=active]:text-primary data-[state=active]:bg-primary/10"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex-1 sm:flex-initial data-[state=active]:text-primary data-[state=active]:bg-primary/10"
          >
            <Clock className="h-4 w-4 mr-2" />
            Reading History
          </TabsTrigger>
          <TabsTrigger
            value="todo"
            className="flex-1 sm:flex-initial data-[state=active]:text-primary data-[state=active]:bg-primary/10"
          >
            <ListTodo className="h-4 w-4 mr-2" />
            Reading List
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <Overview
            todoList={todoList}
            formatDate={formatDate}
            toggleTodoCompletion={toggleTodoCompletion}
            handleSelectDocument={handleSelectDocument}
            removeFromTodoList={removeFromTodoList}
            clearTodoList={clearTodoList}
            setShowAddTodoModal={setShowAddTodoModal}
          />
        </TabsContent>

        <TabsContent value="history" className="outline-none">
          <History
            readingHistory={readingHistory}
            handleSelectDocument={handleSelectDocument}
            handleExploreDocuments={() => {
              setActiveTab("overview");
            }}
            handleClearHistory={clearReadingHistory}
          />
        </TabsContent>

        <TabsContent value="todo" className="outline-none">
          <TodoList
            todoList={todoList}
            formatDate={formatDate}
            toggleTodoCompletion={toggleTodoCompletion}
            handleSelectDocument={handleSelectDocument}
            removeFromTodoList={removeFromTodoList}
            clearTodoList={clearTodoList}
            setShowAddTodoModal={setShowAddTodoModal}
          />
        </TabsContent>
      </Tabs>

      {/* Add To Reading List Modal */}
      {showAddTodoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0">
          <div
            className="bg-card border border-border rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-90"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <h2 className="text-lg font-medium flex items-center">
                <Plus className="h-5 w-5 mr-2 text-primary" />
                Add to Reading List
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Search and add documents to your reading list
              </p>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card/50 border-border/50 focus-visible:border-primary/30"
                  autoFocus
                />
              </div>
            </div>

            {/* Document List */}
            <ScrollArea className="flex-1 overflow-y-auto max-h-[40vh]">
              {filteredDocuments.length > 0 ? (
                <div className="p-3 space-y-2">
                  {filteredDocuments.map((doc) => {
                    const isInTodoList = todoList.some(
                      (item) => item.path === doc.path
                    );

                    return (
                      <button
                        key={doc.path}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 border border-border/40",
                          isInTodoList
                            ? "bg-primary/5 border-primary/10 text-muted-foreground"
                            : "hover:bg-secondary/10 hover:border-primary/20 hover:text-primary"
                        )}
                        onClick={() =>
                          !isInTodoList &&
                          handleAddToTodoList(doc.path, doc.title)
                        }
                        disabled={isInTodoList}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-primary/70" />
                        </div>
                        <div className="flex-grow">
                          <span className="text-sm font-medium truncate block">
                            {doc.title}
                          </span>
                          <span className="text-xs text-muted-foreground truncate block">
                            {doc.path}
                          </span>
                        </div>
                        {isInTodoList && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
                            Already added
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                    <Search className="h-6 w-6 opacity-40" />
                  </div>
                  <p className="text-sm font-medium">No matching documents</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-border/50 bg-card text-xs text-center text-muted-foreground flex justify-between items-center">
              <span>{availableDocuments.length} documents available</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddTodoModal(false);
                  setSearchQuery("");
                }}
                className="text-primary"
              >
                Close
              </Button>
            </div>
          </div>

          {/* Background overlay click handler */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => {
              setShowAddTodoModal(false);
              setSearchQuery("");
            }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;
