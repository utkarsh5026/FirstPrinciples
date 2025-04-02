// src/components/markdown/card/CardNavigation.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardProgress from "./CardProgress";

interface CardNavigationProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelectCard?: (index: number) => void;
  className?: string;
}

const CardNavigation: React.FC<CardNavigationProps> = ({
  currentIndex,
  totalCards,
  onPrevious,
  onNext,
  onSelectCard,
  className,
}) => {
  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      {/* Progress dots - visible on all devices */}
      <CardProgress
        currentIndex={currentIndex}
        totalCards={totalCards}
        onSelectCard={onSelectCard}
        className="mb-2"
      />

      {/* Navigation buttons - desktop style */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className={cn(
            "px-4 transition-all",
            currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentIndex === totalCards - 1}
          className={cn(
            "px-4 transition-all",
            currentIndex === totalCards - 1
              ? "opacity-50 cursor-not-allowed"
              : ""
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Mobile navigation hint - only visible on small screens */}
      <div className="text-xs text-center text-muted-foreground mt-2 md:hidden">
        Swipe left or right to navigate between cards
      </div>
    </div>
  );
};

export default CardNavigation;
