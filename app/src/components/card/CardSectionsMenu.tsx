import React from "react";
import { cn } from "@/lib/utils";
import { X, ChevronRight } from "lucide-react";

interface SectionItem {
  id: string;
  title: string;
  level?: number;
}

interface CardSectionsMenuProps {
  sections: SectionItem[];
  currentIndex: number;
  onSelectSection: (index: number) => void;
  onClose: () => void;
}

const CardSectionsMenu: React.FC<CardSectionsMenuProps> = ({
  sections,
  currentIndex,
  onSelectSection,
  onClose,
}) => {
  // Add animation classes for the modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0">
      <div
        className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-90"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-medium">Document Sections</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary/20 text-muted-foreground hover:bg-secondary/30 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-md my-1 flex items-center",
                "transition-colors duration-200",
                index === currentIndex
                  ? "bg-primary/15 text-primary font-medium"
                  : "hover:bg-secondary/20 text-foreground/80"
              )}
              onClick={() => onSelectSection(index)}
              style={{
                paddingLeft: section.level
                  ? `${section.level * 8 + 12}px`
                  : "12px",
              }}
            >
              {/* Section number indicator */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0",
                  index === currentIndex ? "bg-primary/20" : "bg-secondary/20"
                )}
              >
                <span className="text-xs font-medium">{index + 1}</span>
              </div>

              {/* Section title */}
              <span className="truncate">
                {section.title || `Section ${index + 1}`}
              </span>

              {/* Current indicator */}
              {index === currentIndex && (
                <ChevronRight
                  size={16}
                  className="ml-auto text-primary flex-shrink-0"
                />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/50 text-xs text-center text-muted-foreground">
          {currentIndex + 1} of {sections.length} sections
        </div>
      </div>

      {/* Background overlay click handler */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
};

export default CardSectionsMenu;
