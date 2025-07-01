import {
  Settings,
  Type,
  ToggleLeft,
  ToggleRight,
  Hash,
  Copy,
  WrapText,
  Tag,
  Minimize2,
  Palette,
  RotateCcw,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import {
  useCodeSettingsStore,
  type CodeFontFamily,
  type CodeFontSize,
} from "@/components/features/markdown-render/store/code-settings-store";
import { ActionButton } from "./action-button";

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
 * Code Settings Menu Component
 *
 * Comprehensive settings menu for code display customization
 * including fonts, layout, and visual options.
 */
const CodeSettingsMenu = () => {
  const {
    settings,
    setFontFamily,
    setFontSize,
    toggleLineNumbers,
    toggleTransparentBackground,
    toggleCopyButton,
    toggleWordWrap,
    toggleLanguageLabel,
    toggleCompactMode,
    setLineHeight,
    resetSettings,
    getFontFamilyLabel,
    getFontSizeLabel,
  } = useCodeSettingsStore();

  const ToggleIcon = ({ active }: { active: boolean }) =>
    active ? (
      <ToggleRight className="w-4 h-4 text-green-500" />
    ) : (
      <ToggleLeft className="w-4 h-4 text-muted-foreground" />
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ActionButton
          icon={Settings}
          label="Settings"
          ariaLabel="Code display settings"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-72 max-h-[80vh] overflow-y-auto bg-card rounded-2xl font-cascadia-code z-[60]"
      >
        <DropdownMenuLabel className="text-sm font-semibold text-foreground px-4 py-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Code Display Settings
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Font Settings */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="px-4 py-2.5 cursor-pointer">
            <Type className="w-4 h-4 mr-3" />
            <span>Font Settings</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64 bg-card rounded-xl z-[70]">
            <DropdownMenuLabel className="text-xs text-muted-foreground px-3 py-2">
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
            <DropdownMenuLabel className="text-xs text-muted-foreground px-3 py-2">
              Font Size
            </DropdownMenuLabel>
            {fontSizes.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => setFontSize(size)}
                className={cn(
                  "cursor-pointer text-sm py-2.5 px-3",
                  settings.fontSize === size &&
                    "bg-accent text-accent-foreground"
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
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Display Options */}
        <DropdownMenuLabel className="text-xs text-muted-foreground px-4 py-2">
          Display Options
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={toggleLineNumbers}
          className="px-4 py-2.5 cursor-pointer"
        >
          <Hash className="w-4 h-4 mr-3" />
          <span className="flex-1">Line Numbers</span>
          <ToggleIcon active={settings.showLineNumbers} />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={toggleTransparentBackground}
          className="px-4 py-2.5 cursor-pointer"
        >
          <Palette className="w-4 h-4 mr-3" />
          <span className="flex-1">Transparent Background</span>
          <ToggleIcon active={settings.transparentBackground} />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={toggleWordWrap}
          className="px-4 py-2.5 cursor-pointer"
        >
          <WrapText className="w-4 h-4 mr-3" />
          <span className="flex-1">Word Wrap</span>
          <ToggleIcon active={settings.enableWordWrap} />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={toggleLanguageLabel}
          className="px-4 py-2.5 cursor-pointer"
        >
          <Tag className="w-4 h-4 mr-3" />
          <span className="flex-1">Language Label</span>
          <ToggleIcon active={settings.showLanguageLabel} />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={toggleCopyButton}
          className="px-4 py-2.5 cursor-pointer"
        >
          <Copy className="w-4 h-4 mr-3" />
          <span className="flex-1">Copy Button</span>
          <ToggleIcon active={settings.showCopyButton} />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={toggleCompactMode}
          className="px-4 py-2.5 cursor-pointer"
        >
          <Minimize2 className="w-4 h-4 mr-3" />
          <span className="flex-1">Compact Mode</span>
          <ToggleIcon active={settings.compactMode} />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Line Height */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Line Height</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {settings.lineHeight.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[settings.lineHeight]}
            onValueChange={([value]) => setLineHeight(value)}
            min={1.2}
            max={2.5}
            step={0.1}
            className="w-full"
          />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={resetSettings}
          className="px-4 py-2.5 cursor-pointer text-destructive hover:text-destructive"
        >
          <RotateCcw className="w-4 h-4 mr-3" />
          <span>Reset to Defaults</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CodeSettingsMenu;
