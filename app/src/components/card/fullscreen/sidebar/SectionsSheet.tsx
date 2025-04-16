import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ListOrdered, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ListOfContents from "./ListOfContents";
import ProgressBar from "./ProgressBar";
import { MarkdownSection } from "@/services/section/parsing";

interface SectionsSheetProps {
  currentIndex: number;
  handleSelectCard: (index: number) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  sections: MarkdownSection[];
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
  currentIndex,
  handleSelectCard,
  menuOpen,
  setMenuOpen,
  sections,
}) => {
  const [readSections, setReadSections] = useState<Set<string>>(new Set());
  const [showProgress, setShowProgress] = useState<boolean>(() => {
    // Initialize from localStorage or default to true
    return localStorage.getItem("showCardProgress") !== "false";
  });

  // Calculate progress percentage
  // Calculate progress percentage
  const progressPercentage = sections.length
    ? (readSections.size / sections.length) * 100
    : 0;

  // Mark current section as read when it changes
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < sections.length && showProgress) {
      const currentSection = sections[currentIndex];
      setReadSections((prev) => {
        const newReadSections = new Set(prev);
        newReadSections.add(currentSection.id);
        // Save to localStorage
        localStorage.setItem(
          "readCardSections",
          JSON.stringify([...newReadSections])
        );
        return newReadSections;
      });
    }
  }, [currentIndex, sections, showProgress]);

  // Load read sections from localStorage on mount
  useEffect(() => {
    try {
      const savedReadSections = localStorage.getItem("readCardSections");
      if (savedReadSections) {
        setReadSections(new Set(JSON.parse(savedReadSections)));
      }
    } catch (error) {
      console.error("Error loading read sections from localStorage:", error);
    }
  }, []);

  // Save progress display preference
  const handleToggleProgress = (checked: boolean) => {
    setShowProgress(checked);
    localStorage.setItem("showCardProgress", checked.toString());
  };

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent
        side="right"
        className="font-type-mono p-0 border-l border-primary/10 overflow-hidden w-full sm:max-w-md"
      >
        <div className="flex flex-col h-full">
          {/* Header with Search and Close Button */}
          <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
            <div className="flex items-center justify-between mb-3">
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

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(false)}
                className="h-8 w-8 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* Progress tracking toggle */}
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="show-card-progress"
                className="text-xs flex items-center gap-1.5 text-muted-foreground"
              >
                Show reading progress
              </label>
              <Switch
                id="show-card-progress"
                checked={showProgress}
                onCheckedChange={handleToggleProgress}
              />
            </div>

            {/* Progress bar and details */}
            {showProgress && sections.length > 0 && (
              <ProgressBar
                progressPercentage={progressPercentage}
                readSections={readSections}
                sections={sections}
                currentIndex={currentIndex}
                setReadSections={setReadSections}
              />
            )}
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 h-[calc(100vh-11rem)]">
            <ListOfContents
              sections={sections}
              currentIndex={currentIndex}
              readSections={readSections}
              showProgress={showProgress}
              handleSelectCard={(index) => {
                handleSelectCard(index);
                setMenuOpen(false);
              }}
            />
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SectionsSheet;
