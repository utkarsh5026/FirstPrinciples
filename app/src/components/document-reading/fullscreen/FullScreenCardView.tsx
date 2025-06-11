import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import CustomMarkdownRenderer from "@/components/document-reading/markdown/MarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";
import SectionsSheet from "./sidebar/SectionsSheet";
import useMobile from "@/hooks/device/use-mobile";
import ReadingSettingsSheet from "./settings/ReadingSettingsSheet";
import { ReadingSettingsProvider } from "./context/ReadingSettingsProvider";
import { useReadingSettings, fontFamilyMap } from "./context/ReadingContext";
import type { MarkdownSection } from "@/services/section/parsing";
import {
  Header,
  NavigationControls,
  DesktopProgressIndicator,
} from "./components";
import { useSwipeable } from "react-swipeable";

interface FullscreenCardViewProps {
  onExit: () => Promise<void>;
  onChangeSection: (index: number) => Promise<boolean>;
  sections: MarkdownSection[];
  getSection: (index: number) => MarkdownSection | null;
  readSections: Set<number>;
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
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const { isMobile } = useMobile();
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const { settings } = useReadingSettings();

  const initializedRef = useRef(false);

  // Add this state to track scroll direction
  const [lastScrollY, setLastScrollY] = useState(0);

  /**
   * 🔄 Smoothly transitions to a new section with a nice fade effect
   * Tracks reading time and updates analytics too! 📊
   */
  const changeSection = useCallback(
    async (newIndex: number) => {
      await onExit();

      setIsTransitioning(true);

      setTimeout(async () => {
        setCurrentIndex(newIndex);
        setIsTransitioning(false);
        await onChangeSection(newIndex);
        startTimeRef.current = Date.now();
      }, 200);
    },
    [onExit, onChangeSection]
  );

  const goToNext = useCallback(() => {
    if (currentIndex < sections.length - 1) {
      changeSection(currentIndex + 1);
    }
  }, [currentIndex, sections.length, changeSection]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      changeSection(currentIndex - 1);
    }
  }, [currentIndex, changeSection]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      goToNext();
      handleInteraction();
    },
    onSwipedRight: () => {
      goToPrevious();
      handleInteraction();
    },
    delta: 10,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: true,
  });

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    setIsControlsVisible(true);

    controlsTimeoutRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 2000);
  }, []);

  const handleInteraction = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

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
   * 📜 Scrolls back to the top when changing sections
   * No one likes starting in the middle! 😉
   */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [currentIndex]);

  /**
   * 🎯 Jump directly to a specific section
   */
  const handleSelectCard = (index: number) => {
    if (index !== currentIndex) changeSection(index);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          goToPrevious();
          handleInteraction();
          break;
        case "ArrowRight":
        case "ArrowDown":
        case " ":
          e.preventDefault();
          goToNext();
          handleInteraction();
          break;
        case "Escape":
          setIsControlsVisible(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [goToNext, goToPrevious, handleInteraction, isControlsVisible]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const currentScrollY = scrollRef.current.scrollTop;
    if (currentScrollY < lastScrollY) {
      handleInteraction();
    } else {
      setIsControlsVisible(false);
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY, handleInteraction]);

  // Add scroll listener in useEffect
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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
      <div
        className={cn(
          "h-full overflow-y-auto",
          isTransitioning ? "opacity-0" : "opacity-100",
          "transition-opacity duration-200"
        )}
        ref={scrollRef}
      >
        <div {...swipeHandlers}>
          <div className="px-6 md:px-12 lg:px-20 xl:px-32 py-20 md:py-24">
            <div className="max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
                  transition={{
                    duration: 0.6,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  className="prose prose-lg prose-invert max-w-none"
                >
                  <CustomMarkdownRenderer
                    markdown={currentSection.content}
                    className="fullscreen-card-content leading-relaxed"
                    fontFamily={fontFamily}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <Header
        onExit={() => {}}
        onSettings={() => {
          setSettingsOpen(true);
          handleInteraction();
        }}
        onMenu={() => {
          setMenuOpen(true);
          handleInteraction();
        }}
        isVisible={isControlsVisible}
      />

      {/* Navigation controls for mobile */}
      <NavigationControls
        currentIndex={currentIndex}
        total={sections.length}
        onPrevious={() => {
          goToPrevious();
          handleInteraction();
        }}
        onNext={() => {
          goToNext();
          handleInteraction();
        }}
        isVisible={isControlsVisible && isMobile}
      />

      {/* Desktop side progress */}
      <DesktopProgressIndicator
        currentIndex={currentIndex}
        total={sections.length}
        onSelectSection={(index) => {
          handleSelectCard(index);
          handleInteraction();
        }}
      />

      {/* Swipe hint indicators for mobile */}
      <div className="absolute inset-y-0 left-0 w-20 z-30 pointer-events-none lg:hidden">
        <div className="h-full flex items-center justify-center">
          <motion.div
            className="w-1 h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent rounded-full"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="absolute inset-y-0 right-0 w-20 z-30 pointer-events-none lg:hidden">
        <div className="h-full flex items-center justify-center">
          <motion.div
            className="w-1 h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent rounded-full"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          />
        </div>
      </div>

      {/* First-time user hint */}
      <AnimatePresence>
        {currentIndex === 0 && isControlsVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ delay: 3, duration: 0.6 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-lg rounded-2xl px-6 py-3 pointer-events-none lg:hidden border border-white/10"
          >
            <p className="text-sm text-white/90 flex items-center gap-3 font-medium">
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                👆
              </motion.span>
              Swipe to navigate • Tap to toggle controls
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop keyboard hint */}
      <AnimatePresence>
        {currentIndex === 0 && isControlsVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 4, duration: 0.6 }}
            className="hidden lg:block absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-lg rounded-2xl px-6 py-3 pointer-events-none border border-white/10"
          >
            <p className="text-sm text-white/90 flex items-center gap-4 font-medium">
              <span>← → Arrow keys to navigate</span>
              <span>•</span>
              <span>ESC to toggle controls</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <SectionsSheet
        currentIndex={currentIndex}
        handleSelectCard={handleSelectCard}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        sections={sections}
        readSections={readSections}
      />

      <ReadingSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
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

  /**
   * 🔙 Handle browser back button to exit fullscreen
   * When user presses browser back button, we want to exit fullscreen
   * just like clicking the exit button
   */
  useEffect(() => {
    window.history.pushState({ fullscreen: true }, "");

    const handlePopState = () => {
      exitFullScreen();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [exitFullScreen]);

  return (
    <ReadingSettingsProvider>
      <div className="fixed inset-0 z-50 bg-background text-foreground overflow-hidden">
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
