import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FolderTree,
  ChevronRight,
  Folder,
  Search,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryNode } from "../../../insights/useInsights";
import { useTheme } from "@/hooks/ui/use-theme";
import getIconForTech from "@/components/icons";

interface HierarchyProps {
  selectedSubcategory: string | null;
  selectedCategory: string | null;
  setSelectedCategory: (category: string) => void;
  setSelectedSubcategory: (subcategory: string) => void;
  filteredData: CategoryNode[];
  onSelectDocument: (path: string, title: string) => void;
}

/**
 * Enhanced Hierarchy component for displaying nested category structure
 * with improved aesthetics, interactions, and mobile optimization.
 */
const EnhancedHierarchy: React.FC<HierarchyProps> = ({
  selectedSubcategory,
  selectedCategory,
  setSelectedCategory,
  setSelectedSubcategory,
  filteredData,
  onSelectDocument,
}) => {
  const { currentTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
  };

  // Animation variants for category items
  const categoryVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
    hover: {
      backgroundColor: `${currentTheme.primary}10`,
      transition: { duration: 0.2 },
    },
  };

  // Animation variants for document items
  const documentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 500, damping: 30 },
    },
  };

  // Filter function for search
  const getFilteredHierarchyData = () => {
    if (!searchQuery) return filteredData;

    // Search through categories, subcategories, and documents
    return filteredData.filter((category) => {
      // Check if category name matches
      const categoryMatches = category.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Filter subcategories
      const matchingSubcategories = category.children?.filter((sub) => {
        const subMatches = sub.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        // Filter documents within subcategory
        const matchingDocs = sub.documents?.filter((doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return subMatches || (matchingDocs && matchingDocs.length > 0);
      });

      // Filter direct documents
      const matchingDirectDocs = category.documents?.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        categoryMatches ||
        (matchingSubcategories && matchingSubcategories.length > 0) ||
        (matchingDirectDocs && matchingDirectDocs.length > 0)
      );
    });
  };

  const displayData = getFilteredHierarchyData();

  // Calculate container height based on whether a subcategory is selected
  const containerHeight = cn(
    "border rounded-lg overflow-hidden bg-card/30 flex flex-col",
    selectedSubcategory ? "h-[400px]" : "h-[500px]"
  );

  // Empty state check
  const isEmpty = displayData.length === 0;

  return (
    <div className={containerHeight}>
      {/* Search bar at top */}
      <div className="p-3 border-b border-border/40 bg-secondary/5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 py-1 h-8 text-sm bg-background"
          />
        </div>
      </div>

      {/* Scrollable content area */}
      <ScrollArea className="flex-1 p-2">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center p-4"
          >
            {searchQuery ? (
              <>
                <AlertCircle className="h-10 w-10 text-muted-foreground opacity-25 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No matching categories found
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <FolderTree className="h-10 w-10 text-muted-foreground opacity-25 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No categories available
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {displayData.map((category) => {
              const CategoryIcon = getIconForTech(category.name);
              return (
                <motion.div
                  key={category.id}
                  variants={categoryVariants}
                  whileHover="hover"
                  className="mb-3"
                  onMouseEnter={() => setHoveredItem(`category-${category.id}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Category header */}
                  <motion.div
                    className={cn(
                      "flex items-center py-2 px-3 rounded-md cursor-pointer transition-colors",
                      "hover:bg-secondary/10",
                      selectedCategory === category.id &&
                        "bg-primary/10 hover:bg-primary/15",
                      "border border-transparent",
                      hoveredItem === `category-${category.id}` &&
                        "border-primary/20"
                    )}
                    onClick={() => {
                      if (!selectedCategory) {
                        setSelectedCategory(category.id);
                      } else if (selectedCategory === category.id) {
                        // Toggle selection
                        setSelectedCategory("");
                        setSelectedSubcategory("");
                      } else {
                        setSelectedCategory(category.id);
                        setSelectedSubcategory("");
                      }
                    }}
                  >
                    <div className="flex-1 flex items-center min-w-0">
                      <CategoryIcon className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-medium truncate">
                        {category.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={category.count > 0 ? "default" : "outline"}
                        className={cn(
                          "ml-2",
                          category.count > 0
                            ? "bg-primary/20 hover:bg-primary/30 text-primary"
                            : ""
                        )}
                      >
                        {category.count}/{category.totalDocuments}
                      </Badge>

                      <div className="w-16 hidden sm:block">
                        <Progress
                          value={category.percentage}
                          className="h-1.5"
                        />
                      </div>

                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          selectedCategory === category.id &&
                            "transform rotate-90"
                        )}
                      />
                    </div>
                  </motion.div>

                  {/* Subcategories */}
                  <AnimatePresence>
                    {selectedCategory === category.id && category.children && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-6 mt-1 space-y-1 border-l border-border/40 pl-3 overflow-hidden"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        {category.children.map((subcategory) => (
                          <div key={subcategory.id}>
                            <motion.div
                              className={cn(
                                "flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors",
                                "hover:bg-secondary/10",
                                selectedSubcategory === subcategory.id &&
                                  "bg-primary/10 hover:bg-primary/15",
                                "border border-transparent",
                                hoveredItem ===
                                  `subcategory-${subcategory.id}` &&
                                  "border-primary/20"
                              )}
                              onClick={() => {
                                setSelectedCategory(category.id);
                                if (selectedSubcategory === subcategory.id) {
                                  setSelectedSubcategory("");
                                } else {
                                  setSelectedSubcategory(subcategory.id);
                                }
                              }}
                              variants={categoryVariants}
                              whileHover="hover"
                              onMouseEnter={() =>
                                setHoveredItem(`subcategory-${subcategory.id}`)
                              }
                              onMouseLeave={() => setHoveredItem(null)}
                            >
                              <div className="flex-1 flex items-center">
                                {selectedSubcategory === subcategory.id ? (
                                  <Folder className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                ) : (
                                  <FolderTree className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                )}
                                <span className="text-sm truncate">
                                  {subcategory.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    subcategory.count > 0
                                      ? "default"
                                      : "outline"
                                  }
                                  className={cn(
                                    "ml-2 text-xs",
                                    subcategory.count > 0
                                      ? "bg-primary/20 hover:bg-primary/30 text-primary"
                                      : ""
                                  )}
                                >
                                  {subcategory.count}/
                                  {subcategory.totalDocuments}
                                </Badge>

                                <div className="w-12 hidden sm:block">
                                  <Progress
                                    value={subcategory.percentage}
                                    className="h-1"
                                  />
                                </div>

                                <ChevronRight
                                  className={cn(
                                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                                    selectedSubcategory === subcategory.id &&
                                      "transform rotate-90"
                                  )}
                                />
                              </div>
                            </motion.div>

                            {/* Documents within subcategory */}
                            <AnimatePresence>
                              {selectedSubcategory === subcategory.id &&
                                subcategory.documents && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-4 mt-1 space-y-1 border-l border-border/30 pl-3 overflow-hidden"
                                  >
                                    {subcategory.documents.map((doc) => (
                                      <motion.div
                                        key={doc.path}
                                        className={cn(
                                          "flex items-center py-1.5 px-2 rounded-md cursor-pointer",
                                          "transition-all duration-200",
                                          doc.count > 0
                                            ? "hover:bg-primary/10 text-primary"
                                            : "hover:bg-secondary/10 text-muted-foreground",
                                          hoveredItem === `doc-${doc.path}` &&
                                            (doc.count > 0
                                              ? "bg-primary/5"
                                              : "bg-secondary/5")
                                        )}
                                        onClick={() =>
                                          onSelectDocument(doc.path, doc.title)
                                        }
                                        variants={documentVariants}
                                        onMouseEnter={() =>
                                          setHoveredItem(`doc-${doc.path}`)
                                        }
                                        onMouseLeave={() =>
                                          setHoveredItem(null)
                                        }
                                        whileHover={{ x: 2 }}
                                      >
                                        <BookOpen className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                        <span className="text-xs truncate flex-1">
                                          {doc.title}
                                        </span>
                                        <Badge
                                          variant={
                                            doc.count > 0
                                              ? "default"
                                              : "outline"
                                          }
                                          className={cn(
                                            "ml-2 text-xs h-5",
                                            doc.count > 0
                                              ? "bg-primary/20 hover:bg-primary/30"
                                              : "text-muted-foreground"
                                          )}
                                        >
                                          {doc.count > 0
                                            ? `${doc.count}×`
                                            : "Unread"}
                                        </Badge>
                                      </motion.div>
                                    ))}
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Documents directly in category */}
                  <AnimatePresence>
                    {selectedCategory === category.id &&
                      !selectedSubcategory &&
                      category.documents && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-6 mt-1 space-y-1 border-l border-border/40 pl-3 overflow-hidden"
                        >
                          {category.documents.map((doc) => (
                            <motion.div
                              key={doc.path}
                              className={cn(
                                "flex items-center py-1.5 px-2 rounded-md cursor-pointer",
                                "transition-all duration-200",
                                doc.count > 0
                                  ? "hover:bg-primary/10 text-primary"
                                  : "hover:bg-secondary/10 text-muted-foreground",
                                hoveredItem === `doc-${doc.path}` &&
                                  (doc.count > 0
                                    ? "bg-primary/5"
                                    : "bg-secondary/5")
                              )}
                              onClick={() =>
                                onSelectDocument(doc.path, doc.title)
                              }
                              variants={documentVariants}
                              onMouseEnter={() =>
                                setHoveredItem(`doc-${doc.path}`)
                              }
                              onMouseLeave={() => setHoveredItem(null)}
                              whileHover={{ x: 2 }}
                            >
                              <BookOpen className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="text-sm truncate flex-1">
                                {doc.title}
                              </span>
                              <Badge
                                variant={doc.count > 0 ? "default" : "outline"}
                                className={cn(
                                  "ml-2 text-xs",
                                  doc.count > 0
                                    ? "bg-primary/20 hover:bg-primary/30"
                                    : "text-muted-foreground"
                                )}
                              >
                                {doc.count > 0 ? `${doc.count}×` : "Unread"}
                              </Badge>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </ScrollArea>
    </div>
  );
};

export default EnhancedHierarchy;
