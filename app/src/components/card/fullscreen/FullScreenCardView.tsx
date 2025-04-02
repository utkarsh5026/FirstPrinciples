import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import CustomMarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import CardProgress from "../CardProgress";
import { Menu, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionsSheet from "./SectionsSheet";

interface FullscreenCardViewProps {
  markdown: string;
  className?: string;
  onExit: () => void;
}

interface MarkdownSection {
  id: string;
  title: string;
  content: string;
  level: number;
}

const FullscreenCardView: React.FC<FullscreenCardViewProps> = ({
  markdown,
  className,
  onExit,
}) => {
  const [sections, setSections] = useState<MarkdownSection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const totalCards = sections.length;

  // Parse the markdown into sections
  useEffect(() => {
    if (!markdown) return;

    const parsedSections = parseMarkdownIntoSections(markdown);
    setSections(parsedSections);
    setCurrentIndex(0); // Reset to first card when content changes
  }, [markdown]);

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

  // Scroll to top when changing cards
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  // Parse markdown into sections based on h1 and h2 headings
  const parseMarkdownIntoSections = (markdown: string): MarkdownSection[] => {
    const lines = markdown.split("\n");
    const sections: MarkdownSection[] = [];

    let currentSection: MarkdownSection | null = null;
    let inCodeBlock = false;
    let introContent = "";

    // Main parse pass
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimEnd(); // Keep left indentation but trim right

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

  // Navigation handlers with animations
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

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        No content to display in cards
      </div>
    );
  }

  const currentSection = sections[currentIndex];

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background flex flex-col",
        className
      )}
      ref={cardContainerRef}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="h-8 w-8"
          aria-label="Exit fullscreen"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 text-center" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(true)}
          className="h-8 w-8"
          aria-label="Open sections menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Main content area */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          height: "calc(100vh - 8rem)", // Ensure there's enough space for content
        }}
      >
        {/* Card content */}
        <div
          ref={scrollAreaRef}
          className={cn(
            "h-full overflow-y-auto pb-16",
            isTransitioning ? "opacity-0" : "opacity-100",
            "transition-opacity duration-200"
          )}
        >
          <div className="max-w-2xl mx-auto p-4">
            <div className="prose prose-invert max-w-none w-full break-words">
              <CustomMarkdownRenderer
                markdown={currentSection.content}
                className="fullscreen-card-content"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="max-w-md mx-auto">
          {/* Progress indicator only */}
          <CardProgress
            currentIndex={currentIndex}
            totalCards={sections.length}
            onSelectCard={handleSelectCard}
            className="mb-0"
          />
        </div>
      </div>

      {/* Sections Menu Sheet */}
      <SectionsSheet
        sections={sections}
        currentIndex={currentIndex}
        handleSelectCard={handleSelectCard}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* Touch swipe indicators (hidden visually but help with touch areas) */}
      <div
        className="absolute top-1/2 left-0 h-1/3 w-10 -translate-y-1/2"
        onClick={handlePrevCard}
      />
      <div
        className="absolute top-1/2 right-0 h-1/3 w-10 -translate-y-1/2"
        onClick={handleNextCard}
      />
    </div>
  );
};

export default FullscreenCardView;
