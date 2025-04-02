// src/components/markdown/card/CardSectionsMenu.tsx
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListOrdered, FileText, BookOpen } from "lucide-react";

interface CardSection {
  id: string;
  title: string;
  level: number;
}

interface CardSectionsMenuProps {
  sections: CardSection[];
  currentIndex: number;
  onSelectSection: (index: number) => void;
  className?: string;
}

const CardSectionsMenu: React.FC<CardSectionsMenuProps> = ({
  sections,
  currentIndex,
  onSelectSection,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sections.length) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2",
            isOpen ? "bg-secondary/20" : "",
            className
          )}
        >
          <ListOrdered className="h-4 w-4" />
          <span className="hidden sm:inline">Sections</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 max-h-[50vh] overflow-auto"
      >
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Document Sections</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {sections.map((section, index) => (
          <DropdownMenuItem
            key={section.id}
            className={cn(
              "flex items-center gap-2 pl-2 pr-2 py-2 my-1 cursor-pointer",
              index === currentIndex
                ? "bg-primary/10 text-primary font-medium"
                : "",
              section.level === 1 ? "font-medium" : ""
            )}
            onClick={() => {
              onSelectSection(index);
              setIsOpen(false);
            }}
          >
            <div
              className="flex items-center gap-2 truncate"
              style={{
                paddingLeft: section.level === 1 ? 0 : 12,
              }}
            >
              {section.level === 1 ? (
                <BookOpen className="h-4 w-4 flex-shrink-0" />
              ) : (
                <FileText className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="truncate">{section.title}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CardSectionsMenu;
