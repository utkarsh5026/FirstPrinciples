import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Search, ListOrdered, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ListOfContents from "./ListOfContents";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSections, setFilteredSections] = useState(sections);
  const [readSections, setReadSections] = useState<Set<string>>(new Set());
  const [showProgress, setShowProgress] = useState<boolean>(() => {
    // Initialize from localStorage or default to true
    return localStorage.getItem("showCardProgress") !== "false";
  });

  // Calculate progress percentage
  const progressPercentage = sections.length
    ? (readSections.size / sections.length) * 100
    : 0;

  // Filter sections based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSections(sections);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sections.filter((section) =>
      section.title.toLowerCase().includes(query)
    );

    setFilteredSections(filtered);
  }, [searchQuery, sections]);

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

            <SheetDescription className="text-xs mb-3">
              Navigate through document sections
            </SheetDescription>

            {/* Search input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-md bg-secondary/20 border border-secondary/30 
                           focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
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
              <div className="space-y-2">
                {/* Main progress bar */}
                <div className="relative">
                  <div className="h-2.5 w-full bg-secondary/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/70 transition-all duration-500 ease-in-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* Progress percentage label */}
                  <div
                    className="absolute -top-5 text-xs text-primary font-medium transition-all duration-300"
                    style={{
                      left: `${Math.min(
                        Math.max(progressPercentage, 0),
                        100
                      )}%`,
                      transform: `translateX(-${
                        progressPercentage > 50 ? 100 : 0
                      }%)`,
                    }}
                  >
                    {Math.round(progressPercentage)}%
                  </div>
                </div>

                {/* Detailed progress stats */}
                <div className="flex justify-between items-center text-xs text-muted-foreground py-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-primary/80">
                      {readSections.size}
                    </span>{" "}
                    of <span className="font-medium">{sections.length}</span>{" "}
                    sections read
                  </div>

                  {/* Estimated reading time remaining */}
                  <div className="text-xs">
                    {sections.length - readSections.size > 0 ? (
                      <span title="Estimated based on average reading speed">
                        ~
                        {Math.ceil((sections.length - readSections.size) * 1.5)}{" "}
                        min left
                      </span>
                    ) : (
                      <span className="text-primary/80 font-medium">
                        Complete!
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress controls */}
                <div className="flex justify-between items-center pt-1">
                  {/* Last read indicator */}
                  <div className="text-xs text-muted-foreground">
                    {readSections.size > 0 ? (
                      <span>Last read: {new Date().toLocaleDateString()}</span>
                    ) : (
                      <span>Not started yet</span>
                    )}
                  </div>

                  {/* Reset progress button */}
                  <button
                    onClick={() => {
                      if (confirm("Reset your reading progress?")) {
                        setReadSections(new Set());
                        localStorage.removeItem("readCardSections");
                      }
                    }}
                    className="text-xs text-primary/70 hover:text-primary hover:underline transition-colors"
                  >
                    Reset progress
                  </button>
                </div>

                {/* Progress stages visualization */}
                <div className="flex gap-0.5 items-center mt-1">
                  {sections.map((section, idx) => (
                    <div
                      key={section.id}
                      className={cn(
                        "h-1 flex-grow transition-all duration-300",
                        readSections.has(section.id)
                          ? "bg-primary/70"
                          : idx === currentIndex
                          ? "bg-primary/30"
                          : "bg-secondary/30"
                      )}
                      title={`${section.title} (${
                        readSections.has(section.id) ? "Read" : "Unread"
                      })`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 h-[calc(100vh-11rem)]">
            <ListOfContents
              filteredSections={filteredSections}
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
