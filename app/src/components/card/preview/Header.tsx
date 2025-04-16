import { fromSnakeToTitleCase } from "@/utils/string";
import { Calendar, Clock, LayoutList, FileText, Eye } from "lucide-react";
import { motion } from "framer-motion";
import TabButton from "./TabButton";

interface HeaderProps {
  categoryIcon: React.ReactNode;
  category: string;
  estimatedReadTime: number;
  lastUpdatedFormatted: string;
  totalSections: number;
  documentTitle: string;
  activeTab: "preview" | "info";
  setActiveTab: (tab: "preview" | "info") => void;
}

const Header: React.FC<HeaderProps> = ({
  categoryIcon,
  category,
  estimatedReadTime,
  lastUpdatedFormatted,
  totalSections,
  documentTitle,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="pt-8 px-6 sm:px-8 pb-4 relative">
      {/* Category and metadata row - mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="rounded-full px-3 py-1 text-xs font-medium flex items-center shadow-sm">
            {categoryIcon}
            {fromSnakeToTitleCase(category)}
          </div>
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex items-center px-2 py-1 rounded-md bg-secondary/10">
            <Clock className="h-3 w-3 mr-1.5" />
            {estimatedReadTime} min read
          </div>

          <div className="flex items-center px-2 py-1 rounded-md bg-secondary/10">
            <Calendar className="h-3 w-3 mr-1.5" />
            {lastUpdatedFormatted}
          </div>

          <div className="flex items-center px-2 py-1 rounded-md bg-secondary/10">
            <LayoutList className="h-3 w-3 mr-1.5" />
            {totalSections} sections
          </div>
        </motion.div>
      </div>

      {/* Document title with animation */}
      <motion.h1
        className="text-2xl sm:text-3xl font-bold mb-5 leading-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {documentTitle}
      </motion.h1>

      {/* Enhanced tab navigation */}
      <div className="flex border-b border-border/30 mb-6">
        <TabButton
          isActive={activeTab === "preview"}
          onClick={() => setActiveTab("preview")}
          icon={<Eye className="h-3.5 w-3.5 mr-1.5" />}
          label="Preview"
        />

        <TabButton
          isActive={activeTab === "info"}
          onClick={() => setActiveTab("info")}
          icon={<FileText className="h-3.5 w-3.5 mr-1.5" />}
          label="Details"
        />
      </div>
    </div>
  );
};

export default Header;
