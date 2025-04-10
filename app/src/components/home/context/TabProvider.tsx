import React, { useState, ReactNode, useMemo } from "react";
import { TabContext, TabType } from "./TabContext";

interface TabProviderProps {
  children: ReactNode;
  defaultTab?: TabType;
}

/**
 * Provider component for managing tab state across the application
 * Allows any component to access and change the active tab
 */
export const TabProvider: React.FC<TabProviderProps> = ({
  children,
  defaultTab = "overview",
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};

export default TabProvider;
