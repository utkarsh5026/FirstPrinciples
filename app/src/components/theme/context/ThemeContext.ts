import { createContext, useContext } from "react";
import { themes, ThemeOption } from "../themes";

/**
 * Defines the type for the ThemeContext.
 *
 * @property {ThemeOption} currentTheme - The current theme option.
 * @property {(theme: ThemeOption) => void} setTheme - A function to set the theme.
 */
type ThemeContextType = {
  currentTheme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
};

/**
 * The default theme option.
 */
export const defaultTheme = themes[0];

/**
 * Creates a context for managing the theme state.
 *
 * @returns {React.Context<ThemeContextType>} The ThemeContext.
 */
export const ThemeContext = createContext<ThemeContextType>({
  currentTheme: defaultTheme,
  setTheme: () => {},
});

/**
 * A hook to use the ThemeContext.
 *
 * @returns {ThemeContextType} The current theme context.
 */
export const useTheme = () => useContext(ThemeContext);
