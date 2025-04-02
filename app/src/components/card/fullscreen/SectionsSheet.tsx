import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SectionsSheetProps {
  sections: { id: string; title: string }[];
  currentIndex: number;
  handleSelectCard: (index: number) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const SectionsSheet: React.FC<SectionsSheetProps> = ({
  sections,
  currentIndex,
  handleSelectCard,
  menuOpen,
  setMenuOpen,
}) => {
  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent
        side="right"
        className="sm:max-w-sm font-type-mono overflow-auto"
      >
        <SheetHeader className="sticky top-0 bg-card py-2 z-10">
          <SheetTitle>Document Sections</SheetTitle>
        </SheetHeader>
        <div className="py-4 mt-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              className={cn(
                "w-full text-left px-4 py-3 my-1 rounded-md",
                "transition-colors duration-200",
                "flex items-center gap-2",
                index === currentIndex
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-secondary/50"
              )}
              onClick={() => {
                handleSelectCard(index);
                setMenuOpen(false);
              }}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  index === currentIndex
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                )}
              />
              <span className="truncate text-sm">{section.title}</span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SectionsSheet;
