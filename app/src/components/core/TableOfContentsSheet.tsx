import { useState, useEffect, forwardRef } from "react";
import { List, MoveUp, X } from "lucide-react";
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
        element.scrollIntoView({ behavior: "smooth" });

        // Account for any fixed headers
        const headerHeight = 80; // Adjust based on your header height
        window.scrollBy(0, -headerHeight);

        setCurrentActiveId(id);
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
      .filter((element) => element !== null);

    if (headingElements.length === 0) return;

    let mostVisibleHeading: {
      element: HTMLElement;
      visibleAmount: number;
    } | null = null;

    // Function to determine which heading is most visible
    const findMostVisibleHeading = () => {
      headingElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const viewportHeight =
          window.innerHeight || document.documentElement.clientHeight;

        // Calculate how much of the element is visible
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visibleAmount = Math.max(0, visibleBottom - visibleTop);

        // Check if this is the most visible heading so far
        if (
          visibleAmount > 0 &&
          (!mostVisibleHeading ||
            visibleAmount > mostVisibleHeading.visibleAmount)
        ) {
          mostVisibleHeading = { element, visibleAmount };
        }
      });

      return mostVisibleHeading?.element?.id;
    };

    // Initialize the current active ID
    const initialActiveId = findMostVisibleHeading();
    if (initialActiveId) {
      setCurrentActiveId(initialActiveId);
    }

    // Set up scroll listener
    const handleScroll = () => {
      const activeId = findMostVisibleHeading();
      if (activeId && activeId !== currentActiveId) {
        setCurrentActiveId(activeId);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, items, currentActiveId, hasItems]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-md sm:w-80 p-0 border-l border-border bg-card backdrop-blur-md font-cascadia-code"
      >
        <div className="flex flex-col h-full">
          {/* Header with fixed position */}
          <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-medium flex items-center">
                <List className="mr-2 text-primary" size={18} />
                Table of Contents
              </SheetTitle>
              <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>
          </div>

          {/* Content area with scrolling */}
          <div className="flex-1 overflow-auto">
            {hasItems ? (
              <div className="p-4">
                <TableOfContents
                  items={items}
                  onNavigate={handleNavigate}
                  currentActiveId={currentActiveId}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <List size={24} className="opacity-50" />
                </div>
                <p className="text-sm">No headings found in this document.</p>
              </div>
            )}
          </div>

          {/* Footer with fixed position */}
          {hasItems && (
            <div className="sticky bottom-0 border-t border-border bg-card/90 backdrop-blur-sm p-3 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full w-10 h-10 p-0"
                onClick={handleScrollToTop}
                title="Scroll to top"
              >
                <MoveUp size={18} />
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
