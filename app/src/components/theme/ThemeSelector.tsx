// src/components/theme/ThemeSelector.tsx
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
import { ThemeOption, themes } from "./theme";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: ThemeOption) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-border/40 bg-background/50"
        >
          Theme
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
              <span className="text-sm">{theme.name}</span>
            </div>

            {theme.name === currentTheme && <FiCheck className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
