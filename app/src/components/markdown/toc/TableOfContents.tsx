import React from "react";
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

const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  onNavigate,
  className,
  currentActiveId,
  readItems,
}) => {
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

  const handleClick = (id: string) => (e: React.MouseEvent) => {
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
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

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
                  isActive
                    ? "bg-primary"
                    : isRead && readItems
                    ? "bg-primary/30" // Subtle indicator for read items
                    : "bg-transparent group-hover:bg-primary/20"
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
                  }
                )}
                style={{
                  paddingLeft: `${indentLevel * 12 + 12}px`,
                  marginLeft: "4px",
                }}
              >
                <ChevronRight
                  size={14}
                  className={cn(
                    "transition-transform duration-200",
                    isActive
                      ? "text-primary"
                      : isRead && readItems
                      ? "text-primary/60"
                      : "text-primary/40",
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
