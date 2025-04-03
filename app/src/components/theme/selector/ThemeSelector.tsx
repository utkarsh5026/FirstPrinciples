import React from "react";
import { cn } from "@/lib/utils";
import { FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeOption, themes } from "@/components/theme/themes";
import { Palette } from "lucide-react";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: ThemeOption) => void;
}

/**
 * ThemeSelector component allows users to select a theme from a dropdown menu.
 * It displays the current theme and provides options to change it.
 *
 * @param {ThemeSelectorProps} props - The props for the component.
 * @param {string} props.currentTheme - The name of the currently selected theme.
 * @param {function} props.onThemeChange - Callback function to handle theme change.
 *
 * @returns {JSX.Element} The rendered ThemeSelector component.
 */
const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full mr-1"
          aria-label="Change theme"
        >
          <Palette size={18} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[200px] p-2 bg-card border-border"
      >
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            className={cn(
              "flex items-center justify-between px-2 py-1.5 my-1 rounded-md cursor-pointer",
              theme.name === currentTheme
                ? "bg-secondary/50"
                : "hover:bg-secondary/30"
            )}
            onClick={() => onThemeChange(theme)}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ background: theme.primary }}
              />
              <span className="text-sm font-cascadia-code font-semibold">
                {theme.name}
              </span>
            </div>

            {theme.name === currentTheme && <FiCheck className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
