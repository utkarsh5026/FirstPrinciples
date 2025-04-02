// src/components/markdown/card/CardProgress.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

interface CardProgressProps {
  currentIndex: number;
  totalCards: number;
  onSelectCard?: (index: number) => void;
  className?: string;
}

const CardProgress: React.FC<CardProgressProps> = ({
  currentIndex,
  totalCards,
  onSelectCard,
  className,
}) => {
  // Show max of 7 indicators on mobile, collapse the rest
  const MAX_VISIBLE_DOTS = 7;
  const showAllDots = totalCards <= MAX_VISIBLE_DOTS;

  // Calculate which dots to show
  let dotsToShow: Array<{ index: number; isEllipsis?: boolean }> = [];

  if (showAllDots) {
    // Show all dots if there are few enough
    dotsToShow = Array.from({ length: totalCards }, (_, i) => ({ index: i }));
  } else {
    // Always show first, last, current and immediate neighbors
    const startSlice = Math.max(0, currentIndex - 1);
    const endSlice = Math.min(totalCards - 1, currentIndex + 1);

    // Add first dot
    dotsToShow.push({ index: 0 });

    // Add ellipsis if needed
    if (startSlice > 1) {
      dotsToShow.push({ index: -1, isEllipsis: true });
    }

    // Add neighbors around current
    for (let i = startSlice; i <= endSlice; i++) {
      if (i !== 0 && i !== totalCards - 1) {
        dotsToShow.push({ index: i });
      }
    }

    // Add ellipsis if needed
    if (endSlice < totalCards - 2) {
      dotsToShow.push({ index: -2, isEllipsis: true });
    }

    // Add last dot
    if (totalCards > 1) {
      dotsToShow.push({ index: totalCards - 1 });
    }
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center space-x-1.5">
        {dotsToShow.map((dot, i) => {
          if (dot.isEllipsis) {
            return (
              <div
                key={`ellipsis-${i}`}
                className="text-muted-foreground px-0.5"
              >
                <MoreHorizontal className="h-3 w-3" />
              </div>
            );
          }

          const isActive = dot.index === currentIndex;
          return (
            <button
              key={dot.index}
              onClick={() => onSelectCard && onSelectCard(dot.index)}
              className={cn(
                "transition-all duration-200 rounded-full",
                isActive
                  ? "h-2.5 w-8 bg-primary"
                  : "h-2.5 w-2.5 bg-secondary hover:bg-secondary-foreground/20",
                onSelectCard && "cursor-pointer"
              )}
              aria-label={`Go to card ${dot.index + 1}`}
              disabled={isActive}
            />
          );
        })}
      </div>

      <div className="ml-3 text-xs text-muted-foreground">
        {currentIndex + 1} / {totalCards}
      </div>
    </div>
  );
};

export default CardProgress;
