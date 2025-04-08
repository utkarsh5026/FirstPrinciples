import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import CustomMarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import CardProgress from "../CardProgress";
import {
  Menu,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SectionsSheet from "./sidebar/SectionsSheet";
import { MarkdownSection } from "@/components/card/MarkdownCardView"; // Import shared type
import { useTheme } from "@/components/theme/context/ThemeContext";
import useMobile from "@/hooks/useMobile";

interface FullscreenCardViewProps {
  markdown: string;
  className?: string;
  onExit: () => void;
  parsedSections?: MarkdownSection[]; // Accept pre-parsed sections
}

const FullscreenCardView: React.FC<FullscreenCardViewProps> = ({
  markdown,
  className,
  onExit,
  parsedSections, // Use pre-parsed sections if provided
}) => {
  const [sections, setSections] = useState<MarkdownSection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [useGradientBg, setUseGradientBg] = useState(() => {
    // Initialize from localStorage or default to true
    return localStorage.getItem("useGradientBackground") !== "false";
  });

  const cardContainerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const totalCards = sections.length;

  // Get theme colors for gradient
  const { currentTheme } = useTheme();
  const { isMobile } = useMobile();

  // Calculate background style based on user preference
  const gradientStyle = useGradientBg
    ? {
        background: `linear-gradient(135deg, #202020 0%, ${currentTheme.primary}15 100%)`,
        // Add subtle pattern overlay
        backgroundImage: `
      linear-gradient(135deg, #202020 0%, ${currentTheme.primary}15 100%), 
      radial-gradient(${currentTheme.primary}05 1px, transparent 1px)
    `,
        backgroundSize: "100% 100%, 20px 20px",
      }
    : {
        background: `#202020`,
      };

  // Parse the markdown into sections if not already provided
  useEffect(() => {
    if (!markdown) return;

    if (parsedSections && parsedSections.length > 0) {
      // Use the pre-parsed sections if provided
      console.log("Using pre-parsed sections in fullscreen view");
      setSections(parsedSections);
    } else {
      // Fallback to parsing directly (should never happen with proper implementation)
      console.time("FullscreenView - Parse Markdown");
      const newSections = parseMarkdownIntoSections(markdown);
      setSections(newSections);
      console.timeEnd("FullscreenView - Parse Markdown");
    }

    setCurrentIndex(0); // Reset to first card when content changes
  }, [markdown, parsedSections]);

  // Scroll to top when changing cards
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

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
      // Toggle immersive mode on double tap
      toggleImmersiveMode();
    },
  });

  // Auto-hide controls after inactivity
  useEffect(() => {
    const handleUserActivity = () => {
      setShowControls(true);

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      if (immersiveMode) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    // Set event listeners
    const container = cardContainerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleUserActivity);
      container.addEventListener("mousemove", handleUserActivity);
      container.addEventListener("click", handleUserActivity);
    }

    // Initial timeout
    if (immersiveMode) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    // Cleanup
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      if (container) {
        container.removeEventListener("touchstart", handleUserActivity);
        container.removeEventListener("mousemove", handleUserActivity);
        container.removeEventListener("click", handleUserActivity);
      }
    };
  }, [immersiveMode]);

  // Handle touch events for tap detection
  const handleTouchStart = useCallback(() => {
    setTouchStartTime(Date.now());
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartTime) {
      const touchDuration = Date.now() - touchStartTime;

      // If it was a quick tap in the center area, toggle controls
      if (touchDuration < 200) {
        setShowControls((prev) => !prev);
      }

      setTouchStartTime(null);
    }
  }, [touchStartTime]);

  // Toggle immersive reading mode
  const toggleImmersiveMode = useCallback(() => {
    setImmersiveMode((prev) => !prev);
    setShowControls(true);
  }, []);

  // Toggle between gradient and solid background
  const toggleBackgroundStyle = useCallback(() => {
    const newValue = !useGradientBg;
    setUseGradientBg(newValue);
    // Save preference to localStorage
    localStorage.setItem("useGradientBackground", newValue.toString());
  }, [useGradientBg]);

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
        "fixed inset-0 z-50 flex flex-col overflow-hidden",
        className
      )}
      ref={cardContainerRef}
      style={gradientStyle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Overlay gradient for depth - only show when gradient mode is enabled */}
      {useGradientBg && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.2) 100%)`,
            mixBlendMode: "multiply",
          }}
        />
      )}

      {/* Header - conditionally shown based on immersive mode */}
      <div
        className={cn(
          "sticky top-0 z-20 flex items-center justify-between p-4 backdrop-blur-sm transition-all duration-300",
          immersiveMode
            ? "bg-transparent"
            : "bg-card/50 border-b border-border",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="h-10 w-10 rounded-full bg-card/30 hover:bg-card/40"
          aria-label="Exit fullscreen"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-card/30">
                  <Droplets className="h-4 w-4 text-primary" />
                  <Switch
                    checked={useGradientBg}
                    onCheckedChange={toggleBackgroundStyle}
                    className="data-[state=checked]:bg-primary/40"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  {useGradientBg ? "Disable" : "Enable"} gradient background
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(true)}
            className="h-10 w-10 rounded-full bg-card/30 hover:bg-card/40"
            aria-label="Open sections menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main content area with enhanced aesthetics */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          height: immersiveMode ? "100vh" : "calc(100vh - 8rem)", // Adjust height based on immersive mode
        }}
      >
        {/* Side navigation buttons - conditionally shown */}
        {showControls && !isMobile && (
          <>
            <div
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-300",
                currentIndex === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-60 hover:opacity-100 cursor-pointer"
              )}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevCard}
                disabled={currentIndex === 0}
                className="h-12 w-12 rounded-full bg-card/30 border-border/30 backdrop-blur-sm"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>

            <div
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-300",
                currentIndex === sections.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-60 hover:opacity-100 cursor-pointer"
              )}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextCard}
                disabled={currentIndex === sections.length - 1}
                className="h-12 w-12 rounded-full bg-card/30 border-border/30 backdrop-blur-sm"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </>
        )}

        {/* Card content with improved scrolling */}
        <div
          ref={scrollAreaRef}
          className={cn(
            "h-full overflow-y-auto pb-16 px-4 md:px-0 scrollbar-hide",
            isTransitioning ? "opacity-0" : "opacity-100",
            "transition-opacity duration-200"
          )}
        >
          <div
            className={cn(
              "max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-8",
              immersiveMode ? "pt-16" : ""
            )}
          >
            <div
              className={cn(
                "prose prose-invert max-w-none w-full break-words",
                "prose-headings:text-foreground/90 prose-p:text-foreground/80",
                "prose-strong:text-primary/90 prose-code:text-primary-foreground/90",
                "prose-pre:bg-card/50 prose-pre:border prose-pre:border-border/30",
                "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                "prose-img:rounded-lg prose-img:mx-auto",
                // Enhanced mobile typography
                isMobile ? "prose-p:text-base prose-p:leading-relaxed" : ""
              )}
            >
              <CustomMarkdownRenderer
                markdown={currentSection.content}
                className="fullscreen-card-content"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer - conditionally shown */}
      <div
        className={cn(
          "sticky bottom-0 backdrop-blur-sm transition-all duration-300",
          immersiveMode
            ? "bg-transparent"
            : "bg-card/50 border-t border-border",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="max-w-md mx-auto p-4">
          {/* Progress indicator with improved visuals */}
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
        className="absolute top-1/3 bottom-1/3 left-0 w-16 -translate-y-1/2 opacity-0"
        onClick={handlePrevCard}
      />
      <div
        className="absolute top-1/3 bottom-1/3 right-0 w-16 -translate-y-1/2 opacity-0"
        onClick={handleNextCard}
      />
    </div>
  );
};

export default FullscreenCardView;
