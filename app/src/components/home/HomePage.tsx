import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Calendar,
  Plus,
  X,
  Search,
  FileText,
  ChevronRight,
  LayoutDashboard,
  ListTodo,
  Sparkles,
  BookOpenCheck,
  Bookmark,
  ArrowRightCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useMobile from "@/hooks/useMobile";
import useDocumentManager from "@/hooks/useDocumentManager";

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

  // Check if user is on mobile
  useMobile();

  // Handle adding document and closing modal
  const handleAddToTodoList = (path: string, title: string) => {
    addToTodoList(path, title);
    setShowAddTodoModal(false);
    setSearchQuery("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-cascadia-code pt-2 md:pt-6">
      {/* Hero section with animated gradient */}
      <div className="relative overflow-hidden rounded-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/20 opacity-60"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giIHJlc3VsdD0ibm9pc2UiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]"></div>
        <div className="relative z-10 px-6 py-8 md:py-10 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full mb-6 bg-primary/10 text-primary text-sm border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            First Principles Documentation
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Your Learning Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-lg mx-auto">
            Track your progress, save articles for later, and continue where you
            left off.
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <Badge
              variant="secondary"
              className="px-3 py-1.5 text-sm font-medium bg-black/10 backdrop-blur-sm"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              {availableDocuments.length} Documents
            </Badge>
            <Badge
              variant="secondary"
              className="px-3 py-1.5 text-sm font-medium bg-black/10 backdrop-blur-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              {todoList.filter((item) => item.completed).length} Completed
            </Badge>
            <Badge
              variant="secondary"
              className="px-3 py-1.5 text-sm font-medium bg-black/10 backdrop-blur-sm"
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {readingHistory.length} Read
            </Badge>
          </div>
        </div>
      </div>

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
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex-1 sm:flex-initial data-[state=active]:text-primary data-[state=active]:bg-primary/10"
          >
            <Clock className="h-4 w-4 mr-2" />
          </TabsTrigger>
          <TabsTrigger
            value="todo"
            className="flex-1 sm:flex-initial data-[state=active]:text-primary data-[state=active]:bg-primary/10"
          >
            <ListTodo className="h-4 w-4 mr-2" />
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Reading Progress Card */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <BookOpenCheck className="h-6 w-6 text-primary" />
                </div>
                <div className="mt-1 font-semibold text-2xl">
                  {readingHistory.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Documents Read
                </div>
              </div>

              {/* Reading List Card */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Bookmark className="h-6 w-6 text-primary" />
                </div>
                <div className="mt-1 font-semibold text-2xl">
                  {todoList.filter((item) => !item.completed).length}
                </div>
                <div className="text-sm text-muted-foreground">To Read</div>
              </div>
            </div>

            {/* Continue Reading Card */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                Continue Reading
              </h2>

              {readingHistory.length > 0 ? (
                <div className="space-y-1">
                  {readingHistory.slice(0, 1).map((item) => (
                    <div key={item.path} className="relative group">
                      <button
                        className="w-full text-left p-3 rounded-lg group-hover:bg-primary/5 transition-colors flex items-center gap-2 border border-border/50"
                        onClick={() =>
                          handleSelectDocument(item.path, item.title)
                        }
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-medium truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1 inline" />
                            {formatDate(item.lastReadAt)}
                          </p>
                        </div>
                        <div className="absolute opacity-0 group-hover:opacity-100 right-3 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground rounded-full p-1 transition-opacity">
                          <ArrowRightCircle className="h-5 w-5" />
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 rounded-lg bg-secondary/5">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">You haven't read any documents yet</p>
                  <p className="text-xs mt-1 mb-3 text-muted-foreground">
                    Start exploring the documentation
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Reading */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Recently Read
            </h2>

            {readingHistory.length > 0 ? (
              <div className="space-y-2">
                {readingHistory.slice(0, 3).map((item) => (
                  <button
                    key={item.path}
                    className="w-full text-left p-3 rounded-lg hover:bg-primary/5 transition-colors flex items-center gap-3 group border border-border/40"
                    onClick={() => handleSelectDocument(item.path, item.title)}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1 inline" />
                        <span>{formatDate(item.lastReadAt)}</span>
                        {item.readCount > 1 && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[10px] h-4"
                          >
                            Read {item.readCount}×
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </button>
                ))}

                <Button
                  variant="outline"
                  className="w-full mt-2 border-dashed border-border hover:bg-primary/5 hover:text-primary transition-colors"
                  onClick={() => setActiveTab("history")}
                >
                  View all history
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 rounded-lg bg-secondary/5">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No reading history yet</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Documents you read will appear here
                </p>
              </div>
            )}
          </div>

          {/* Todo List Preview */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center">
                <ListTodo className="h-5 w-5 mr-2 text-primary" />
                Reading List
              </h2>
              <Button
                size="sm"
                className="h-9 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                onClick={() => setShowAddTodoModal(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add Document
              </Button>
            </div>

            {todoList.length > 0 ? (
              <div className="space-y-2">
                {todoList
                  .filter((item) => !item.completed)
                  .slice(0, 3)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-border/40 flex items-start gap-3 group hover:border-primary/20 hover:bg-primary/5 transition-all"
                    >
                      <button
                        className="mt-1 flex-shrink-0 h-5 w-5 rounded-full border border-primary/30 hover:border-primary/50 transition-colors"
                        onClick={() => toggleTodoCompletion(item.id)}
                        aria-label="Mark as read"
                      />

                      <div className="flex-grow">
                        <button
                          className="text-left text-sm font-medium hover:text-primary transition-colors line-clamp-1 w-full text-left"
                          onClick={() =>
                            handleSelectDocument(item.path, item.title)
                          }
                        >
                          {item.title}
                        </button>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Added {formatDate(item.addedAt)}
                        </p>
                      </div>

                      <button
                        className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                        onClick={() => removeFromTodoList(item.id)}
                        aria-label="Remove from reading list"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                <Button
                  variant="outline"
                  className="w-full mt-2 border-dashed border-border hover:bg-primary/5 hover:text-primary transition-colors"
                  onClick={() => setActiveTab("todo")}
                >
                  View full reading list
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 rounded-lg bg-secondary/5">
                <ListTodo className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-base font-medium">
                  Your reading list is empty
                </p>
                <p className="text-sm mt-1 mb-4 text-muted-foreground">
                  Add documents you want to read later
                </p>
                <Button
                  variant="outline"
                  className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                  onClick={() => setShowAddTodoModal(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add document
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Reading History Tab Content */}
        <TabsContent value="history" className="outline-none">
          <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <h2 className="text-lg font-medium flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Reading History
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Track your reading progress across the documentation
              </p>
            </div>

            {readingHistory.length > 0 ? (
              <ScrollArea className="h-[400px] md:h-[500px] pr-4">
                <div className="p-5 space-y-3">
                  {readingHistory.map((item) => (
                    <button
                      key={item.path}
                      className="w-full text-left p-3 rounded-lg hover:bg-primary/5 border border-border/40 hover:border-primary/20 transition-all flex items-center gap-3 group"
                      onClick={() =>
                        handleSelectDocument(item.path, item.title)
                      }
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1 inline" />
                          <span>{formatDate(item.lastReadAt)}</span>
                          {item.readCount > 1 && (
                            <Badge
                              variant="secondary"
                              className="ml-2 text-[10px] h-4"
                            >
                              Read {item.readCount}×
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-base font-medium">No reading history yet</p>
                <p className="text-sm mt-1 mb-6">
                  Documents you read will appear here
                </p>
                <Button
                  variant="outline"
                  className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                  onClick={() => setActiveTab("overview")}
                >
                  Explore documents
                </Button>
              </div>
            )}

            {readingHistory.length > 0 && (
              <div className="px-5 py-3 border-t border-border flex justify-between items-center bg-card">
                <p className="text-sm text-muted-foreground">
                  {readingHistory.length}{" "}
                  {readingHistory.length === 1 ? "document" : "documents"} in
                  history
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive h-8 hover:bg-destructive/10"
                  onClick={clearReadingHistory}
                >
                  Clear history
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Reading Todo List Tab Content */}
        <TabsContent value="todo" className="outline-none">
          <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium flex items-center">
                    <ListTodo className="h-5 w-5 mr-2 text-primary" />
                    Reading List
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Documents you want to read later
                  </p>
                </div>
                <Button
                  className="h-9 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                  onClick={() => setShowAddTodoModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Add
                </Button>
              </div>
            </div>

            {todoList.length > 0 ? (
              <>
                <ScrollArea className="h-[400px] md:h-[500px] pr-4">
                  <div className="p-5 space-y-3">
                    {/* Uncompleted items first */}
                    {todoList
                      .filter((item) => !item.completed)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg border border-border/40 flex items-start gap-3 group hover:border-primary/20 hover:bg-primary/5 transition-all"
                        >
                          <button
                            className="mt-1 flex-shrink-0 h-5 w-5 rounded-full border border-primary/30 hover:border-primary/50 transition-colors"
                            onClick={() => toggleTodoCompletion(item.id)}
                            aria-label="Mark as read"
                          />

                          <div className="flex-grow">
                            <button
                              className="text-left text-sm font-medium hover:text-primary transition-colors line-clamp-1 w-full text-left"
                              onClick={() =>
                                handleSelectDocument(item.path, item.title)
                              }
                            >
                              {item.title}
                            </button>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Added {formatDate(item.addedAt)}
                            </p>
                          </div>

                          <button
                            className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                            onClick={() => removeFromTodoList(item.id)}
                            aria-label="Remove from reading list"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                    {/* Add a divider if there are both completed and uncompleted items */}
                    {todoList.some((item) => item.completed) &&
                      todoList.some((item) => !item.completed) && (
                        <div className="py-2 px-4">
                          <div className="border-t border-border/40 flex items-center justify-center py-2">
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Completed Items
                            </Badge>
                          </div>
                        </div>
                      )}

                    {/* Completed items */}
                    {todoList
                      .filter((item) => item.completed)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-3 group"
                        >
                          <button
                            className="mt-1 flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary border border-primary/40 transition-colors flex items-center justify-center"
                            onClick={() => toggleTodoCompletion(item.id)}
                            aria-label="Mark as unread"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>

                          <div className="flex-grow">
                            <button
                              className="text-left text-sm font-medium text-muted-foreground line-through hover:text-primary transition-colors line-clamp-1 w-full text-left"
                              onClick={() =>
                                handleSelectDocument(item.path, item.title)
                              }
                            >
                              {item.title}
                            </button>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Added {formatDate(item.addedAt)}
                            </p>
                          </div>

                          <button
                            className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                            onClick={() => removeFromTodoList(item.id)}
                            aria-label="Remove from reading list"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </ScrollArea>

                <div className="px-5 py-3 border-t border-border flex justify-between items-center bg-card">
                  <p className="text-sm text-muted-foreground">
                    {todoList.filter((item) => !item.completed).length} to read
                    • {todoList.filter((item) => item.completed).length}{" "}
                    completed
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-8 hover:bg-destructive/10"
                    onClick={clearTodoList}
                  >
                    Clear list
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <ListTodo className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-base font-medium">
                  Your reading list is empty
                </p>
                <p className="text-sm mt-1 mb-6">
                  Add documents you want to read later
                </p>
                <Button
                  className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                  onClick={() => setShowAddTodoModal(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add document
                </Button>
              </div>
            )}
          </div>
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
