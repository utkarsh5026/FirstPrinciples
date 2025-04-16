import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  isActive,
  onClick,
  icon,
  label,
}) => {
  return (
    <button
      className={cn(
        "relative pb-2 mr-6 text-sm font-medium transition-colors",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon}
        {label}
      </div>
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          layoutId="activeTab"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
};

export default TabButton;
