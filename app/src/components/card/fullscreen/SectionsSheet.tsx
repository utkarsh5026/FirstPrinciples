import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Search, ChevronRight, ListOrdered } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface SectionsSheetProps {
  sections: { id: string; title: string; level?: number }[];
  currentIndex: number;
  handleSelectCard: (index: number) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

/**
 * SectionsSheet Component
 *
 * A component that displays a list of document sections with a search functionality.
 * It allows users to navigate through sections and select a specific section to view.
 *
 * @param {Object} props - Component props
 * @param {Array} props.sections - An array of section objects, each containing an id and title.
 * @param {number} props.currentIndex - The index of the currently selected section.
 * @param {Function} props.handleSelectCard - A function to handle the selection of a section.
 * @param {boolean} props.menuOpen - A boolean indicating if the menu is open.
 * @param {Function} props.setMenuOpen - A function to set the menu open state.
 */
const SectionsSheet: React.FC<SectionsSheetProps> = ({
  sections,
  currentIndex,
  handleSelectCard,
  menuOpen,
  setMenuOpen,
}) => {
  /**
   * Function to normalize section titles by removing leading numbers and special characters.
   *
   * @param {string} title - The title of the section to normalize.
   * @returns {string} - The normalized title.
   */
  const normalizeTitle = (title: string) => {
    return title.replace(/^\d+(\.\d+)*\s*\.?\s*/, "").trim();
  };

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent
        side="right"
        className="font-type-mono p-0 border-l border-primary/10 overflow-hidden w-full sm:max-w-md"
      >
        <div className="flex flex-col h-full">
          {/* Header with Search */}
          <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
            <SheetHeader className="text-left mb-3">
              <SheetTitle className="text-base font-medium flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-primary" />
                <span>Document Sections</span>
                <Badge
                  variant="outline"
                  className="ml-2 text-xs bg-primary/5 border-primary/20"
                >
                  {sections.length}
                </Badge>
              </SheetTitle>
              <SheetDescription className="text-xs">
                Navigate through document sections
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 h-[calc(100vh-11rem)]">
            <div className="p-2">
              {sections.length > 0 ? (
                <div className="space-y-1">
                  {sections.map((section, idx) => {
                    const displayTitle = normalizeTitle(section.title);
                    const isActive = idx === currentIndex;

                    return (
                      <button
                        key={section.id}
                        className={cn(
                          "w-full text-left px-2 py-2 rounded-md",
                          "transition-colors duration-200",
                          "flex items-center gap-2",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-secondary/20 text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => {
                          handleSelectCard(idx);
                          setMenuOpen(false);
                        }}
                      >
                        <div
                          className={cn(
                            "min-w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0",
                            isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary/10 text-muted-foreground"
                          )}
                        >
                          <span className="text-xs font-medium">{idx + 1}</span>
                        </div>

                        <span className="text-xs line-clamp-3 text-left">
                          {displayTitle}
                        </span>

                        {isActive && (
                          <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No matching sections</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SectionsSheet;
