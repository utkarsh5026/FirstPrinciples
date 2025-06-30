import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CodeFontFamily =
  | "source-code-pro"
  | "fira-code"
  | "cascadia-code"
  | "jetbrains-mono"
  | "sf-mono"
  | "consolas"
  | "monaco"
  | "ubuntu-mono"
  | "roboto-mono";

export type CodeFontSize = "xs" | "sm" | "base" | "lg" | "xl";

export interface CodeDisplaySettings {
  fontFamily: CodeFontFamily;
  fontSize: CodeFontSize;
  showLineNumbers: boolean;
  transparentBackground: boolean;
  showCopyButton: boolean;
  enableWordWrap: boolean;
  showLanguageLabel: boolean;
  compactMode: boolean;
  customBackground: string | null;
  lineHeight: number;
}

interface CodeSettingsStore {
  settings: CodeDisplaySettings;
  setFontFamily: (family: CodeFontFamily) => void;
  setFontSize: (size: CodeFontSize) => void;
  toggleLineNumbers: () => void;
  toggleTransparentBackground: () => void;
  toggleCopyButton: () => void;
  toggleWordWrap: () => void;
  toggleLanguageLabel: () => void;
  toggleCompactMode: () => void;
  setCustomBackground: (color: string | null) => void;
  setLineHeight: (height: number) => void;
  resetSettings: () => void;
  getFontFamilyLabel: (family: CodeFontFamily) => string;
  getFontSizeLabel: (size: CodeFontSize) => string;
}

const DEFAULT_SETTINGS: CodeDisplaySettings = {
  fontFamily: "source-code-pro",
  fontSize: "sm",
  showLineNumbers: false,
  transparentBackground: true, // Default to current transparent setting
  showCopyButton: true,
  enableWordWrap: false,
  showLanguageLabel: true,
  compactMode: false,
  customBackground: null,
  lineHeight: 1.6,
};

const FONT_FAMILY_LABELS: Record<CodeFontFamily, string> = {
  "source-code-pro": "Source Code Pro",
  "fira-code": "Fira Code",
  "cascadia-code": "Cascadia Code",
  "jetbrains-mono": "JetBrains Mono",
  "sf-mono": "SF Mono",
  consolas: "Consolas",
  monaco: "Monaco",
  "ubuntu-mono": "Ubuntu Mono",
  "roboto-mono": "Roboto Mono",
};

const FONT_SIZE_LABELS: Record<CodeFontSize, string> = {
  xs: "Extra Small",
  sm: "Small",
  base: "Medium",
  lg: "Large",
  xl: "Extra Large",
};

const loadInitialSettings = (): CodeDisplaySettings => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  const savedSettings = localStorage.getItem("code-display-settings");
  if (!savedSettings) return DEFAULT_SETTINGS;

  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
  } catch (e) {
    console.error("Error parsing saved code display settings:", e);
    return DEFAULT_SETTINGS;
  }
};

// Save settings to localStorage
const saveSettings = (settings: CodeDisplaySettings) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("code-display-settings", JSON.stringify(settings));
  }
};

export const useCodeSettingsStore = create<CodeSettingsStore>()(
  persist(
    (set) => ({
      settings: loadInitialSettings(),

      setFontFamily: (family: CodeFontFamily) =>
        set((state) => {
          const newSettings = { ...state.settings, fontFamily: family };
          saveSettings(newSettings);
          return { settings: newSettings };
        }),

      setFontSize: (size: CodeFontSize) =>
        set((state) => {
          const newSettings = { ...state.settings, fontSize: size };
          saveSettings(newSettings);
          return { settings: newSettings };
        }),

      toggleLineNumbers: () =>
        set((state) => {
          const newSettings = {
            ...state.settings,
            showLineNumbers: !state.settings.showLineNumbers,
          };
          saveSettings(newSettings);
          return { settings: newSettings };
        }),

      toggleTransparentBackground: () =>
        set((state) => {
          const newSettings = {
            ...state.settings,
            transparentBackground: !state.settings.transparentBackground,
          };
          saveSettings(newSettings);
          return { settings: newSettings };
        }),

      toggleCopyButton: () =>
        set((state) => {
          const newSettings = {
            ...state.settings,
            showCopyButton: !state.settings.showCopyButton,
          };
          saveSettings(newSettings);
          return { settings: newSettings };
        }),

      toggleWordWrap: () =>
        set((state) => {
          const newSettings = {
            ...state.settings,
            enableWordWrap: !state.settings.enableWordWrap,
          };
          saveSettings(newSettings);
          return { settings: newSettings };
        }),

      toggleLanguageLabel: () =>
        set((state) => {
          const newSettings = {
            ...state.settings,
            showLanguageLabel: !state.settings.showLanguageLabel,
          };
          saveSettings(newSettings);
          return { settings: newSettings };
        }),

      toggleCompactMode: () =>
        set((state) => {
          const newSettings = {
            ...state.settings,
            compactMode: !state.settings.compactMode,
          };
          saveSettings(newSettings);
          return { settings: newSettings };
        }),

      setCustomBackground: (color: string | null) =>
        set((state) => {
          const newSettings = { ...state.settings, customBackground: color };
          saveSettings(newSettings);
          return { settings: newSettings };
        }),

      setLineHeight: (height: number) =>
        set((state) => {
          const newSettings = { ...state.settings, lineHeight: height };
          saveSettings(newSettings);
          return { settings: newSettings };
        }),

      resetSettings: () =>
        set(() => {
          saveSettings(DEFAULT_SETTINGS);
          return { settings: DEFAULT_SETTINGS };
        }),

      getFontFamilyLabel: (family: CodeFontFamily) =>
        FONT_FAMILY_LABELS[family],

      getFontSizeLabel: (size: CodeFontSize) => FONT_SIZE_LABELS[size],
    }),
    {
      name: "code-display-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
