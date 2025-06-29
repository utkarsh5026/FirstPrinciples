import React from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import getIconForTech from "@/components/shared/icons/icon-map";
import type { ReadingTodoItem } from "@/services/reading/reading-list-service";
import { fromSnakeToTitleCase } from "@/utils/string";

interface TodoItemProps {
  item: ReadingTodoItem;
  handleSelectDocument: (path: string, title: string) => void;
  toggleCompletion: () => void;
  removeItem: () => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  item,
  handleSelectDocument,
  toggleCompletion,
  removeItem,
}) => {
  const { path, title, completed } = item;
  const fileCategory = path.split("/")[0] || "uncategorized";
  const CategoryIcon = getIconForTech(fileCategory);

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 rounded-2xl border-none transition-colors bg-transparent",
        completed
          ? "bg-muted/30 border-muted"
          : "bg-background border-border hover:bg-muted/20 hover:border-border"
      )}
    >
      {/* Completion Toggle */}
      <button
        onClick={toggleCompletion}
        className={cn(
          "mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all bg-transparent",
          completed
            ? "bg-primary border-primary text-primary-foreground hover:bg-primary/10"
            : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
        )}
      >
        {completed && <Check className="h-3 w-3" />}
      </button>

      {/* Content */}
      <div
        className="flex-1 cursor-pointer min-w-0"
        onClick={() => handleSelectDocument(path, title)}
      >
        <h4
          className={cn(
            "text-sm font-medium truncate",
            completed && "line-through text-muted-foreground"
          )}
        >
          {title}
        </h4>

        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CategoryIcon className="h-3 w-3" />
            {fromSnakeToTitleCase(fileCategory)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeItem();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
        title="Remove item"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default TodoItem;
