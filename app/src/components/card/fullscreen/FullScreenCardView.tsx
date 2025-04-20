import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import CustomMarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { useSwipeGesture } from "@/hooks/device/useSwipeGesture";
import CardProgress from "./CardProgress";
import {
  Menu,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionsSheet from "./sidebar/SectionsSheet";
import { useSectionStore, useCurrentDocumentStore } from "@/stores";
import useMobile from "@/hooks/device/use-mobile";
import Stats from "./stats/Stats";
import { AnimatePresence } from "framer-motion";

interface FullscreenCardViewProps {
  className?: string;
  onExit: () => void;
}

/**
 * ✨ FullscreenCardView ✨
 *
 * A beautiful immersive reading experience that transforms your content into a
 * distraction-free fullscreen mode! 📚✨
 *
 * 🧠 Smart reading tracking keeps tabs on your progress and reading habits
 * 🔄 Smooth transitions between sections with elegant fade effects
 * 📱 Responsive design that works beautifully on both desktop and mobile
 * 👆 Touch-friendly with intuitive swipe gestures for navigation
 * 📊 Reading analytics to help you understand your reading patterns
 * 🗂️ Easy section navigation with a handy sidebar menu
 *
 * This component creates a zen-like reading environment where you can focus
 * completely on the content without distractions. Perfect for deep reading
 * sessions or studying important material! 🧘‍♀️
 */
const FullscreenCardView: React.FC<FullscreenCardViewProps> = ({
  className,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const { isMobile } = useMobile();

  const scrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  const markdown = useCurrentDocumentStore((state) => state.markdown);
  const sections = useCurrentDocumentStore((state) => state.sections);
  const documentPath = useCurrentDocumentStore((state) => state.docPath);
  const category = useCurrentDocumentStore((state) => state.category);

  const startReading = useSectionStore((state) => state.startReading);
  const endReading = useSectionStore((state) => state.endReading);
  const loadReadSections = useSectionStore((state) => state.loadReadSections);

  // Track read sections
  const [readSections, setReadSections] = useState<Set<string>>(new Set());

  /**
   * 📚 Load read sections when document changes
   */
  useEffect(() => {
    const fetchReadSections = async () => {
      if (documentPath) {
        await loadReadSections(documentPath);
        const readSectionsArray = useSectionStore.getState().getReadSections();
        setReadSections(new Set(readSectionsArray));
      }
    };

    fetchReadSections();
  }, [documentPath, loadReadSections]);

  /**
   * 📚 Initializes the reading when the markdown is loaded
   */
  useEffect(() => {
    if (!markdown) return;
    setCurrentIndex(0);
  }, [markdown]);

  /**
   * 📚 Initializes the reading when the sections are loaded
   */
  useEffect(() => {
    const initializeReading = async () => {
      if (sections.length === 0) return;

      const currentSection = sections[currentIndex];
      await startReading(
        documentPath,
        currentSection.id,
        category,
        currentSection.wordCount,
        currentSection.title
      );
      startTimeRef.current = Date.now();
    };

    initializeReading();

    return () => {
      endReading();
    };
  }, [
    sections,
    currentIndex,
    documentPath,
    category,
    startReading,
    endReading,
  ]);

  /**
   * 🔄 Smoothly transitions to a new section with a nice fade effect
   * Tracks reading time and updates analytics too! 📊
   */
  const changeSection = async (newIndex: number) => {
    await endReading();

    setIsTransitioning(true);

    setTimeout(async () => {
      setCurrentIndex(newIndex);
      setIsTransitioning(false);

      const newSection = sections[newIndex];
      await startReading(
        documentPath,
        newSection.id,
        category,
        newSection.wordCount,
        newSection.title
      );

      startTimeRef.current = Date.now();

      // Update read sections
      setReadSections((prev) => {
        const updated = new Set(prev);
        updated.add(newSection.id);
        return updated;
      });
    }, 200);
  };

  /**
   * 👆 Makes swiping work like magic for touch devices!
   * Swipe left to go forward, right to go back
   */
  useSwipeGesture({
    targetRef: scrollRef as React.RefObject<HTMLElement>,
    threshold: 50,
    onSwipeLeft: () => {
      if (currentIndex < sections.length - 1) {
        changeSection(currentIndex + 1);
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        changeSection(currentIndex - 1);
      }
    },
  });

  /**
   * 📜 Scrolls back to the top when changing sections
   * No one likes starting in the middle! 😉
   */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [currentIndex]);

  /**
   * ⬅️ Go to previous section with a smooth transition
   */
  const handlePrevCard = () => {
    if (currentIndex > 0) changeSection(currentIndex - 1);
  };

  /**
   * ➡️ Go to next section with a smooth transition
   */
  const handleNextCard = () => {
    if (currentIndex < sections.length - 1) changeSection(currentIndex + 1);
  };

  /**
   * 🎯 Jump directly to a specific section
   */
  const handleSelectCard = (index: number) => {
    if (index !== currentIndex) changeSection(index);
  };

  /**
   * 🚪 Safely exit fullscreen mode while saving reading progress
   */
  const handleExit = async () => {
    await endReading();
    onExit();
  };

  /**
   * 📊 Toggle stats panel visibility
   */
  const toggleStats = () => {
    setStatsOpen(!statsOpen);
    if (menuOpen) setMenuOpen(false);
  };

  if (sections.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto mb-4"></div>
          <p>Loading content...</p>
        </div>
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
    >
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExit}
          className="h-8 w-8"
          aria-label="Exit fullscreen"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleStats}
            className="h-8 w-8"
            aria-label="View reading stats"
          >
            <BarChart2 className="h-4 w-4" />
          </Button>

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
      </div>

      {/* Main content area */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{ height: "calc(100vh - 8rem)" }}
      >
        {/* Card content */}
        <div
          ref={scrollRef}
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
          <CardProgress
            currentIndex={currentIndex}
            totalCards={sections.length}
            onSelectCard={handleSelectCard}
            className="mb-2"
          />

          {!isMobile && (
            <div className="flex justify-between mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevCard}
                disabled={currentIndex === 0}
                className="h-9 gap-1 rounded-full font-cascadia-code cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Previous</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextCard}
                disabled={currentIndex === sections.length - 1}
                className="h-9 gap-1 rounded-full font-cascadia-code cursor-pointer"
              >
                <span className="sr-only sm:not-sr-only">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sections Menu Sheet with read sections */}
      <SectionsSheet
        currentIndex={currentIndex}
        handleSelectCard={handleSelectCard}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        sections={sections}
        readSections={readSections}
        setReadSections={(newSections) => {
          setReadSections(newSections);
          if (newSections.size === 0) {
            useSectionStore.getState().loadReadSections(documentPath);
          }
        }}
      />

      {/* Reading Stats Panel */}
      <AnimatePresence>
        {statsOpen && (
          <Stats
            toggleStats={toggleStats}
            documentPath={documentPath}
            category={category}
            sections={sections}
            currentIndex={currentIndex}
            readSections={readSections}
          />
        )}
      </AnimatePresence>

      {/* Touch swipe indicators (hidden visually but help with touch areas) */}
      <button
        className="absolute top-1/2 left-0 h-1/3 w-10 -translate-y-1/2 z-10 opacity-0"
        onClick={handlePrevCard}
        title="Previous"
        disabled={currentIndex === 0}
      />
      <button
        className="absolute top-1/2 right-0 h-1/3 w-10 -translate-y-1/2 z-10 opacity-0"
        onClick={handleNextCard}
        title="Next"
        disabled={currentIndex === sections.length - 1}
      />
    </div>
  );
};

export default FullscreenCardView;
