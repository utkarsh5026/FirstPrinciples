import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type ThemeOption as ThemeTypeOption,
  themes,
} from "@/components/theme/themes";
import { Palette } from "lucide-react";
import ThemeOption from "./ThemeOption";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: ThemeTypeOption) => void;
  className?: string;
}

/**
 * Enhanced ThemeSelector component with a mobile-friendly interface
 * and improved visual display of available themes.
 *
 * Features:
 * - Compact, touch-friendly design
 * - Organized theme categorization
 * - Color previews for each theme
 * - Responsive layout that works well on both mobile and desktop
 *
 * @param {Object} props - Component properties
 * @param {string} props.currentTheme - Current theme name
 * @param {Function} props.onThemeChange - Handler for theme changes
 * @param {string} props.className - Optional CSS class names
 */
const EnhancedThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  className,
}) => {
  const popularThemes = themes.slice(themes.length - 6, themes.length);
  const allThemes = themes;
  const [activeTab, setActiveTab] = useState<string>("popular");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-9 w-9 rounded-full", className)}
          aria-label="Change theme"
        >
          <Palette className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-screen max-w-[280px] p-3 bg-card border-border"
      >
        <div className="mb-3">
          <Tabs
            defaultValue="popular"
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full mb-2 font-cascadia-code">
              <TabsTrigger value="popular" className="flex-1 text-xs">
                ❤️‍🔥 Popular
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1 text-xs">
                All Themes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="max-h-64 overflow-y-auto pr-1 -mr-1">
          <div
            className={cn(
              "grid grid-cols-1 gap-1.5",
              activeTab === "popular" ? "block" : "hidden"
            )}
          >
            {popularThemes.map((theme) => (
              <ThemeOption
                key={theme.name}
                theme={theme}
                isActive={theme.name === currentTheme}
                onSelect={() => onThemeChange(theme)}
              />
            ))}
          </div>

          <div
            className={cn(
              "grid grid-cols-1 gap-1.5",
              activeTab === "all" ? "block" : "hidden"
            )}
          >
            {allThemes.map((theme) => (
              <ThemeOption
                key={theme.name}
                theme={theme}
                isActive={theme.name === currentTheme}
                onSelect={() => onThemeChange(theme)}
              />
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EnhancedThemeSelector;
