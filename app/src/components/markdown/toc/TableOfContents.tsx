// app/src/components/markdown/toc/TableOfContents.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { Heading1, Heading2, Heading3, BookOpen } from "lucide-react";

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
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  onNavigate,
  className,
  currentActiveId,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <BookOpen className="mb-3 opacity-40" size={24} />
        <p className="text-sm font-medium">No headings found</p>
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
      // Default behavior: scroll to element
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Get icon based on heading level
  const getHeadingIcon = (level: number, isActive: boolean) => {
    switch (level) {
      case 1:
        return (
          <Heading1
            size={16}
            className={cn(
              "flex-shrink-0",
              isActive ? "text-primary" : "text-primary/50"
            )}
          />
        );
      case 2:
        return (
          <Heading2
            size={15}
            className={cn(
              "flex-shrink-0",
              isActive ? "text-primary/90" : "text-primary/40"
            )}
          />
        );
      case 3:
      default:
        return (
          <Heading3
            size={14}
            className={cn(
              "flex-shrink-0",
              isActive ? "text-primary/80" : "text-primary/30"
            )}
          />
        );
    }
  };

  return (
    <nav className={cn("toc-container", className)}>
      <ul className="space-y-1">
        {items.map((item) => {
          // Calculate proper indentation based on heading level
          const indentLevel = item.level - 1;
          const isActive = currentActiveId === item.id;

          return (
            <li key={item.id} className="relative group">
              {/* Active indicator bar with animation */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-200 ease-in-out",
                  isActive
                    ? "bg-primary/90"
                    : "bg-transparent group-hover:bg-primary/20"
                )}
              />

              <a
                href={`#${item.id}`}
                onClick={handleClick(item.id)}
                className={cn(
                  "flex items-center gap-2.5 py-2 px-3 transition-all duration-200 rounded-md relative",
                  "hover:bg-primary/5 dark:hover:bg-primary/10",
                  {
                    "bg-primary/10 dark:bg-primary/15": isActive,
                    "font-medium": item.level === 1 || isActive,
                    "text-foreground": item.level === 1 && !isActive,
                    "text-primary": isActive,
                    "text-muted-foreground": item.level > 1 && !isActive,
                  }
                )}
                style={{
                  paddingLeft: `${indentLevel * 16 + 12}px`,
                  marginLeft: "4px",
                }}
              >
                {getHeadingIcon(item.level, isActive)}

                <span
                  className={cn(
                    "truncate leading-tight transition-all",
                    item.level === 1 && "text-base",
                    item.level === 2 && "text-sm",
                    item.level === 3 && "text-xs",
                    { "group-hover:translate-x-0.5": !isActive }
                  )}
                >
                  {item.content}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TableOfContents;
