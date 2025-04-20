import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ThemeOption as ThemeTypeOption, themes } from "@/theme/themes";
import { Palette } from "lucide-react";
import ThemeOption from "./ThemeOption";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: ThemeTypeOption) => void;
  className?: string;
}

/**
 * 🎨 A delightful theme selector that lets users personalize their experience!
 *
 * This component creates a dropdown menu with a cute palette button that reveals
 * a world of beautiful themes to choose from.
 *
 * ✨ Features:
 * - Shows popular themes for quick selection
 * - Provides access to all available themes
 * - Highlights the currently active theme
 * - Perfectly responsive for both mobile and desktop
 *
 * 🧠 Smart organization:
 * - Separates themes into "Popular" and "All Themes" tabs
 * - Displays visual previews of each theme's colors
 * - Maintains a compact, touch-friendly design
 */
const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  className,
}) => {
  const popularThemes = themes.slice(themes.length - 6, themes.length);
  const allThemes = themes;
  const [activeTab, setActiveTab] = useState<string>("popular");

  return (
    <DropdownMenu>
      {/* 🎭 Theme button - cute little trigger for the dropdown */}
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

      {/* 🎁 Theme menu - where all the magic happens! */}
      <DropdownMenuContent
        align="end"
        className="w-screen max-w-[280px] p-3 bg-card border-border rounded-2xl"
      >
        {/* 📑 Tab navigation - for switching between theme collections */}
        <div className="mb-3">
          <Tabs
            defaultValue="popular"
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full mb-2 font-cascadia-code rounded-2xl">
              <TabsTrigger value="popular" className="flex-1 text-xs">
                ❤️‍🔥 Popular
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1 text-xs">
                All Themes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 📜 Scrollable theme list - for browsing all the pretty options */}
        <div className="max-h-64 overflow-y-auto pr-1 -mr-1">
          {/* ✨ Popular themes section */}
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

          {/* 🌈 All themes section */}
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

export default ThemeSelector;
