import React from "react";
import type { ThemeOption as ThemeTypeOption } from "@/theme/themes";
import { cn } from "@/lib/utils";
import { FiCheck } from "react-icons/fi";

interface ThemeOptionProps {
  theme: ThemeTypeOption;
  isActive: boolean;
  onSelect: () => void;
  showCategory?: boolean;
  variant?: "compact" | "detailed";
}

/**
 * 🎨 Modern theme option with improved spacing and visual design
 */
const ThemeOption: React.FC<ThemeOptionProps> = ({
  theme,
  isActive,
  onSelect,
  showCategory = false,
  variant = "compact",
}) => {
  if (variant === "detailed") {
    return (
      <button
        className={cn(
          "group relative overflow-hidden rounded-2xl border transition-all duration-200 font-cascadia-code",
          "hover:scale-[1.02] hover:shadow-lg",
          isActive
            ? "border-primary ring-2 ring-primary/20 bg-primary/8"
            : "border-border hover:border-primary/50 hover:shadow-md"
        )}
        onClick={onSelect}
      >
        {/* Enhanced color preview */}
        <div
          className="h-12 sm:h-16 w-full relative"
          style={{
            background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary} 100%)`,
          }}
        >
          {/* Subtle overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content with better spacing */}
        <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-xs sm:text-sm text-foreground truncate pr-2">
              {theme.name}
            </span>
            {isActive && (
              <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary shrink-0">
                <FiCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
              </div>
            )}
          </div>

          {showCategory && (
            <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-md bg-secondary/70 text-secondary-foreground font-medium">
              {theme.category}
            </span>
          )}
        </div>

        {/* Enhanced color swatches */}
        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex gap-0.5 sm:gap-1">
          <div
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-white/60 shadow-sm"
            style={{ backgroundColor: theme.primary }}
          />
          <div
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-white/60 shadow-sm"
            style={{ backgroundColor: theme.secondary }}
          />
        </div>
      </button>
    );
  }

  return (
    <button
      className={cn(
        "flex items-center w-full rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-left transition-all duration-200",
        "hover:scale-[1.01] group font-cascadia-code",
        isActive
          ? "bg-primary/10 border border-primary/30 shadow-sm"
          : "hover:bg-secondary/40 hover:shadow-sm"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 w-full">
        {/* Enhanced color preview */}
        <div className="relative shrink-0">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-none shadow-sm group-hover:shadow-md transition-shadow"
            style={{
              background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary} 100%)`,
            }}
          />
        </div>

        {/* Theme info with better spacing */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-foreground truncate">
              {theme.name}
            </span>
            {showCategory && (
              <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0 font-medium">
                {theme.category}
              </span>
            )}
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary shrink-0">
            <FiCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  );
};

export default ThemeOption;
