import { createContext, useContext } from "react";
import { SwipeableHandlers } from "react-swipeable";
export type TabType = "overview" | "history" | "todo" | "analytics";

export interface TabContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  handlers: SwipeableHandlers | null;
}

// Default values as fallbacks if provider is not used
export const TabContext = createContext<TabContextType>({
  activeTab: "overview",
  setActiveTab: () => {},
  handlers: null,
});

// Custom hook for easier access to the tab context
export const useTabContext = () => useContext(TabContext);
