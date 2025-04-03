import { useState, useEffect, forwardRef } from "react";
import {
  BookOpen,
  X,
  AlignJustify,
  FileText,
  ArrowUpCircle,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import TableOfContents, { TOCItem } from "@/components/toc/TableOfContents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface TableOfContentsSheetProps {
  items: TOCItem[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (id: string) => void;
}

const TableOfContentsSheet = forwardRef<
  HTMLDivElement,
  TableOfContentsSheetProps
>(({ items, isOpen, onOpenChange, onNavigate }) => {
  const [currentActiveId, setCurrentActiveId] = useState<string>("");
  const [hasItems, setHasItems] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>("");
  const [readItems, setReadItems] = useState<Set<string>>(new Set());
  const [showProgress, setShowProgress] = useState<boolean>(() => {
    // Initialize from localStorage or default to true
    return localStorage.getItem("showTocProgress") !== "false";
  });

  // Check if we have any items to display
  useEffect(() => {
    setHasItems(items && items.length > 0);
  }, [items]);

  // Calculate progress percentage
  const progressPercentage = hasItems
    ? (readItems.size / items.length) * 100
    : 0;

  // Function to handle navigation within the TOC
  const handleNavigate = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        // Calculate position with offset for fixed header
        const headerOffset = 100; // Adjust based on your header height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        setCurrentActiveId(id);

        // Find the text of the current section for display
        const item = items.find((item) => item.id === id);
        if (item) {
          setCurrentSection(item.content);
        }

        // Mark this item as read if progress tracking is enabled
        if (showProgress) {
          setReadItems((prev) => {
            const newReadItems = new Set(prev);
            newReadItems.add(id);
            // Save to localStorage
            localStorage.setItem(
              "readTocItems",
              JSON.stringify([...newReadItems])
            );
            return newReadItems;
          });
        }

        // Close the sheet on mobile after navigation
        if (window.innerWidth < 768) {
          setTimeout(() => onOpenChange(false), 300);
        }
      }
    }
  };

  // Scroll to top button handler
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentSection("");

    // Close the sheet on mobile after scrolling to top
    if (window.innerWidth < 768) {
      setTimeout(() => onOpenChange(false), 300);
    }
  };

  // Load read items from localStorage on component mount
  useEffect(() => {
    try {
      const savedReadItems = localStorage.getItem("readTocItems");
      if (savedReadItems) {
        setReadItems(new Set(JSON.parse(savedReadItems)));
      }
    } catch (error) {
      console.error("Error loading read items from localStorage:", error);
    }
  }, []);

  // Save show progress preference to localStorage
  const handleToggleProgress = (checked: boolean) => {
    setShowProgress(checked);
    localStorage.setItem("showTocProgress", checked.toString());
  };

  // Update current active heading based on scroll position
  useEffect(() => {
    if (!isOpen || !hasItems) return;

    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Filter for elements that are intersecting
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);

        if (visibleEntries.length > 0) {
          // Sort by their position on the page (top to bottom)
          visibleEntries.sort((a, b) => {
            const rectA = a.boundingClientRect;
            const rectB = b.boundingClientRect;
            return rectA.top - rectB.top;
          });

          // Select the first visible heading (topmost visible)
          const targetId = visibleEntries[0].target.id;

          if (targetId !== currentActiveId) {
            setCurrentActiveId(targetId);

            // Mark this item as read if progress tracking is enabled
            if (showProgress) {
              setReadItems((prev) => {
                const newReadItems = new Set(prev);
                newReadItems.add(targetId);
                // Save to localStorage
                localStorage.setItem(
                  "readTocItems",
                  JSON.stringify([...newReadItems])
                );
                return newReadItems;
              });
            }

            // Update current section name
            const item = items.find((item) => item.id === targetId);
            if (item) {
              setCurrentSection(item.content);
            }
          }
        }
      },
      {
        rootMargin: "-80px 0px -20% 0px", // Adjust based on header height
        threshold: 0.1,
      }
    );

    // Observe all heading elements
    headingElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [isOpen, items, currentActiveId, hasItems, showProgress]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-md sm:w-80 p-0 border-l border-primary/10 bg-card overflow-hidden font-cascadia-code"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card shadow-sm px-4 py-3">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-medium flex items-center">
                <BookOpen className="mr-2 text-primary" size={18} />
                Document Sections
                {hasItems && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-primary/5 border-primary/20 text-primary text-xs"
                  >
                    {items.length}
                  </Badge>
                )}
              </SheetTitle>

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* Current section display */}
            {currentSection && (
              <div className="mt-2 text-sm py-1.5 px-2 bg-primary/5 rounded-md text-primary/90 truncate flex items-center">
                <FileText size={14} className="mr-1.5 flex-shrink-0" />
                <span className="truncate">{currentSection}</span>
              </div>
            )}

            {/* Progress tracking toggle */}
            <div className="mt-3 flex items-center justify-between">
              <label
                htmlFor="show-progress"
                className="text-xs flex items-center gap-1.5 text-muted-foreground"
              >
                Show reading progress
              </label>
              <Switch
                id="show-progress"
                checked={showProgress}
                onCheckedChange={handleToggleProgress}
              />
            </div>

            {/* Progress bar and details */}
            {showProgress && hasItems && (
              <div className="mt-3 space-y-2">
                {/* Main progress bar */}
                <div className="relative">
                  <div className="h-2.5 w-full bg-secondary/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/70 transition-all duration-500 ease-in-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* Progress percentage label */}
                  <div
                    className="absolute -top-5 text-xs text-primary font-medium transition-all duration-300"
                    style={{
                      left: `${Math.min(
                        Math.max(progressPercentage, 0),
                        100
                      )}%`,
                      transform: `translateX(-${
                        progressPercentage > 50 ? 100 : 0
                      }%)`,
                    }}
                  >
                    {Math.round(progressPercentage)}%
                  </div>
                </div>

                {/* Detailed progress stats */}
                <div className="flex justify-between items-center text-xs text-muted-foreground py-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-primary/80">
                      {readItems.size}
                    </span>{" "}
                    of <span className="font-medium">{items.length}</span>{" "}
                    sections read
                  </div>

                  {/* Estimated reading time remaining */}
                  <div className="text-xs">
                    {items.length - readItems.size > 0 ? (
                      <span title="Estimated based on average reading speed">
                        ~{Math.ceil((items.length - readItems.size) * 1.5)} min
                        left
                      </span>
                    ) : (
                      <span className="text-primary/80 font-medium">
                        Complete!
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress controls */}
                <div className="flex justify-between items-center pt-1">
                  {/* Last read indicator */}
                  <div className="text-xs text-muted-foreground">
                    {readItems.size > 0 ? (
                      <span>Last read: {new Date().toLocaleDateString()}</span>
                    ) : (
                      <span>Not started yet</span>
                    )}
                  </div>

                  {/* Reset progress button */}
                  <button
                    onClick={() => {
                      if (confirm("Reset your reading progress?")) {
                        setReadItems(new Set());
                        localStorage.removeItem("readTocItems");
                      }
                    }}
                    className="text-xs text-primary/70 hover:text-primary hover:underline transition-colors"
                  >
                    Reset progress
                  </button>
                </div>

                {/* Progress stages visualization */}
                <div className="flex gap-0.5 items-center mt-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "h-1 flex-grow transition-all duration-300",
                        readItems.has(item.id)
                          ? "bg-primary/70"
                          : currentActiveId === item.id
                          ? "bg-primary/30"
                          : "bg-secondary/30"
                      )}
                      title={`${item.content} (${
                        readItems.has(item.id) ? "Read" : "Unread"
                      })`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content area with scrolling */}
          <div className="flex-1 overflow-auto">
            {hasItems ? (
              <div className="p-3">
                <TableOfContents
                  items={items}
                  onNavigate={handleNavigate}
                  currentActiveId={currentActiveId}
                  className="pb-16" // Add padding to account for footer
                  readItems={showProgress ? readItems : undefined} // Pass read items only if progress is enabled
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-4">
                  <AlignJustify size={24} className="text-primary/40" />
                </div>
                <p className="text-sm font-medium text-primary/80">
                  No sections found
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  This document doesn't have any headings to create a table of
                  contents
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {hasItems && (
            <div className="sticky bottom-0 border-t border-primary/10 bg-card p-3 flex justify-between items-center">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/5"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="rounded-full h-9 bg-primary/5 border-primary/10 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5 px-3"
                onClick={handleScrollToTop}
                title="Scroll to top"
              >
                <ArrowUpCircle size={14} />
                <span>Top</span>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
});

TableOfContentsSheet.displayName = "TableOfContentsSheet";

export default TableOfContentsSheet;
