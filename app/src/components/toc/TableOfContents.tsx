import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface TOCItem {
  id: string;
  content: string;
  level: number;
  indent?: number;
}

interface TableOfContentsProps {
  items: TOCItem[];
  onNavigate?: (id: string) => void;
  className?: string;
  currentActiveId?: string;
  readItems?: Set<string>; // Added to track read items
}

/**
 * TableOfContents component displays a hierarchical navigation menu for document sections
 * It supports active item highlighting, read status tracking, and custom navigation
 *
 * @param {TOCItem[]} items - Array of table of contents items to display
 * @param {function} onNavigate - Optional callback for custom navigation handling
 * @param {string} className - Optional CSS class name for styling
 * @param {string} currentActiveId - ID of the currently active section
 * @param {Set<string>} readItems - Optional set of IDs for sections that have been read
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  onNavigate,
  className,
  currentActiveId,
  readItems,
}) => {
  /**
   * Handles click events on TOC items
   * Either calls the provided onNavigate callback or performs default scroll behavior
   *
   * @param {string} id - The ID of the section to navigate to
   * @returns {function} Event handler function for the click event
   */
  const handleClick = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      if (onNavigate) {
        onNavigate(id);
      } else {
        // Default behavior: scroll to element with offset for header
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 100; // Adjust based on your header height
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    },
    [onNavigate]
  );

  /**
   * Determines the CSS class for the active indicator bar based on item state
   *
   * @param {boolean} isActive - Whether the item is currently active
   * @param {boolean} isRead - Whether the item has been read
   * @param {Set<string>} readItems - Set of read item IDs
   * @returns {string} CSS class name for the indicator bar
   */
  const getBorderClass = useCallback(
    (
      isActive: boolean,
      isRead: boolean | undefined,
      readItems: Set<string> | undefined
    ) => {
      if (isActive) return "bg-primary";
      if (isRead && readItems) return "bg-primary/30"; // Subtle indicator for read items
      return "bg-transparent group-hover:bg-primary/20";
    },
    []
  );

  /**
   * Determines the CSS class for the chevron icon based on item state
   *
   * @param {boolean} isActive - Whether the item is currently active
   * @param {boolean} isRead - Whether the item has been read
   * @param {Set<string>} readItems - Set of read item IDs
   * @returns {string} CSS class name for the chevron icon
   */
  const getChevronTextClass = useCallback(
    (
      isActive: boolean,
      isRead: boolean | undefined,
      readItems: Set<string> | undefined
    ) => {
      if (isActive) return "text-primary";
      if (isRead && readItems) return "text-primary/60";
      return "text-primary/40";
    },
    []
  );

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <p className="text-sm font-medium">No sections found</p>
        <p className="text-xs opacity-70 mt-1">
          This document has no table of contents
        </p>
      </div>
    );
  }

  return (
    <nav className={cn("toc-container", className)}>
      <ul className="space-y-1">
        {items.map((item) => {
          // Calculate indent based on heading level
          const indentLevel = item.level - 1;
          const isActive = currentActiveId === item.id;
          const isRead = readItems?.has(item.id);

          return (
            <li key={item.id} className="relative group">
              {/* Active indicator bar */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-200 ease-in-out",
                  getBorderClass(isActive, isRead, readItems)
                )}
              />

              <a
                href={`#${item.id}`}
                onClick={handleClick(item.id)}
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-md text-sm relative",
                  "hover:bg-primary/5 transition-colors",
                  {
                    "bg-primary/10": isActive,
                    "text-primary font-medium": isActive,
                    "text-primary/80 font-normal":
                      isRead && readItems && !isActive,
                    "text-muted-foreground":
                      !isActive && (!isRead || !readItems),
                  },
                  "ml-[6px]",
                  `pl-[${indentLevel * 12 + 12}px]`
                )}
                style={{
                  paddingLeft: `${indentLevel * 12 + 12}px`,
                }}
              >
                <ChevronRight
                  size={14}
                  className={cn(
                    "transition-transform duration-200",
                    getChevronTextClass(isActive, isRead, readItems),
                    isActive && "rotate-90"
                  )}
                />

                <span className="truncate leading-tight">{item.content}</span>

                {/* Optional: Add a subtle read indicator dot */}
                {isRead && readItems && !isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0"></span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TableOfContents;
