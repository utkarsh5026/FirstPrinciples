import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { X, Calendar, Check, FileText } from "lucide-react";
import getIconForTech from "@/components/navigation/sidebar/iconMap";
import { formatDate } from "../utils";
import type { ReadingTodoItem } from "@/hooks/useDocumentManager";

interface TodoItemProps {
  category: string;
  items: ReadingTodoItem[];
  toggleTodoCompletion: (id: string) => void;
  handleSelectDocument: (path: string, title: string) => void;
  removeFromTodoList: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  category,
  items,
  toggleTodoCompletion,
  handleSelectDocument,
  removeFromTodoList,
}) => {
  return (
    <div className="space-y-3">
      {/* Category header */}
      <div className="flex items-center">
        <Badge
          variant="outline"
          className="mr-2 px-2 py-0.5 border-primary/20 text-primary bg-primary/5 text-xs font-normal"
        >
          {category}
        </Badge>
        <div className="h-px flex-grow bg-border/50"></div>
        <Badge className="ml-2 bg-primary/10 text-primary border-none">
          {items.length}
        </Badge>
      </div>

      {/* Items in this category */}
      <div className="space-y-3">
        {items.map((item) => {
          const CategoryIcon = getIconForTech(item.path.split("/")[0]);
          return (
            <Card
              key={item.id}
              className={cn(
                "relative overflow-hidden transition-all duration-200 hover:shadow-md rounded-2xl",
                item.completed
                  ? "bg-primary/5 border-primary/10"
                  : "hover:border-primary/20 hover:bg-secondary/5"
              )}
            >
              {/* Background decorative element */}
              <div
                className={cn(
                  "absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10",
                  item.completed ? "bg-primary/20" : "bg-secondary/20"
                )}
              >
                <CategoryIcon className="h-12 w-12" />
              </div>

              <div className="p-4 relative flex items-start gap-3">
                {/* Checkbox */}
                <button
                  className={cn(
                    "mt-1 flex-shrink-0 h-5 w-5 rounded-full transition-colors",
                    item.completed
                      ? "bg-primary/20 text-primary border border-primary/40 flex items-center justify-center"
                      : "border border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                  )}
                  onClick={() => toggleTodoCompletion(item.id)}
                  aria-label={
                    item.completed ? "Mark as unread" : "Mark as read"
                  }
                >
                  {item.completed && <Check className="h-3 w-3" />}
                </button>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <button
                    className={cn(
                      "text-left text-sm font-medium w-full transition-colors hover:text-primary",
                      item.completed && "line-through text-muted-foreground"
                    )}
                    onClick={() => handleSelectDocument(item.path, item.title)}
                  >
                    {item.title}
                  </button>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Added {formatDate(item.addedAt)}
                    </div>

                    {/* File path badge */}
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0 h-4 bg-secondary/10 border-secondary/20"
                    >
                      <FileText className="h-2.5 w-2.5 mr-1" />
                      {item.path.split("/").slice(1).join("/")}
                    </Badge>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                  onClick={() => removeFromTodoList(item.id)}
                  aria-label="Remove from reading list"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TodoItem;
