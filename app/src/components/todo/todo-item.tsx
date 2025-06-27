import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Calendar, Circle, CheckCheck, DeleteIcon } from "lucide-react";
import getIconForTech from "@/components/shared/icons/icon-map";
import type { ReadingTodoItem } from "@/services/reading/reading-list-service";
import { fromSnakeToTitleCase } from "@/utils/string";
import styles from "./css/TodoItem.module.css";
import { generateArrayWithUniqueIds } from "@/utils/array";
import { Button } from "../ui/button";

const sparkles = generateArrayWithUniqueIds(8);
const confetti = generateArrayWithUniqueIds(10);
interface TodoItemProps {
  item: ReadingTodoItem;
  handleSelectDocument: (path: string, title: string) => void;
  toggleCompletion: () => void;
  removeItem: () => void;
}

/**
 * Enhanced TodoItem Component
 *
 * A beautifully designed item in the reading list with satisfying
 * completion animations and intuitive controls.
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

  // State to track animation
  const [isAnimating, setIsAnimating] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(completed);
  const itemRef = useRef<HTMLDivElement>(null);

  // Handle completion toggle with animation
  const handleToggleCompletion = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Only animate when marking as completed, not when uncompleting
    if (!completed) {
      setIsAnimating(true);

      // Give time for animation to complete before updating state
      setTimeout(() => {
        toggleCompletion();
      }, 300);
    } else {
      // Just toggle immediately if uncompleting
      toggleCompletion();
    }
  };

  // Reset animation state when completed changes
  useEffect(() => {
    if (completed !== wasCompleted) {
      setWasCompleted(completed);
      if (!completed) {
        setIsAnimating(false);
      }
    }
  }, [completed, wasCompleted]);

  // Handle animation end
  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  return (
    <div
      ref={itemRef}
      className={cn(
        styles.todoItem,
        "flex items-start gap-3 p-3 rounded-2xl border transition-all w-full",
        completed
          ? "border-primary/20 bg-primary/5"
          : "border-border hover:border-primary/20 hover:bg-secondary/5"
      )}
    >
      {/* Animation effects */}
      {isAnimating && <div className={styles.shimmerEffect} />}
      {isAnimating && (
        <div className={styles.confettiContainer}>
          {confetti.map((id) => (
            <div key={id} className={styles.confetti}></div>
          ))}
        </div>
      )}
      {isAnimating && (
        <div className={styles.sparkleContainer}>
          {sparkles.map((id) => (
            <div key={id} className={styles.sparkle}></div>
          ))}
        </div>
      )}

      <div
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
      </div>

      <div
        className="flex-1 cursor-pointer relative"
        onClick={() => handleSelectDocument(path, title)}
      >
        {/* Title */}
        <h4
          className={cn(
            styles.completedText,
            "text-sm font-medium break-words pr-8",
            completed && styles.lineThrough,
            completed && "text-muted-foreground"
          )}
        >
          {title}
        </h4>

        {/* Metadata */}
        <div className="flex flex-wrap items-center mt-1 text-xs text-muted-foreground gap-2">
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formattedDate}
          </span>

          <div className="flex items-center">
            <CategoryIcon className="h-3 w-3 mr-1 text-primary/70" />
            <span className="truncate max-w-[100px]">
              {fromSnakeToTitleCase(fileCategory)}
            </span>
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            removeItem();
          }}
          className="absolute right-0 top-0 text-muted-foreground/40 hover:text-destructive p-1.5 cursor-pointer hover:scale-110 transition-all duration-200"
          title="Remove"
          variant="ghost"
        >
          <DeleteIcon className="h-3.5 w-3.5 text-primary/50" />
        </Button>
      </div>
    </div>
  );
};

export default TodoItem;
