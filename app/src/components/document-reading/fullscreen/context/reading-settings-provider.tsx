import React, { ReactNode, useMemo } from "react";
import { useReadingSettingsStore } from "@/stores/ui/reading-settings-store";
import {
  ReadingSettingsContext,
  type ReadingSettingsContextType,
} from "./reading-context";

interface ReadingSettingsProviderProps {
  children: ReactNode;
}

export const ReadingSettingsProvider: React.FC<
  ReadingSettingsProviderProps
> = ({ children }) => {
  const { settings, setFontFamily, setCustomBackground, resetSettings } =
    useReadingSettingsStore();

  const value: ReadingSettingsContextType = useMemo(
    () => ({
      settings,
      setFontFamily,
      setCustomBackground,
      resetSettings,
    }),
    [settings, setFontFamily, setCustomBackground, resetSettings]
  );

  return (
    <ReadingSettingsContext.Provider value={value}>
      {children}
    </ReadingSettingsContext.Provider>
  );
};
