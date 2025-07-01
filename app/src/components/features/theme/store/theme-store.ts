import { create } from "zustand";
import { ThemeOption, themes } from "@/theme/themes";

const defaultTheme = themes[1];

interface ThemeState {
  currentTheme: ThemeOption;
  bookmarkedThemes: ThemeOption[];
  setTheme: (theme: ThemeOption) => void;
  toggleBookmark: (theme: ThemeOption) => void;
  isBookmarked: (theme: ThemeOption) => boolean;
}

const getInitialTheme = (): ThemeOption => {
  const savedTheme = localStorage.getItem("theme");
  if (!savedTheme) {
    return defaultTheme;
  }

  try {
    return JSON.parse(savedTheme);
  } catch (e) {
    console.error("Error parsing theme from localStorage:", e);
    return defaultTheme;
  }
};

const getInitialBookmarkedThemes = (): ThemeOption[] => {
  const savedBookmarks = localStorage.getItem("bookmarked-themes");
  if (!savedBookmarks) {
    return [];
  }

  try {
    return JSON.parse(savedBookmarks);
  } catch (e) {
    console.error("Error parsing bookmarked themes from localStorage:", e);
    return [];
  }
};

/**
 * 🎨 Theme Store
 *
 * This store manages the current theme of the application and bookmarked themes.
 * It allows you to set the theme, bookmark/unbookmark themes, and check bookmark status.
 * Now includes automatic code theme synchronization.
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: getInitialTheme(),
  bookmarkedThemes: getInitialBookmarkedThemes(),

  setTheme: (theme: ThemeOption) => {
    const { currentTheme } = get();
    const isDarkModeChanging = currentTheme.isDark !== theme.isDark;

    localStorage.setItem("theme", JSON.stringify(theme));
    set({ currentTheme: theme });

    if (isDarkModeChanging) {
      import(
        "@/components/features/markdown-render/store/code-theme-store"
      ).then(({ useCodeThemeStore }) => {
        const codeThemeStore = useCodeThemeStore.getState();
        codeThemeStore.syncWithMainTheme(theme.isDark);
      });
    }
  },

  toggleBookmark: (theme: ThemeOption) => {
    const { bookmarkedThemes } = get();
    const isCurrentlyBookmarked = bookmarkedThemes.some(
      (bookmarked) => bookmarked.name === theme.name
    );

    let newBookmarkedThemes: ThemeOption[];

    if (isCurrentlyBookmarked) {
      newBookmarkedThemes = bookmarkedThemes.filter(
        (bookmarked) => bookmarked.name !== theme.name
      );
    } else {
      newBookmarkedThemes = [...bookmarkedThemes, theme];
    }

    localStorage.setItem(
      "bookmarked-themes",
      JSON.stringify(newBookmarkedThemes)
    );
    set({ bookmarkedThemes: newBookmarkedThemes });
  },

  isBookmarked: (theme: ThemeOption) => {
    const { bookmarkedThemes } = get();
    return bookmarkedThemes.some(
      (bookmarked) => bookmarked.name === theme.name
    );
  },
}));
