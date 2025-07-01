import { useCodeSettingsStore } from "../store/code-settings-store";
import { useCallback } from "react";

const fontMap = {
  "source-code-pro": "Source Code Pro, monospace",
  "fira-code": "Fira Code, monospace",
  "cascadia-code": "Cascadia Code, monospace",
  "jetbrains-mono": "JetBrains Mono, monospace",
  "sf-mono": "SF Mono, monospace",
  consolas: "Consolas, monospace",
  monaco: "Monaco, monospace",
  "ubuntu-mono": "Ubuntu Mono, monospace",
  "roboto-mono": "Roboto Mono, monospace",
};

export const useCodeSettings = () => {
  const settings = useCodeSettingsStore((state) => state.settings);

  const getFontFamily = useCallback(() => {
    return fontMap[settings.fontFamily] || "Source Code Pro, monospace";
  }, [settings.fontFamily]);

  const getFontSize = useCallback(
    (isDrawer: boolean) => {
      if (isDrawer) {
        const sizeMap = {
          xs:
            window.innerWidth >= 1536
              ? "0.75rem"
              : window.innerWidth >= 1280
              ? "0.7rem"
              : "0.65rem",
          sm:
            window.innerWidth >= 1536
              ? "0.85rem"
              : window.innerWidth >= 1280
              ? "0.8rem"
              : "0.75rem",
          base:
            window.innerWidth >= 1536
              ? "0.95rem"
              : window.innerWidth >= 1280
              ? "0.9rem"
              : "0.85rem",
          lg:
            window.innerWidth >= 1536
              ? "1.05rem"
              : window.innerWidth >= 1280
              ? "1rem"
              : "0.95rem",
          xl:
            window.innerWidth >= 1536
              ? "1.15rem"
              : window.innerWidth >= 1280
              ? "1.1rem"
              : "1.05rem",
        };
        return sizeMap[settings.fontSize];
      } else {
        const sizeMap = {
          xs: window.innerWidth < 640 ? "0.6rem" : "0.65rem",
          sm: window.innerWidth < 640 ? "0.7rem" : "0.75rem",
          base: window.innerWidth < 640 ? "0.8rem" : "0.85rem",
          lg: window.innerWidth < 640 ? "0.9rem" : "0.95rem",
          xl: window.innerWidth < 640 ? "1rem" : "1.05rem",
        };
        return sizeMap[settings.fontSize];
      }
    },
    [settings.fontSize]
  );

  const getPadding = useCallback(
    (isDrawer: boolean) => {
      if (settings.compactMode) {
        return isDrawer ? "1rem" : "0.5rem";
      }
      if (isDrawer) {
        if (window.innerWidth >= 1536) return "3rem";
        if (window.innerWidth >= 1280) return "2.5rem";
        if (window.innerWidth >= 1024) return "2rem";
        return "1.5rem";
      }
      return window.innerWidth < 640 ? "0.75rem" : "1rem";
    },
    [settings.compactMode]
  );

  const getBackgroundStyle = useCallback(
    (themeStyle: Record<string, React.CSSProperties>) => {
      if (settings.transparentBackground) {
        return "transparent";
      }
      return (
        settings.customBackground ||
        themeStyle['pre[class*="language-"]']?.backgroundColor ||
        "transparent"
      );
    },
    [settings.transparentBackground, settings.customBackground]
  );

  return {
    settings,
    getFontFamily,
    getFontSize,
    getPadding,
    getBackgroundStyle,
  };
};

export const useCodeFontSettings = () => {
  const setFontFamily = useCodeSettingsStore((state) => state.setFontFamily);

  const setFontSize = useCodeSettingsStore((state) => state.setFontSize);
  const getFontFamilyLabel = useCodeSettingsStore(
    (state) => state.getFontFamilyLabel
  );
  const getFontSizeLabel = useCodeSettingsStore(
    (state) => state.getFontSizeLabel
  );

  return {
    setFontFamily,
    setFontSize,
    getFontFamilyLabel,
    getFontSizeLabel,
  };
};

export default useCodeSettings;
