import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Calendar, Circle, CheckCheck, DeleteIcon } from "lucide-react";
import getIconForTech from "@/components/shared/icons/iconMap";
import type { ReadingTodoItem } from "@/services/reading/reading-list-service";
import { fromSnakeToTitleCase } from "@/utils/string";
import styles from "./css/TodoItem.module.css";
import { generateArrayWithUniqueIds } from "@/utils/array";

interface TodoItemProps {
  item: ReadingTodoItem;
  handleSelectDocument: (path: string, title: string) => void;
  toggleCompletion: () => void;
  removeItem: () => void;
}

const sparkles = generateArrayWithUniqueIds(8);
const confetti = generateArrayWithUniqueIds(10);

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

  const [isAnimating, setIsAnimating] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(completed);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleToggleCompletion = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!completed) {
      setIsAnimating(true);
      setTimeout(() => {
        toggleCompletion();
      }, 100);
    } else toggleCompletion();
  };

  useEffect(() => {
    if (completed !== wasCompleted) {
      setWasCompleted(completed);
      if (!completed) setIsAnimating(false);
    }
  }, [completed, wasCompleted]);

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  return (
    <div
      ref={itemRef}
      className={cn(
        styles.todoItem,
        "flex items-start gap-3 p-3 rounded-2xl border transition-all max-w-full",
        completed
          ? "border-primary/20 bg-primary/5"
          : "border-border hover:border-primary/20 hover:bg-secondary/5"
      )}
    >
      {isAnimating && <div className={styles.shimmerEffect} />}

      {isAnimating && (
        <div className={styles.confettiContainer}>
          {confetti.map((confetti) => (
            <div key={confetti} className={styles.confetti}></div>
          ))}
        </div>
      )}

      {isAnimating && (
        <div className={styles.sparkleContainer}>
          {sparkles.map((sparkle) => (
            <div key={sparkle} className={styles.sparkle}></div>
          ))}
        </div>
      )}

      <button
        onClick={handleToggleCompletion}
        onAnimationEnd={handleAnimationEnd}
        className={cn(
          styles.completionButton,
          "mt-0.5 h-5 w-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors",
          isAnimating && styles.completionAnimation,
          isAnimating && styles.glowEffect,
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
        className="flex-1 min-w-0 cursor-pointer overflow-hidden"
        onClick={() => handleSelectDocument(path, title)}
      >
        <div className="flex flex-row sm:items-center sm:justify-between w-full">
          <div className="flex-1 min-w-0 overflow-hidden">
            <h4
              className={cn(
                styles.completedText,
                "text-sm font-medium truncate max-w-full",
                completed && styles.lineThrough,
                completed && "text-muted-foreground"
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
    </div>
  );
};

export default TodoItem;
