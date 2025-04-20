import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File } from "lucide-react";
import type { ReadingHistoryItem } from "@/services/history";
import { type Category } from "@/services/document/document-loader";
import useMobile from "@/hooks/device/use-mobile";
import { cn } from "@/lib/utils";
import { PiFlowArrow } from "react-icons/pi";
import useSankey from "./useSankey";
import SankeyChart from "./SankeyChart";

interface SankeyKnowledgeFlowProps {
  readingHistory: ReadingHistoryItem[];
  categories: Category[];
}

/**
 * 🌟 SankeyKnowledgeFlow Component
 *
 * This component visualizes the flow of knowledge through your documentation
 * using a beautiful Sankey diagram! It helps you see how users navigate
 * between categories, subcategories, and documents. 📚✨
 *
 * With this component, you can easily track:
 * - The number of categories involved in your knowledge flow. 🎉
 * - The unique documents that have been read. 📖
 * - The total connections made between different parts of your knowledge base. 🔗
 *
 * It adapts to mobile screens, ensuring a smooth experience for all users.
 * If there’s no data available yet, it encourages users to start reading
 * across different categories to visualize their learning flow. 🌈
 */
const SankeyKnowledgeFlow: React.FC<SankeyKnowledgeFlowProps> = ({
  readingHistory,
  categories,
}) => {
  const { isMobile } = useMobile();
  const { sankeyData, flowStats } = useSankey(readingHistory, categories);

  return (
    <Card className="p-4 border-primary/10">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium flex items-center">
          <PiFlowArrow className="h-4 w-4 mr-2 text-primary" />
          Knowledge Flow
        </h4>
        <Badge variant="outline" className="text-xs">
          {flowStats.totalFlows} Connections
        </Badge>
      </div>

      <div
        className={cn(
          "mt-2 mb-4 grid gap-3",
          isMobile ? "grid-cols-2" : "grid-cols-3"
        )}
      >
        <div className="bg-secondary/10 rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Categories</div>
          <div className="text-xl font-bold mt-1">
            {flowStats.categoriesCount}
          </div>
        </div>
        <div className="bg-secondary/10 rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Documents</div>
          <div className="text-xl font-bold mt-1">
            {flowStats.uniqueDocuments}
          </div>
        </div>
        <div
          className={cn(
            "bg-secondary/10 rounded-lg p-3",
            isMobile && "col-span-2"
          )}
        >
          <div className="text-xs text-muted-foreground">
            Knowledge Connections
          </div>
          <div className="text-xl font-bold mt-1">{flowStats.totalFlows}</div>
        </div>
      </div>

      {sankeyData.links.length > 0 ? (
        <div className={isMobile ? "h-96" : "h-[500px]"}>
          <SankeyChart sankeyData={sankeyData} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <File className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>No knowledge flow data available yet</p>
            <p className="text-xs mt-1">
              Start reading across different categories to visualize your
              learning flow
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-muted-foreground">
        <p className="text-center">
          This Sankey diagram shows how your knowledge flows between categories,
          subcategories, and documents. The width of each connection represents
          the strength of that learning pathway. 🌊
        </p>
        <p className="text-center mt-1">
          Click on any node to explore that category or document. 🖱️
        </p>
      </div>
    </Card>
  );
};

export default SankeyKnowledgeFlow;
