import React, { useState, useEffect } from "react";
import { List, MoveUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
  ref?: React.RefObject<HTMLDivElement | null>;
}

const TableOfContentsSheet: React.FC<TableOfContentsSheetProps> = ({
  items,
  isOpen,
  onOpenChange,
  onNavigate,
  ref,
}) => {
  const [currentActiveId, setCurrentActiveId] = useState<string>("");

  // Function to handle navigation within the TOC
  const handleNavigate = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });

        // Account for any fixed headers
        if (ref?.current) {
          const headerHeight = 80; // Adjust based on your header height
          ref.current.scrollTop -= headerHeight;
        }

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
    if (ref?.current) {
      ref.current.scrollTop = 0;
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Close the sheet on mobile after scrolling to top
    if (window.innerWidth < 768) {
      setTimeout(() => onOpenChange(false), 300);
    }
  };

  // Update current active heading based on scroll position
  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter((element) => element !== null) as HTMLElement[];

    if (headingElements.length === 0) return;

    // Function to determine which heading is most visible
    const findMostVisibleHeading = () => {
      let mostVisibleHeading: {
        element: HTMLElement;
        visibleAmount: number;
      } | null = null;

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
  }, [isOpen, items, currentActiveId]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-80 sm:max-w-md border-border bg-card/95 backdrop-blur-sm p-4"
      >
        <SheetHeader className="text-left pb-2 border-b border-border">
          <SheetTitle className="text-lg font-medium flex items-center">
            <List className="mr-2" size={18} />
            Table of Contents
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <TableOfContents
            items={items}
            onNavigate={handleNavigate}
            currentActiveId={currentActiveId}
          />
        </div>

        {/* Back to top button */}
        <div className="absolute bottom-4 right-4">
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
      </SheetContent>
    </Sheet>
  );
};

export default TableOfContentsSheet;
