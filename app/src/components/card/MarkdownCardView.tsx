import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import CustomMarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import CardNavigation from "./CardNavigation";
import CardSectionsMenu from "./CardSectionsMenu";
import CardIntroModal from "./into/CardInrtoModal";
import useMobile from "@/hooks/useMobile";
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
  const [isSectionsMenuOpen, setIsSectionsMenuOpen] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const totalCards = sections.length;
  const { isMobile } = useMobile();

  // Parse the markdown into sections if not already provided
  useEffect(() => {
    if (!markdown) return;

    if (parsedSections && parsedSections.length > 0) {
      // Use the pre-parsed sections if provided
      setSections(parsedSections);
    } else {
      // Fallback to parsing directly
      console.time("CardView - Parse Markdown");
      const newSections = parseMarkdownIntoSections(markdown);
      setSections(newSections);
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
    onDoubleTap: () => {
      // Open sections menu on double tap (mobile only)
      if (isMobile) {
        setIsSectionsMenuOpen(true);
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

  // Legacy parser - only used as fallback
  const parseMarkdownIntoSections = (markdown: string): MarkdownSection[] => {
    const lines = markdown.split("\n");
    const sections: MarkdownSection[] = [];

    let currentSection: MarkdownSection | null = null;
    let inCodeBlock = false;
    let introContent = "";

    // Main parse pass
    for (const rawLine of lines) {
      const line = rawLine.trimEnd(); // Keep left indentation but trim right

      // Check if we're in a code block
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        if (currentSection) {
          currentSection.content += line + "\n";
        } else {
          introContent += line + "\n";
        }
        continue;
      }

      // Skip heading detection inside code blocks
      if (inCodeBlock) {
        if (currentSection) {
          currentSection.content += line + "\n";
        } else {
          introContent += line + "\n";
        }
        continue;
      }

      // Detect headings - more flexible regex patterns
      // Match h1: # Heading text (any number of spaces after #)
      const h1Match = line.match(/^#\s+(.+)$/);
      // Match h2: ## Heading text (any number of spaces after ##)
      const h2Match = line.match(/^##\s+(.+)$/);
      // Match h3: ### Heading text (any number of spaces after ###)
      const h3Match = line.match(/^###\s+(.+)$/);

      if (h1Match) {
        // H1 heading found
        const title = h1Match[1].trim();

        if (currentSection) {
          sections.push(currentSection);
        } else if (introContent.trim()) {
          // Handle intro content before first heading
          sections.push({
            id: "introduction",
            title: "Introduction",
            content: introContent,
            level: 0,
          });
          introContent = "";
        }

        currentSection = {
          id: slugify(title),
          title,
          content: line + "\n",
          level: 1,
        };
      } else if (h2Match) {
        // H2 heading found
        const title = h2Match[1].trim();

        if (currentSection) {
          sections.push(currentSection);
        } else if (introContent.trim()) {
          // Handle intro content before first heading
          sections.push({
            id: "introduction",
            title: "Introduction",
            content: introContent,
            level: 0,
          });
          introContent = "";
        }

        currentSection = {
          id: slugify(title),
          title,
          content: line + "\n",
          level: 2,
        };
      } else if (h3Match && !currentSection) {
        // Only create a new section from H3 if we don't have a current section
        const title = h3Match[1].trim();

        if (introContent.trim()) {
          sections.push({
            id: "introduction",
            title: "Introduction",
            content: introContent,
            level: 0,
          });
          introContent = "";
        }

        currentSection = {
          id: slugify(title),
          title,
          content: line + "\n",
          level: 3,
        };
      } else if (currentSection) {
        // Add content to the current section
        currentSection.content += line + "\n";
      } else {
        // Content before the first heading
        introContent += line + "\n";
      }
    }

    // Add the last section
    if (currentSection) {
      sections.push(currentSection);
    } else if (introContent.trim()) {
      // If there's only content without headings
      sections.push({
        id: "content",
        title: "Content",
        content: introContent,
        level: 0,
      });
    }

    return sections;
  };

  // Helper function to create URL-friendly slug IDs
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

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
    setIsSectionsMenuOpen(false);
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
    <div className={cn("flex flex-col", className)} ref={cardContainerRef}>
      {/* Card Container with swipe indicators */}
      <div className="card-container relative">
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
            "flex-1 mb-4 rounded-xl border border-border shadow-sm transition-opacity duration-200",
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

      {/* Swipe hint for mobile with animation - only shown on mobile */}
      {isMobile && (
        <div className="swipe-hint text-xs text-center text-muted-foreground mt-4 md:hidden">
          Swipe left or right to navigate between cards
        </div>
      )}

      {/* Interactive sections menu */}
      {isSectionsMenuOpen && (
        <CardSectionsMenu
          sections={sections.map((section) => ({
            id: section.id,
            title: section.title,
            level: section.level,
          }))}
          currentIndex={currentIndex}
          onSelectSection={handleSelectCard}
          onClose={() => setIsSectionsMenuOpen(false)}
        />
      )}

      {/* Intro modal for first-time users */}
      <CardIntroModal />
    </div>
  );
};

export default MarkdownCardView;
