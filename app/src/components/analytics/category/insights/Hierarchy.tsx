import { BookOpen, FolderTree } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CategoryNode } from "./useInsights";

interface HierarchyProps {
  selectedSubcategory: string | null;
  selectedCategory: string | null;
  setSelectedCategory: (category: string) => void;
  setSelectedSubcategory: (subcategory: string) => void;
  filteredData: CategoryNode[];
  onSelectDocument: (path: string, title: string) => void;
}

const Hierarchy: React.FC<HierarchyProps> = ({
  selectedSubcategory,
  selectedCategory,
  setSelectedCategory,
  setSelectedSubcategory,
  filteredData,
  onSelectDocument,
}: HierarchyProps) => {
  return (
    <div
      className={cn(
        "border rounded-lg p-2 overflow-hidden",
        selectedSubcategory ? "h-[400px]" : "h-[500px]"
      )}
    >
      <ScrollArea className="h-full pr-4">
        {filteredData.length > 0 ? (
          filteredData.map((category) => (
            <div key={category.id} className="mb-4">
              {/* Category header */}
              <div
                className="flex items-center py-2 px-3 rounded-md hover:bg-secondary/10 cursor-pointer transition-colors"
                onClick={() => {
                  if (!selectedCategory) {
                    setSelectedCategory(category.id);
                  } else if (!selectedSubcategory && category.children) {
                    // Already selected, do nothing or collapse
                  }
                }}
              >
                <div className="flex-1 flex items-center">
                  <FolderTree className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{category.name}</span>
                </div>
                <Badge variant="outline" className="ml-2">
                  {category.count}/{category.totalDocuments}
                </Badge>
                <div className="ml-3 w-16">
                  <Progress value={category.percentage} className="h-1.5" />
                </div>
              </div>

              {/* Subcategories */}
              {category.children && (
                <div className="ml-6 mt-1 space-y-1 border-l border-border/40 pl-3">
                  {category.children.map((subcategory) => (
                    <div key={subcategory.id}>
                      <div
                        className="flex items-center py-1.5 px-2 rounded-md hover:bg-secondary/10 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedSubcategory(subcategory.id);
                        }}
                      >
                        <div className="flex-1 flex items-center">
                          <FolderTree className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          <span className="text-sm">{subcategory.name}</span>
                        </div>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {subcategory.count}/{subcategory.totalDocuments}
                        </Badge>
                        <div className="ml-3 w-12">
                          <Progress
                            value={subcategory.percentage}
                            className="h-1"
                          />
                        </div>
                      </div>

                      {/* Documents within subcategory */}
                      {selectedSubcategory === subcategory.id &&
                        subcategory.documents && (
                          <div className="ml-4 mt-1 space-y-1 border-l border-border/30 pl-3">
                            {subcategory.documents.map((doc) => (
                              <div
                                key={doc.path}
                                className={cn(
                                  "flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors",
                                  doc.count > 0
                                    ? "hover:bg-primary/10"
                                    : "hover:bg-secondary/10",
                                  doc.count > 0
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                )}
                                onClick={() =>
                                  onSelectDocument(doc.path, doc.title)
                                }
                              >
                                <BookOpen className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                <span className="text-xs truncate flex-1">
                                  {doc.title}
                                </span>
                                <Badge
                                  variant={
                                    doc.count > 0 ? "default" : "outline"
                                  }
                                  className={cn(
                                    "ml-2 text-xs h-5",
                                    doc.count > 0
                                      ? "bg-primary/20 hover:bg-primary/30"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {doc.count > 0 ? `${doc.count}×` : "Unread"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}

              {/* Documents directly in category */}
              {selectedCategory === category.id &&
                !selectedSubcategory &&
                category.documents && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-border/40 pl-3">
                    {category.documents.map((doc) => (
                      <div
                        key={doc.path}
                        className={cn(
                          "flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors",
                          doc.count > 0
                            ? "hover:bg-primary/10"
                            : "hover:bg-secondary/10",
                          doc.count > 0
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                        onClick={() => onSelectDocument(doc.path, doc.title)}
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
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FolderTree className="h-10 w-10 mx-auto mb-2 opacity-25" />
            <p>No categories found</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default Hierarchy;
