import React from "react";
import { BookMarked, ListTodo, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReadingTodoItem } from "@/components/home/types";

interface UpcomingReadsProps {
  todoList: ReadingTodoItem[];
  handleSelectDocument: (path: string, title: string) => void;
  toggleTodoCompletion: (id: string) => void;
  formatDate: (timestamp: number) => string;
  setShowAddTodoModal: () => void;
}

const UpcomingReads: React.FC<UpcomingReadsProps> = ({
  todoList,
  handleSelectDocument,
  toggleTodoCompletion,
  formatDate,
  setShowAddTodoModal,
}) => {
  return (
    <Card className="p-4 border-primary/10 bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/30 transition-colors rounded-3xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium flex items-center">
          <BookMarked className="h-4 w-4 mr-2 text-primary/70" />
          Upcoming Reads
        </h4>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          onClick={setShowAddTodoModal}
        >
          <ListTodo className="h-3 w-3 mr-1.5" />
          Add
        </Button>
      </div>

      {todoList.filter((item) => !item.completed).length > 0 ? (
        <div className="space-y-2">
          {todoList
            .filter((item) => !item.completed)
            .slice(0, 3)
            .map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2 rounded-md hover:bg-primary/5 transition-colors group"
              >
                <button
                  className="mt-1 flex-shrink-0 h-5 w-5 rounded-full border border-primary/30 hover:border-primary/50 transition-colors group-hover:bg-primary/10"
                  onClick={() => toggleTodoCompletion(item.id)}
                  aria-label="Mark as read"
                />
                <div className="min-w-0 flex-1">
                  <button
                    className="text-left text-sm font-medium hover:text-primary transition-colors line-clamp-1 w-full"
                    onClick={() => handleSelectDocument(item.path, item.title)}
                  >
                    {item.title}
                  </button>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Added {formatDate(item.addedAt)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground bg-card/50 rounded-lg">
          <ListTodo className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Your reading list is empty</p>
          <p className="text-xs mt-1">Add documents you want to read later</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
            onClick={setShowAddTodoModal}
          >
            Add documents
          </Button>
        </div>
      )}

      {todoList.filter((item) => !item.completed).length > 3 && (
        <div className="text-center mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary hover:bg-primary/10"
          >
            View all ({todoList.filter((item) => !item.completed).length})
          </Button>
        </div>
      )}
    </Card>
  );
};

export default UpcomingReads;
