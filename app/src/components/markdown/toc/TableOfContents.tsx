import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <ScrollArea className={cn("max-h-[calc(100vh-8rem)]", className)}>
      <nav className="px-1 py-2">
        <ul className="space-y-1">
          {items.map((item) => {
            // Calculate proper indentation based on heading level
            const indentLevel = item.level - 1;
            const isActive = currentActiveId === item.id;

            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={handleClick(item.id)}
                  className={cn(
                    "flex items-center py-1.5 text-sm transition-colors hover:text-primary rounded-md px-2",
                    {
                      "text-primary font-medium bg-primary/10": isActive,
                      "text-foreground font-medium":
                        item.level === 1 && !isActive,
                      "text-muted-foreground": item.level > 1 && !isActive,
                    }
                  )}
                  style={{ paddingLeft: `${indentLevel * 16 + 8}px` }}
                >
                  <Link
                    size={item.level === 1 ? 14 : 12}
                    className={cn(
                      "mr-2 flex-shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span className="truncate">{item.content}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </ScrollArea>
  );
};

export default TableOfContents;
