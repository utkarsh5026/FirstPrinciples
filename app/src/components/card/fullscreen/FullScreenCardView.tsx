import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import CustomMarkdownRenderer from "@/components/markdown/MarkdownRenderer";
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
import { MarkdownSection } from "@/components/card/MarkdownCardView";
import { useTheme } from "@/components/theme/context/ThemeContext";
import useMobile from "@/hooks/useMobile";

interface FullscreenCardViewProps {
  markdown: string;
  className?: string;
  onExit: () => void;
  parsedSections?: MarkdownSection[];
}

const FullscreenCardView: React.FC<FullscreenCardViewProps> = ({
  markdown,
  className,
  onExit,
  parsedSections,
}) => {
  const [sections, setSections] = useState<MarkdownSection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [useGradientBg, setUseGradientBg] = useState(() => {
    return localStorage.getItem("useGradientBackground") !== "false";
  });

  // References
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Touch handling state
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const swipingRef = useRef(false);
  const scrollingRef = useRef(false);

  const totalCards = sections.length;
  const { currentTheme } = useTheme();
  const { isMobile } = useMobile();

  // Calculate background style based on user preference - make sure we use pointer-events: auto
  const gradientStyle = useGradientBg
    ? {
        backgroundImage: `
          linear-gradient(135deg, #1a1a1a 0%, ${currentTheme.primary}08 100%)
        `,
        backgroundSize: "100% 100%",
        pointerEvents: "auto" as const,
      }
    : {
        background: `#121212`,
        pointerEvents: "auto" as const,
      };

  // Parse the markdown into sections if not already provided
  useEffect(() => {
    if (!markdown) return;

    if (parsedSections && parsedSections.length > 0) {
      setSections(parsedSections);
    } else {
      const newSections = parseMarkdownIntoSections(markdown);
      setSections(newSections);
    }

    // Try to restore previous position
    const savedPosition = localStorage.getItem("lastReadPosition");
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);
      if (!isNaN(position)) {
        setCurrentIndex(position);
      }
    } else {
      setCurrentIndex(0);
    }
  }, [markdown, parsedSections]);

  // Scroll to top when changing cards
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    // Save current position
    localStorage.setItem("lastReadPosition", currentIndex.toString());
  }, [currentIndex]);

  // Auto-hide controls after inactivity in immersive mode
  useEffect(() => {
    if (!immersiveMode) {
      setShowControls(true);
      return;
    }

    const handleUserActivity = () => {
      setShowControls(true);

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    // Set up event listeners
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    // Initial timeout
    handleUserActivity();

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [immersiveMode]);

  // Improved touch handling - Separate from the render cycle for better performance
  useEffect(() => {
    const container = cardContainerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      swipingRef.current = false;
      scrollingRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // If we've already determined this is a scroll, let it happen naturally
      if (scrollingRef.current) return;

      // If we've already determined this is a swipe, prevent default scrolling
      if (swipingRef.current) {
        e.preventDefault();
        return;
      }

      // Determine if this is primarily a horizontal or vertical movement
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        // Horizontal swipe
        swipingRef.current = true;
        e.preventDefault();
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
        // Vertical scroll
        scrollingRef.current = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const touchDuration = Date.now() - touchStartRef.current.time;

      // Handle single tap
      if (
        touchDuration < 300 &&
        Math.abs(deltaX) < 10 &&
        Math.abs(deltaY) < 10
      ) {
        // Toggle controls on tap if in immersive mode
        if (immersiveMode) {
          setShowControls((prev) => !prev);
        }
      }

      // Handle swipe with reasonable threshold
      if (swipingRef.current) {
        const swipeThreshold = 50;
        const isQuickSwipe = touchDuration < 300 && Math.abs(deltaX) > 30;

        if (
          (deltaX < -swipeThreshold || (isQuickSwipe && deltaX < 0)) &&
          currentIndex < totalCards - 1
        ) {
          // Swipe left - next card
          handleNextCard();
        } else if (
          (deltaX > swipeThreshold || (isQuickSwipe && deltaX > 0)) &&
          currentIndex > 0
        ) {
          // Swipe right - previous card
          handlePrevCard();
        }
      }

      // Reset touch state
      touchStartRef.current = { x: 0, y: 0, time: 0 };
    };

    // Add passive: false to ensure we can preventDefault() when needed
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentIndex, totalCards, immersiveMode]);

  // Toggle immersive reading mode
  const toggleImmersiveMode = useCallback(() => {
    setImmersiveMode((prev) => !prev);
    setShowControls(true);
  }, []);

  // Toggle between gradient and solid background
  const toggleBackgroundStyle = useCallback(() => {
    const newValue = !useGradientBg;
    setUseGradientBg(newValue);
    localStorage.setItem("useGradientBackground", newValue.toString());

    // Ensure event handlers are still working after toggle
    // Give browser time to process the state change
    setTimeout(() => {
      if (cardContainerRef.current) {
        // Re-enable pointer events explicitly
        cardContainerRef.current.style.pointerEvents = "auto";
      }
    }, 0);
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
      const line = rawLine.trimEnd();

      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        if (currentSection) {
          currentSection.content += line + "\n";
        } else {
          introContent += line + "\n";
        }
        continue;
      }

      if (inCodeBlock) {
        if (currentSection) {
          currentSection.content += line + "\n";
        } else {
          introContent += line + "\n";
        }
        continue;
      }

      const h1Match = line.match(/^#\s+(.+)$/);
      const h2Match = line.match(/^##\s+(.+)$/);

      if (h1Match) {
        const title = h1Match[1].trim();

        if (currentSection) {
          sections.push(currentSection);
        } else if (introContent.trim()) {
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
        const title = h2Match[1].trim();

        if (currentSection) {
          sections.push(currentSection);
        } else if (introContent.trim()) {
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
        currentSection.content += line + "\n";
      } else {
        introContent += line + "\n";
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    } else if (introContent.trim()) {
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

  // Navigation handlers with smooth animations but minimal DOM updates
  const handlePrevCard = useCallback(() => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => prevIndex - 1);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentIndex, isTransitioning]);

  const handleNextCard = useCallback(() => {
    if (currentIndex < sections.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentIndex, isTransitioning, sections.length]);

  // Jump to a specific card
  const handleSelectCard = useCallback(
    (index: number) => {
      if (index !== currentIndex && !isTransitioning) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex(index);
          setIsTransitioning(false);
        }, 150);
      }
    },
    [currentIndex, isTransitioning]
  );

  // Double-tap detection
  const handleDoubleClick = useCallback(() => {
    toggleImmersiveMode();
  }, [toggleImmersiveMode]);

  // Show loading state if no sections
  if (sections.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  const currentSection = sections[currentIndex];

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col overflow-hidden bg-background",
        className
      )}
      ref={cardContainerRef}
      style={{ ...gradientStyle, pointerEvents: "auto" }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Header with actions - conditionally shown */}
      <div
        className={cn(
          "sticky top-0 z-40 flex items-center justify-between px-4 h-14 transition-all duration-200 ease-in-out",
          immersiveMode
            ? "bg-transparent"
            : "bg-card/50 backdrop-blur-sm border-b border-border/30",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none",
          "transform transition-transform",
          !showControls && "translate-y-[-100%]"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="h-9 w-9 rounded-full bg-card/30 hover:bg-card/50"
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
            className="h-9 w-9 rounded-full bg-card/30 hover:bg-card/50"
            aria-label="Open sections menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main content area with proper scroll behavior */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          height: showControls ? "calc(100vh - 8rem)" : "100vh",
          transition: "height 0.2s ease-in-out",
        }}
      >
        {/* Side navigation buttons - for desktop */}
        {showControls && !isMobile && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevCard}
              disabled={currentIndex === 0}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full",
                "bg-card/30 border-border/30 backdrop-blur-sm transition-opacity duration-200",
                currentIndex === 0
                  ? "opacity-30"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextCard}
              disabled={currentIndex === sections.length - 1}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full",
                "bg-card/30 border-border/30 backdrop-blur-sm transition-opacity duration-200",
                currentIndex === sections.length - 1
                  ? "opacity-30"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Mobile swipe indicators */}
        {isMobile && (
          <>
            <div
              className={cn(
                "absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-primary/10 to-transparent",
                "pointer-events-none opacity-0 transition-opacity duration-150 z-20",
                currentIndex > 0 && swipingRef.current
                  ? "opacity-70"
                  : "opacity-0"
              )}
            />
            <div
              className={cn(
                "absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-primary/10 to-transparent",
                "pointer-events-none opacity-0 transition-opacity duration-150 z-20",
                currentIndex < sections.length - 1 && swipingRef.current
                  ? "opacity-70"
                  : "opacity-0"
              )}
            />
          </>
        )}

        {/* Content with improved scrolling */}
        <div
          ref={contentRef}
          className={cn(
            "h-full overflow-y-auto overscroll-contain px-0 md:px-8",
            isTransitioning ? "opacity-0" : "opacity-100",
            "transition-opacity duration-150 ease-in-out",
            // Enable better scrolling on mobile
            "touch-pan-y"
          )}
          style={{
            WebkitOverflowScrolling: "touch",
            pointerEvents: "auto",
          }}
        >
          <div
            className={cn(
              "max-w-2xl mx-auto px-4 md:px-8 py-6",
              immersiveMode ? "pt-16" : "",
              isTransitioning ? "transform scale-95" : "transform scale-100",
              "transition-transform duration-150 ease-in-out"
            )}
          >
            <div
              className={cn(
                "prose prose-invert max-w-none",
                "prose-headings:text-foreground/90 prose-p:text-foreground/80",
                "prose-strong:text-primary/90 prose-code:text-primary-foreground/90",
                "prose-pre:bg-card/50 prose-pre:border prose-pre:border-border/20",
                "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                "prose-img:rounded-lg prose-img:mx-auto",
                // Enhanced mobile typography
                isMobile
                  ? "prose-p:text-base prose-p:leading-relaxed prose-headings:leading-tight"
                  : ""
              )}
              style={{ pointerEvents: "auto" }}
            >
              <CustomMarkdownRenderer
                markdown={currentSection.content}
                className="fullscreen-card-content"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer with navigation controls */}
      <div
        className={cn(
          "sticky bottom-0 z-40 transition-all duration-200 ease-in-out py-3",
          immersiveMode
            ? "bg-transparent"
            : "bg-card/50 backdrop-blur-sm border-t border-border/30",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none",
          "transform transition-transform",
          !showControls && "translate-y-[100%]"
        )}
      >
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-center">
            {/* Mobile navigation buttons */}
            {isMobile && (
              <div className="flex items-center justify-between w-full max-w-xs mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevCard}
                  disabled={currentIndex === 0}
                  className={cn(
                    "px-3 py-1 h-8 rounded-full",
                    "bg-card/30 border-border/30",
                    currentIndex === 0 ? "opacity-50" : ""
                  )}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="text-xs">Previous</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextCard}
                  disabled={currentIndex === sections.length - 1}
                  className={cn(
                    "px-3 py-1 h-8 rounded-full",
                    "bg-card/30 border-border/30",
                    currentIndex === sections.length - 1 ? "opacity-50" : ""
                  )}
                >
                  <span className="text-xs">Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          <CardProgress
            currentIndex={currentIndex}
            totalCards={sections.length}
            onSelectCard={handleSelectCard}
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
    </div>
  );
};

export default FullscreenCardView;
