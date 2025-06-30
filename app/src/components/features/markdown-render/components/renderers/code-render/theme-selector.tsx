import React from "react";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  useCodeThemeStore,
  type ThemeKey,
} from "@/components/features/markdown-render/store/code-theme-store";
import { ActionButton } from "./action-button";

/**
 * Theme Selector Component
 *
 * Reusable dropdown component for theme selection with
 * organized categories and current theme indication.
 */
const ThemeSelector = () => {
  const { selectedTheme, setTheme, getCurrentThemeName, getThemesByCategory } =
    useCodeThemeStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ActionButton icon={Palette} label="Theme" ariaLabel="Select theme" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-52 max-h-64 overflow-y-auto bg-card rounded-2xl font-fira-code z-[50]"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground px-3 py-2">
          Current: {getCurrentThemeName()}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(getThemesByCategory()).map(([category, themes]) => (
          <React.Fragment key={category}>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
              {category}
            </DropdownMenuLabel>
            {Object.entries(themes).map(([themeKey, theme]) => (
              <DropdownMenuItem
                key={themeKey}
                onClick={() => setTheme(themeKey as ThemeKey)}
                className={cn(
                  "cursor-pointer text-sm py-2.5",
                  selectedTheme === themeKey &&
                    "bg-accent text-accent-foreground"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{theme.name}</span>
                  {selectedTheme === themeKey && (
                    <Check className="w-3 h-3 text-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
