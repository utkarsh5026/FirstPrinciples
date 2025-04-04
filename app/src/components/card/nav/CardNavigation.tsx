import React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardProgress from "../CardProgress";

interface CardNavigationProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelectCard?: (index: number) => void;
  className?: string;
}

/**
 * CardNavigation component renders navigation controls for a card-based interface.
 * It includes progress dots, navigation buttons for desktop, and a hint for mobile navigation.
 *
 * @param {CardNavigationProps} props - The component props.
 * @param {number} props.currentIndex - The current index of the card.
 * @param {number} props.totalCards - The total number of cards.
 * @param {() => void} props.onPrevious - Function to call when the previous button is clicked.
 * @param {() => void} props.onNext - Function to call when the next button is clicked.
 * @param {(index: number) => void} props.onSelectCard - Function to call when a card is selected.
 * @param {string} [props.className] - Additional class names for the component.
 *
 * @returns {React.ReactElement} The CardNavigation component.
 */
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
          <span className="hidden sm:inline font-cascadia-code">Previous</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentIndex === totalCards - 1}
          className={cn(
            "px-4 transition-all rounded-lg",
            currentIndex === totalCards - 1
              ? "opacity-50 cursor-not-allowed"
              : ""
          )}
        >
          <span className="hidden sm:inline font-cascadia-code">Next</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CardNavigation;
