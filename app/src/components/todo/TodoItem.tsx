import { cn } from "@/lib/utils";
import { Calendar, Circle, CheckCheck, DeleteIcon } from "lucide-react";
import getIconForTech from "@/components/icons/iconMap";
import type { ReadingTodoItem } from "@/services/reading/reading-list-service";
import { motion } from "framer-motion";
import { fromSnakeToTitleCase } from "@/utils/string";

interface TodoItemProps {
  item: ReadingTodoItem;
  handleSelectDocument: (path: string, title: string) => void;
  toggleCompletion: () => void;
  removeItem: () => void;
}

/**
 * TodoItem Component
 *
 * A beautifully designed item in the reading list with subtle
 * animations and intuitive controls.
 */
const TodoItem: React.FC<TodoItemProps> = ({
  item,
  handleSelectDocument,
  toggleCompletion,
  removeItem,
}) => {
  const { path, title, completed, addedAt } = item;
  const formattedDate = new Date(addedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const fileCategory = path.split("/")[0] || "uncategorized";
  const CategoryIcon = getIconForTech(fileCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-2xl border transition-all",
        completed
          ? "border-primary/20 bg-primary/5"
          : "border-border hover:border-primary/20 hover:bg-secondary/5"
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleCompletion();
        }}
        className={cn(
          "mt-0.5 h-5 w-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors",
          completed
            ? "bg-primary/20 text-primary border-primary"
            : "border border-primary/30 hover:bg-primary/10"
        )}
      >
        {completed ? (
          <CheckCheck className="h-3 w-3" />
        ) : (
          <Circle className="h-3 w-3" />
        )}
      </button>

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => handleSelectDocument(path, title)}
      >
        <div className="flex flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "text-sm font-medium truncate",
                completed && "line-through text-muted-foreground"
              )}
            >
              {title}
            </h4>

            <div className="flex items-center mt-1 text-xs text-muted-foreground gap-3">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formattedDate}
              </span>

              <div className="flex items-center">
                <CategoryIcon className="h-3 w-3 mr-1 text-primary/70" />
                {fromSnakeToTitleCase(fileCategory)}
              </div>
            </div>
          </div>

          <div className="flex items-center mt-2 sm:mt-0 sm:ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeItem();
              }}
              className="text-muted-foreground/40 hover:text-destructive transition-colors p-1.5"
              title="Remove"
            >
              <DeleteIcon className="h-3.5 w-3.5 text-primary/50" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TodoItem;
