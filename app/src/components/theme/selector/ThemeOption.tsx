import React from "react";
import type { ThemeOption as ThemeTypeOption } from "@/components/theme/themes";
import { cn } from "@/lib/utils";
import { FiCheck } from "react-icons/fi";

interface ThemeOptionProps {
  theme: ThemeTypeOption;
  isActive: boolean;
  onSelect: () => void;
}

/**
 * ThemeOption component represents an individual theme option in the theme selector.
 * It displays a color preview, the theme name, and an active indicator if the theme is currently selected.
 *
 * @param {Object} props - The properties for the ThemeOption component.
 * @param {ThemeTypeOption} props.theme - The theme object containing the theme's details such as name, background, and primary colors.
 * @param {boolean} props.isActive - A boolean indicating whether this theme option is currently active (selected).
 * @param {Function} props.onSelect - A callback function to be called when the theme option is selected.
 *
 * @returns {JSX.Element} The rendered ThemeOption component.
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
