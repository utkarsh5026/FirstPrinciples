import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { FiCheck } from "react-icons/fi";
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
  // Group themes into categories for easier browsing
  const popularThemes = themes.slice(0, 5);
  const allThemes = themes;

  // State to track which theme category tab is active
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

// Individual theme option component
interface ThemeOptionProps {
  theme: ThemeTypeOption;
  isActive: boolean;
  onSelect: () => void;
}

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

export default EnhancedThemeSelector;
