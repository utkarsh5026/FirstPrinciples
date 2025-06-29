import type { ReadingTodoItem } from "@/services/reading/reading-list-service";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import TodoItem from "./todo-item";
import { fromSnakeToTitleCase } from "@/utils/string";
import getIconForTech from "@/components/shared/icons";

interface CategoryGroupProps {
  category: string;
  parentGroups: Record<string, ReadingTodoItem[]>;
  type: "pending" | "completed";
  expandedParents: Record<string, boolean>;
  toggleExpandParent: (key: string) => void;
  handleSelectDocument: (path: string, title: string) => void;
  toggleCompletion: (id: string) => void;
  removeItem: (id: string) => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  parentGroups,
  type,
  expandedParents,
  toggleExpandParent,
  handleSelectDocument,
  toggleCompletion,
  removeItem,
}) => {
  const CategoryIcon = getIconForTech(category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-5"
    >
      <div className="flex items-center mb-2">
        <Badge
          variant="outline"
          className="p-2 text-xs bg-primary/5 border-primary/20 font-normal"
        >
          <CategoryIcon className="h-4 w-4 mr-1" />
          {fromSnakeToTitleCase(category)}
        </Badge>
        <div className="h-px flex-grow bg-border/50 ml-2"></div>
      </div>

      <div className="space-y-3">
        {Object.entries(parentGroups).map(([parent, items]) => {
          const categoryParentKey = `${category}-${parent}-${type}`;
          const isExpanded = expandedParents[categoryParentKey] !== false; // Default to true if undefined

          return (
            <Collapsible
              key={categoryParentKey}
              open={isExpanded}
              onOpenChange={() => toggleExpandParent(categoryParentKey)}
              className="border-none rounded-2xl overflow-hidden"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 text-sm font-medium bg-secondary/5 hover:bg-secondary/10 transition-colors rounded-2xl">
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 mr-2 text-primary/70" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2 text-primary/70" />
                  )}
                  <span>{fromSnakeToTitleCase(parent)}</span>
                </div>
                <Badge variant="outline" className="rounded-full">
                  {items.length}
                </Badge>
              </CollapsibleTrigger>

              <CollapsibleContent className="bg-background/50 border-none">
                <div className="p-2 space-y-2">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TodoItem
                          item={item}
                          handleSelectDocument={handleSelectDocument}
                          toggleCompletion={() => toggleCompletion(item.id)}
                          removeItem={() => removeItem(item.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CategoryGroup;
