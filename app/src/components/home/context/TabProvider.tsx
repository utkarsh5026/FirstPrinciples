import React, { useState, ReactNode, useMemo } from "react";
import { TabContext, TabType } from "./TabContext";
import { useSwipeable } from "react-swipeable";

interface TabProviderProps {
  children: ReactNode;
  defaultTab?: TabType;
}

const tabs: TabType[] = ["overview", "history", "todo", "analytics"];

/**
 * Provider component for managing tab state across the application
 * Allows any component to access and change the active tab
 */
export const TabProvider: React.FC<TabProviderProps> = ({
  children,
  defaultTab = "overview",
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    },
    onSwipedRight: () => {
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    },
    trackTouch: true,
    trackMouse: true,
  });

  const value = useMemo(
    () => ({ activeTab, setActiveTab, handlers }),
    [activeTab, handlers]
  );
  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};

export default TabProvider;
