import { useState, useEffect, forwardRef } from "react";
import {
  BookOpen,
  X,
  AlignJustify,
  FileText,
  ArrowUpCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import TableOfContents, {
  TOCItem,
} from "@/components/markdown/toc/TableOfContents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  // Check if we have any items to display
  useEffect(() => {
    setHasItems(items && items.length > 0);
  }, [items]);

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
  }, [isOpen, items, currentActiveId, hasItems]);

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
              <SheetClose className="rounded-full w-8 h-8 flex items-center justify-center bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>

            {currentSection && (
              <div className="mt-2 text-sm py-1.5 px-2 bg-primary/5 rounded-md text-primary/90 truncate flex items-center">
                <FileText size={14} className="mr-1.5 flex-shrink-0" />
                <span className="truncate">{currentSection}</span>
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
