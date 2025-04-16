import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import CustomMarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import CardNavigation from "./nav/CardNavigation";
import CardIntroModal from "./into/CardInrtoModal";
import "./MarkdownCardStyles.css";

export interface MarkdownSection {
  id: string;
  title: string;
  content: string;
  level: number;
}

interface MarkdownCardViewProps {
  markdown: string;
  className?: string;
  parsedSections?: MarkdownSection[]; // Accept pre-parsed sections
}

const MarkdownCardView: React.FC<MarkdownCardViewProps> = ({
  markdown,
  className,
  parsedSections,
}) => {
  const [sections, setSections] = useState<MarkdownSection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const totalCards = sections.length;

  // Parse the markdown into sections if not already provided
  useEffect(() => {
    if (!markdown) return;

    if (parsedSections && parsedSections.length > 0) {
      // Use the pre-parsed sections if provided
      setSections(parsedSections);
    } else {
      // Fallback to parsing directly
      console.time("CardView - Parse Markdown");
      console.timeEnd("CardView - Parse Markdown");
    }

    // Try to restore last read position from localStorage
    const storedPosition = localStorage.getItem("lastReadPosition");
    if (storedPosition) {
      const position = parseInt(storedPosition, 10);
      if (!isNaN(position)) {
        setCurrentIndex(position);
      }
    } else {
      setCurrentIndex(0); // Reset to first card when content changes
    }
  }, [markdown, parsedSections]);

  // Set up swipe gestures for navigation
  useSwipeGesture({
    targetRef: cardContainerRef as React.RefObject<HTMLElement>,
    threshold: 50,
    onSwipeLeft: () => {
      if (currentIndex < totalCards - 1) {
        handleNextCard();
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        handlePrevCard();
      }
    },
  });

  // Save reading position when navigating
  useEffect(() => {
    // Save current position to localStorage
    localStorage.setItem("lastReadPosition", currentIndex.toString());

    // Scroll card content to top when changing cards
    if (cardContentRef.current) {
      cardContentRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  // Navigation handlers with smooth transitions
  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsTransitioning(false);
      }, 200);
    }
  };

  const handleNextCard = () => {
    if (currentIndex < sections.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsTransitioning(false);
      }, 200);
    }
  };

  // Jump to a specific card
  const handleSelectCard = (index: number) => {
    if (index !== currentIndex) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 200);
    }
  };

  // Show a message if no content is available
  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-primary text-xl">!</span>
          </div>
          <p className="font-medium">No content to display in cards</p>
          <p className="text-sm mt-1 text-muted-foreground/70">
            This document might be empty or failed to parse into sections
          </p>
        </div>
      </div>
    );
  }

  const currentSection = sections[currentIndex];
  const isLastCard = currentIndex === sections.length - 1;
  const isFirstCard = currentIndex === 0;

  return (
    <div
      className={cn("flex flex-col border-primary/20 rounded-4xl", className)}
      ref={cardContainerRef}
    >
      {/* Card Container with swipe indicators */}
      <div className="card-container relative flex-1 flex flex-col rounded-4xl">
        {/* Left swipe indicator - shown when not at first card */}
        {!isFirstCard && (
          <div className="swipe-indicator swipe-indicator-left"></div>
        )}

        {/* Right swipe indicator - shown when not at last card */}
        {!isLastCard && (
          <div className="swipe-indicator swipe-indicator-right"></div>
        )}

        {/* Actual Card */}
        <div
          className={cn(
            "flex-1 mb-4 rounded-xl  border-border shadow-sm transition-opacity duration-200",
            isTransitioning ? "opacity-0" : "opacity-100",
            "bg-card/80 backdrop-blur-sm"
          )}
        >
          {/* Card Content */}
          <div
            ref={cardContentRef}
            className="p-6 markdown-card-content overflow-y-auto max-h-[50vh] md:max-h-[65vh]"
          >
            <CustomMarkdownRenderer markdown={currentSection.content} />
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Controls */}
      <CardNavigation
        currentIndex={currentIndex}
        totalCards={sections.length}
        onPrevious={handlePrevCard}
        onNext={handleNextCard}
        onSelectCard={handleSelectCard}
      />

      <CardIntroModal />
    </div>
  );
};

export default MarkdownCardView;
