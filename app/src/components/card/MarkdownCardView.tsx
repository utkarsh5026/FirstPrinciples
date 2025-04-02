// src/components/card/MarkdownCardView.tsx
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import CustomMarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import CardNavigation from "./CardNavigation";
import CardSectionsMenu from "./CardSectionsMenu";
import CardIntroModal from "./CardInrtoModal";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./MarkdownCardStyles.css";

interface MarkdownCardViewProps {
  markdown: string;
  className?: string;
  onEnterFullscreen?: () => void;
}

interface MarkdownSection {
  id: string;
  title: string;
  content: string;
  level: number;
}

const MarkdownCardView: React.FC<MarkdownCardViewProps> = ({
  markdown,
  className,
  onEnterFullscreen,
}) => {
  const [sections, setSections] = useState<MarkdownSection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const totalCards = sections.length;

  // Parse the markdown into sections
  useEffect(() => {
    if (!markdown) return;

    const parsedSections = parseMarkdownIntoSections(markdown);
    setSections(parsedSections);
    setCurrentIndex(0); // Reset to first card when content changes
  }, [markdown]);

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

  // Parse markdown into sections based on h1 and h2 headings
  const parseMarkdownIntoSections = (markdown: string): MarkdownSection[] => {
    const lines = markdown.split("\n");
    const sections: MarkdownSection[] = [];

    let currentSection: MarkdownSection | null = null;
    let inCodeBlock = false;
    let introContent = "";

    // Simple debugging helper
    const logDebug = (message: string) => {
      console.log(`[Card Parser] ${message}`);
    };

    logDebug(`Processing ${lines.length} lines of markdown`);

    // Main parse pass
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimEnd(); // Keep left indentation but trim right

      // Check if we're in a code block
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        logDebug(
          `${inCodeBlock ? "Entering" : "Exiting"} code block at line ${i + 1}`
        );

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
        logDebug(`Found H1 heading: "${title}" at line ${i + 1}`);

        if (currentSection) {
          sections.push(currentSection);
        } else if (introContent.trim()) {
          // Handle intro content before first heading
          logDebug(`Adding intro section before first heading`);
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
        logDebug(`Found H2 heading: "${title}" at line ${i + 1}`);

        if (currentSection) {
          sections.push(currentSection);
        } else if (introContent.trim()) {
          // Handle intro content before first heading
          logDebug(`Adding intro section before first H2 heading`);
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
      logDebug(`Added final section: "${currentSection.title}"`);
    } else if (introContent.trim()) {
      // If there's only content without headings
      logDebug(`No sections found, creating single content section`);
      sections.push({
        id: "content",
        title: "Content",
        content: introContent,
        level: 0,
      });
    }

    // Log summary
    logDebug(`Created ${sections.length} sections`);
    sections.forEach((section, index) => {
      logDebug(
        `Section ${index + 1}: "${section.title}" (Level ${section.level})`
      );
    });

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

  // Navigation handlers
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

  const handleFullscreenClick = () => {
    if (onEnterFullscreen) {
      onEnterFullscreen();
    }
  };

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No content to display in cards
      </div>
    );
  }

  const currentSection = sections[currentIndex];

  return (
    <div className={cn("flex flex-col", className)} ref={cardContainerRef}>
      {/* Card Header with Sections Menu */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span
            className={cn(
              "inline-block px-2 py-1 text-xs font-medium rounded",
              currentSection.level === 1
                ? "bg-primary/10 text-primary"
                : "bg-secondary/20 text-secondary-foreground"
            )}
          >
            {currentSection.level === 1 ? "Title" : "Section"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Fullscreen button */}
          {onEnterFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreenClick}
              className="h-8 px-2"
              title="Enter fullscreen mode"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}

          <CardSectionsMenu
            sections={sections}
            currentIndex={currentIndex}
            onSelectSection={(index) => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(index);
                setIsTransitioning(false);
              }, 200);
            }}
          />
        </div>
      </div>

      {/* Card Container with swipe indicators */}
      <div className="card-container relative">
        {/* Left swipe indicator - shown when not at first card */}
        {currentIndex > 0 && (
          <div className="swipe-indicator swipe-indicator-left"></div>
        )}

        {/* Right swipe indicator - shown when not at last card */}
        {currentIndex < sections.length - 1 && (
          <div className="swipe-indicator swipe-indicator-right"></div>
        )}

        {/* Actual Card */}
        <div
          className={cn(
            "flex-1 mb-4 rounded-xl border border-border bg-card shadow-sm transition-opacity duration-200",
            isTransitioning ? "opacity-0" : "opacity-100"
          )}
        >
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-border/40">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="truncate">{currentSection.title}</span>
            </h3>
          </div>

          {/* Card Content */}
          <div className="p-6 markdown-card-content overflow-y-auto max-h-[60vh] md:max-h-[65vh]">
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
        onSelectCard={(index) => {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentIndex(index);
            setIsTransitioning(false);
          }, 200);
        }}
      />

      {/* Swipe hint for mobile with animation */}
      <div className="swipe-hint text-xs text-center text-muted-foreground mt-4 md:hidden">
        Swipe left or right to navigate between cards
      </div>

      {/* Intro modal for first-time users */}
      <CardIntroModal />
    </div>
  );
};

export default MarkdownCardView;
