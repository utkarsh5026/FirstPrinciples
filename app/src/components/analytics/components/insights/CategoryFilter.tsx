import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, BookOpen, Filter, Check } from "lucide-react";
import { useState } from "react";

/**
 * CategoryFilter - A component for filtering insights by category
 *
 * This component provides a beautiful dropdown interface for users to select
 * which category of content they want to analyze in their reading insights.
 * It defaults to "All" categories but allows filtering to specific ones.
 */
const CategoryFilter = () => {
  // State for dropdown open/closed
  const [isOpen, setIsOpen] = useState(false);
  // State for selected category (defaults to "All")
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample categories - these would come from your actual data
  const categories = [
    { id: "all", name: "All Categories", count: 247 },
    { id: "programming", name: "Programming", count: 78 },
    { id: "design", name: "Design", count: 54 },
    { id: "business", name: "Business", count: 45 },
    { id: "productivity", name: "Productivity", count: 42 },
    { id: "science", name: "Science", count: 28 },
  ];

  // Handle selecting a category
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsOpen(false);
  };

  // Get the currently selected category object
  const currentCategory = categories.find((cat) => cat.id === selectedCategory);

  return (
    <div className="w-full mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-violet-500/10">
            <Filter className="h-4 w-4 text-violet-500" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Category Filter</h4>
            <p className="text-xs text-muted-foreground">
              Focus your insights on specific content categories
            </p>
          </div>
        </div>

        {/* Dropdown for category selection */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center justify-between gap-2 px-4 py-2 w-full sm:w-60 text-sm",
              "bg-secondary/40 hover:bg-secondary/60 rounded-lg border border-border/40 transition-colors",
              "text-left"
            )}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-violet-500" />
              <span className="font-medium text-foreground/90">
                {currentCategory?.name}
              </span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 mt-1 w-full sm:w-60 rounded-lg border border-border/40 bg-popover/95 backdrop-blur-sm shadow-lg"
              >
                <div className="py-1 max-h-60 overflow-auto">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleSelectCategory(category.id)}
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-2 text-sm",
                        "hover:bg-secondary/40 transition-colors",
                        selectedCategory === category.id && "bg-secondary/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen
                          className={cn(
                            "h-4 w-4",
                            selectedCategory === category.id
                              ? "text-violet-500"
                              : "text-muted-foreground"
                          )}
                        />
                        <span
                          className={cn(
                            selectedCategory === category.id &&
                              "font-medium text-foreground"
                          )}
                        >
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground rounded-full bg-secondary/40 px-2 py-0.5">
                          {category.count}
                        </span>
                        {selectedCategory === category.id && (
                          <Check className="h-3.5 w-3.5 text-violet-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Categories chips display - alternative UI for mobile/tablet */}
      <div className="flex flex-wrap gap-2 mt-4 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleSelectCategory(category.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs whitespace-nowrap",
              "border border-border/40 transition-all duration-200",
              selectedCategory === category.id
                ? "bg-violet-500/10 text-foreground border-violet-500/40"
                : "bg-secondary/30 text-muted-foreground hover:bg-secondary/40"
            )}
          >
            <span className="flex items-center gap-1.5">
              {selectedCategory === category.id && (
                <Check className="h-3 w-3 text-violet-500" />
              )}
              {category.name}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  selectedCategory === category.id
                    ? "bg-violet-500/10 text-violet-500"
                    : "bg-secondary/40 text-muted-foreground"
                )}
              >
                {category.count}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
