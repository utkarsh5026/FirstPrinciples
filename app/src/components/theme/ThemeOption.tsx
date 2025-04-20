import React from "react";
import type { ThemeOption as ThemeTypeOption } from "@/theme/themes";
import { cn } from "@/lib/utils";
import { FiCheck } from "react-icons/fi";

interface ThemeOptionProps {
  theme: ThemeTypeOption;
  isActive: boolean;
  onSelect: () => void;
}

/**
 * 🎨 A beautiful theme option button that shows off a theme's personality!
 *
 * This component creates a delightful, interactive button for each theme option:
 *
 * ✨ Features:
 * - Shows a gorgeous gradient preview of the theme colors
 * - Displays the theme name in a cute font
 * - Highlights the currently active theme with a subtle background
 * - Shows a checkmark for the selected theme
 * - Provides smooth hover effects for better user feedback
 *
 * 🌈 The gradient preview blends the theme's background and primary colors
 * to give users a quick visual sense of the theme's aesthetic.
 *
 * 💫 When selected, the theme gets a subtle highlight and checkmark
 * to help users know which theme they're currently using!
 */
const ThemeOption: React.FC<ThemeOptionProps> = ({
  theme,
  isActive,
  onSelect,
}) => {
  return (
    <button
      key={theme.name}
      className={cn(
        "flex items-center w-full rounded-md py-1.5 px-2 text-left",
        "transition-colors duration-150",
        isActive ? "bg-primary/10" : "hover:bg-secondary/50"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 w-full">
        {/* Color preview */}
        <div className="flex items-center relative">
          <div
            className="w-8 h-8 rounded-full border border-border overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary} 100%)`,
            }}
          />
        </div>

        {/* Theme name */}
        <div>
          <span className="text-sm font-cascadia-code block">{theme.name}</span>
        </div>

        {/* Active indicator */}
        {isActive && <FiCheck className="ml-auto h-4 w-4 text-primary" />}
      </div>
    </button>
  );
};

export default ThemeOption;
