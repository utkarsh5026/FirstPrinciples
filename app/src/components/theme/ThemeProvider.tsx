// src/components/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { themes, ThemeOption } from "./theme";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeContextType = {
  currentTheme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
};

const defaultTheme = themes[0]; // Default to the first theme

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: defaultTheme,
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(() => {
    // Try to get saved theme from localStorage
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        return parsedTheme;
      } catch (e) {
        console.error("Error parsing theme from localStorage:", e);
        return defaultTheme;
      }
    }

    return defaultTheme;
  });

  // Apply theme to document root (using CSS variables)
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

  const setTheme = (theme: ThemeOption) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
