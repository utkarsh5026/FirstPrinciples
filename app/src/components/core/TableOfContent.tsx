// src/components/TableOfContents.tsx
import React, { useEffect, useState } from "react";
import { List, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TOCItem {
  id: string;
  text: string;
  level: number;
  children?: TOCItem[];
}

interface TableOfContentsProps {
  markdownContent: string;
  className?: string;
  maxDepth?: number;
  highlightActive?: boolean;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  markdownContent,
  className = "",
  maxDepth = 3,
  highlightActive = true,
}) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Extract headings from markdown content
  useEffect(() => {
    if (!markdownContent) return;

    const headings: TOCItem[] = [];
    const lines = markdownContent.split("\n");

    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;

        // Only include headings up to maxDepth
        if (level <= maxDepth) {
          const text = match[2].trim();
          const id = slugify(text);

          headings.push({
            id,
            text,
            level,
            children: [],
          });
        }
      }
    }

    // Organize into nested structure
    const nestedHeadings = organizeHeadings(headings);
    setTocItems(nestedHeadings);
  }, [markdownContent, maxDepth]);

  // Track active heading based on scroll position
  useEffect(() => {
    if (!highlightActive) return;

    const headingElements = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    ).filter((el) => el.id); // Only elements with IDs

    const handleScroll = () => {
      // Find the heading that's currently at the top of the viewport
      const scrollPosition = window.scrollY + 100; // Add offset for better UX

      // Find last heading that's above the current scroll position
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element.offsetTop <= scrollPosition) {
          setActiveId(element.id);
          return;
        }
      }

      // If we're at the very top, activate the first heading
      if (headingElements.length > 0) {
        setActiveId(headingElements[0].id);
      } else {
        setActiveId(null);
      }
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tocItems, highlightActive]);

  // Convert heading text to slug ID
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  // Organize flat list of headings into a nested structure
  const organizeHeadings = (headings: TOCItem[]): TOCItem[] => {
    if (headings.length === 0) return [];

    const result: TOCItem[] = [];
    let currentLevel1: TOCItem | null = null;
    let currentLevel2: TOCItem | null = null;

    headings.forEach((heading) => {
      if (heading.level === 1) {
        // Level 1 heading - add to root
        currentLevel1 = { ...heading, children: [] };
        currentLevel2 = null;
        result.push(currentLevel1);
      } else if (heading.level === 2 && currentLevel1) {
        // Level 2 heading - add to current level 1
        currentLevel2 = { ...heading, children: [] };
        currentLevel1.children = [
          ...(currentLevel1.children || []),
          currentLevel2,
        ];
      } else if (heading.level === 3 && currentLevel2) {
        // Level 3 heading - add to current level 2
        currentLevel2.children = [
          ...(currentLevel2.children || []),
          { ...heading, children: [] },
        ];
      }
      // We could add more levels if needed
    });

    return result;
  };

  // Recursive rendering of TOC items
  const renderTOCItems = (items: TOCItem[], level = 0) => {
    if (!items || items.length === 0) return null;

    return (
      <ul className={level === 0 ? "space-y-1" : "pl-4 mt-1 space-y-1"}>
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "flex items-center py-1 text-sm hover:text-gray-300 transition-colors",
                  isActive
                    ? "text-primary"
                    : item.level === 1
                    ? "text-gray-300"
                    : "text-gray-400",
                  level > 0 && "text-sm"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(item.id);
                  if (element) {
                    // Scroll the element into view with a smooth animation
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    // Update the URL hash without causing a jump
                    window.history.pushState(null, "", `#${item.id}`);
                    setActiveId(item.id);
                  }
                }}
              >
                {item.children && item.children.length > 0 && (
                  <ChevronRight size={14} className="mr-1 flex-shrink-0" />
                )}
                <span className="truncate">{item.text}</span>
              </a>

              {item.children &&
                item.children.length > 0 &&
                renderTOCItems(item.children, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  if (tocItems.length === 0) {
    return (
      <div
        className={cn(
          "p-4 border border-[#303030] rounded-md bg-[#202020]",
          className
        )}
      >
        <div className="text-sm text-gray-500 italic">No headings found</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 border border-[#303030] rounded-md bg-[#202020]",
        className
      )}
    >
      <h2 className="text-base font-normal mb-3 pb-2 border-b border-[#303030] text-gray-300 flex items-center">
        <List size={18} className="mr-2" />
        Contents
      </h2>
      <nav>{renderTOCItems(tocItems)}</nav>
    </div>
  );
};

export default TableOfContents;
