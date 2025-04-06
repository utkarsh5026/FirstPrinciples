import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, X, ListTodo, CheckCircle2 } from "lucide-react";
import type { ReadingTodoItem } from "@/hooks/useDocumentManager";

interface OverviewProps {
  todoList: ReadingTodoItem[];
  toggleTodoCompletion: (id: string) => void;
  handleSelectDocument: (path: string, title: string) => void;
  formatDate: (date: number) => string;
  removeFromTodoList: (id: string) => void;
  clearTodoList: () => void;
  setShowAddTodoModal: (show: boolean) => void;
}

const Overview: React.FC<OverviewProps> = ({
  todoList,
  toggleTodoCompletion,
  handleSelectDocument,
  setShowAddTodoModal,
  formatDate,
  removeFromTodoList,
  clearTodoList,
}) => {
  return (
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
                        className="text-left text-sm font-medium hover:text-primary transition-colors line-clamp-1 w-full"
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
                        className="text-sm font-medium text-muted-foreground line-through hover:text-primary transition-colors line-clamp-1 w-full text-left"
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
              {todoList.filter((item) => !item.completed).length} to read •{" "}
              {todoList.filter((item) => item.completed).length} completed
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
          <p className="text-base font-medium">Your reading list is empty</p>
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
  );
};

export default Overview;
