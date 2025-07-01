import { Type, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type {
  CodeFontFamily,
  CodeFontSize,
} from "@/components/features/markdown-render/store/code-settings-store";
import { ActionButton } from "./action-button";
import {
  useCodeFontSettings,
  useCodeSettings,
} from "../../../hooks/use-code-settings";

const fontFamilies: CodeFontFamily[] = [
  "source-code-pro",
  "fira-code",
  "cascadia-code",
  "jetbrains-mono",
  "sf-mono",
  "consolas",
  "monaco",
  "ubuntu-mono",
  "roboto-mono",
];

const fontSizes: CodeFontSize[] = ["xs", "sm", "base", "lg", "xl"];

/**
 * Font Settings Menu Component
 *
 * Dedicated dropdown menu for font family and size customization
 * for code display.
 */
const FontSettingsMenu = () => {
  const { setFontFamily, setFontSize, getFontFamilyLabel, getFontSizeLabel } =
    useCodeFontSettings();
  const { settings } = useCodeSettings();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ActionButton icon={Type} label="Font" ariaLabel="Font settings" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-64 bg-card/80 rounded-2xl font-cascadia-code z-[60] border-none backdrop-blur-lg"
      >
        <DropdownMenuLabel className="text-sm font-semibold text-foreground px-4 py-3 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Font Settings
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Font Family */}
        <DropdownMenuLabel className="text-xs text-muted-foreground px-4 py-2">
          Font Family
        </DropdownMenuLabel>
        {fontFamilies.map((family) => (
          <DropdownMenuItem
            key={family}
            onClick={() => setFontFamily(family)}
            className={cn(
              "cursor-pointer text-sm py-2.5 px-3",
              settings.fontFamily === family &&
                "bg-accent text-accent-foreground"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span style={{ fontFamily: family.replace("-", " ") }}>
                {getFontFamilyLabel(family)}
              </span>
              {settings.fontFamily === family && (
                <Check className="w-3 h-3 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground px-4 py-2">
          Font Size
        </DropdownMenuLabel>
        {fontSizes.map((size) => (
          <DropdownMenuItem
            key={size}
            onClick={() => setFontSize(size)}
            className={cn(
              "cursor-pointer text-sm py-2.5 px-3",
              settings.fontSize === size && "bg-accent text-accent-foreground"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span>{getFontSizeLabel(size)}</span>
              {settings.fontSize === size && (
                <Check className="w-3 h-3 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FontSettingsMenu;
