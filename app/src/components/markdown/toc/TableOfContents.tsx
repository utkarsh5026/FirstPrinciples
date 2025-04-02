// app/src/components/markdown/toc/TableOfContents.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { Hash } from "lucide-react";

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
      <div className="text-muted-foreground text-sm py-4 px-2">
        No headings found in this document.
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

  return (
    <nav className={cn("toc-container", className)}>
      <ul className="space-y-1.5">
        {items.map((item) => {
          // Calculate proper indentation based on heading level
          const indentLevel = item.level - 1;
          const isActive = currentActiveId === item.id;

          return (
            <li key={item.id} className="relative">
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-full" />
              )}

              <a
                href={`#${item.id}`}
                onClick={handleClick(item.id)}
                className={cn(
                  "flex items-center py-1.5 pl-4 text-sm transition-colors rounded-md pr-2 relative",
                  {
                    "text-primary font-medium bg-primary/5": isActive,
                    "text-foreground hover:text-primary hover:bg-muted/30":
                      !isActive && item.level === 1,
                    "text-muted-foreground hover:text-primary hover:bg-muted/30":
                      !isActive && item.level > 1,
                    "font-medium": item.level === 1,
                    "text-[0.9rem]": item.level === 1,
                    "text-[0.85rem]": item.level === 2,
                    "text-[0.8rem]": item.level === 3,
                  }
                )}
                style={{ paddingLeft: `${indentLevel * 12 + 12}px` }}
              >
                <Hash
                  size={item.level === 1 ? 14 : item.level === 2 ? 12 : 10}
                  className={cn(
                    "mr-2 flex-shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground/70"
                  )}
                  strokeWidth={item.level === 1 ? 2.5 : 2}
                />
                <span className="truncate leading-tight">{item.content}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TableOfContents;
