import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeOption } from "../themes";
import { defaultTheme, ThemeContext } from "./ThemeContext";

type ThemeProviderProps = {
  children: React.ReactNode;
};

/**
 * ThemeProvider component wraps the application with a ThemeContext.Provider.
 * It initializes the theme from localStorage or defaults to the defaultTheme.
 * It also applies the theme to the document root using CSS variables and saves
 * the theme to localStorage on changes.
 *
 * @param {ThemeProviderProps} props - The props for the ThemeProvider component.
 * @param {React.ReactNode} props.children - The children components to be wrapped.
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  /**
   * Initializes the currentTheme state from localStorage or defaults to defaultTheme.
   *
   * @returns {ThemeOption} The current theme option.
   */
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
      return defaultTheme;
    }

    try {
      const parsedTheme = JSON.parse(savedTheme);
      return parsedTheme;
    } catch (e) {
      console.error("Error parsing theme from localStorage:", e);
      return defaultTheme;
    }
  });

  /**
   * Applies the current theme to the document root using CSS variables and saves
   * the theme to localStorage.
   *
   * @param {ThemeOption} currentTheme - The current theme option.
   */
  useEffect(() => {
    const root = document.documentElement;

    // Always enable dark mode
    root.classList.add("dark");

    // Apply theme colors
    root.style.setProperty("--background", currentTheme.background);
    root.style.setProperty("--foreground", currentTheme.foreground);
    root.style.setProperty("--primary", currentTheme.primary);
    root.style.setProperty("--primary-foreground", "#ffffff");
    root.style.setProperty("--secondary", currentTheme.secondary);
    root.style.setProperty("--secondary-foreground", currentTheme.foreground);
    root.style.setProperty("--border", currentTheme.border);
    root.style.setProperty("--card", currentTheme.cardBg);
    root.style.setProperty("--card-foreground", currentTheme.foreground);
    root.style.setProperty("--muted", currentTheme.secondary);
    root.style.setProperty("--muted-foreground", "#94a3b8");
    root.style.setProperty("--accent", currentTheme.secondary);
    root.style.setProperty("--accent-foreground", currentTheme.foreground);
    root.style.setProperty("--popover", currentTheme.cardBg);
    root.style.setProperty("--popover-foreground", currentTheme.foreground);

    // Save theme to localStorage
    localStorage.setItem("theme", JSON.stringify(currentTheme));
  }, [currentTheme]);

  /**
   * Sets the current theme state.
   *
   * @param {ThemeOption} theme - The theme option to set.
   */
  const setTheme = useCallback((theme: ThemeOption) => {
    setCurrentTheme(theme);
  }, []);

  const value = useMemo(
    () => ({ currentTheme, setTheme }),
    [currentTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
