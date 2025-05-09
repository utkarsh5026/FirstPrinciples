import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import CustomMarkdownRenderer from "@/components/document-reading/markdown/MarkdownRenderer";
import { useSwipeGesture } from "@/hooks/device/use-swipe-gesture";
import CardProgress from "./CardProgress";
import {
  Menu,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionsSheet from "./sidebar/SectionsSheet";
import useMobile from "@/hooks/device/use-mobile";
import ReadingSettingsSheet from "./settings/ReadingSettingsSheet";
import { ReadingSettingsProvider } from "./context/ReadingSettingsProvider";
import { useReadingSettings, fontFamilyMap } from "./context/ReadingContext";
import { MarkdownSection } from "@/services/section/parsing";

interface FullscreenCardViewProps {
  onExit: () => Promise<void>;
  onChangeSection: (index: number) => Promise<boolean>;
  sections: MarkdownSection[];
  getSection: (index: number) => MarkdownSection | null;
  readSections: Set<string>;
  markdown: string;
}
interface FullscreenCardContentProps extends FullscreenCardViewProps {
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const FullscreenCardContent: React.FC<FullscreenCardContentProps> = ({
  settingsOpen,
  setSettingsOpen,
  menuOpen,
  setMenuOpen,
  onExit,
  onChangeSection,
  sections,
  getSection,
  readSections,
  markdown,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isMobile } = useMobile();

  const scrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const { settings } = useReadingSettings();

  const initializedRef = useRef(false);

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
    if (initializedRef.current) return;

    const initializeReading = async () => {
      initializedRef.current = true;
      startTimeRef.current = Date.now();
    };

    initializeReading();

    return () => {
      if (initializedRef.current) {
        console.info("Will unmount");
        onExit();
        initializedRef.current = false;
      }
    };
  }, [onExit]);

  /**
   * 🔄 Smoothly transitions to a new section with a nice fade effect
   * Tracks reading time and updates analytics too! 📊
   */
  const changeSection = async (newIndex: number) => {
    await onExit();

    setIsTransitioning(true);

    setTimeout(async () => {
      setCurrentIndex(newIndex);
      setIsTransitioning(false);
      await onChangeSection(newIndex);
      startTimeRef.current = Date.now();
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
  const currentSection = getSection(currentIndex);

  if (sections.length === 0 || !currentSection) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mr-3"></div>
        <span>Loading content...</span>
      </div>
    );
  }

  const fontFamily = fontFamilyMap[settings.fontFamily];

  return (
    <>
      {/* Main content area */}
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
              fontFamily={fontFamily}
            />
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
      />

      {/* Reading Settings Sheet */}
      <ReadingSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

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
    </>
  );
};

const FullscreenCardView: React.FC<
  FullscreenCardViewProps & {
    markdown: string;
    exitFullScreen: () => void;
  }
> = ({
  markdown,
  onExit,
  onChangeSection,
  sections,
  getSection,
  readSections,
  exitFullScreen,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ReadingSettingsProvider>
      <div className={cn("fixed inset-0 z-50 bg-background flex flex-col")}>
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={exitFullScreen}
            className="h-8 w-8"
            aria-label="Exit fullscreen"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="h-8 w-8"
              aria-label="Open settings"
            >
              <Settings className="h-4 w-4" />
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

        {/* Content Area */}
        <FullscreenCardContent
          markdown={markdown}
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onExit={onExit}
          onChangeSection={onChangeSection}
          sections={sections}
          getSection={getSection}
          readSections={readSections}
        />
      </div>
    </ReadingSettingsProvider>
  );
};

export default FullscreenCardView;
