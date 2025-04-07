import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File } from "lucide-react";
import {
  Sankey,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Rectangle,
} from "recharts";
import { ReadingHistoryItem } from "@/hooks/useDocumentManager";
import { Category } from "@/utils/MarkdownLoader";
import useMobile from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { COLORS } from "../utils";
import { PiFlowArrow } from "react-icons/pi";

interface SankeyKnowledgeFlowProps {
  readingHistory: ReadingHistoryItem[];
  categories: Category[];
}

// Node types for the Sankey diagram
interface SankeyNode {
  name: string;
  originalId?: string;
  type: "category" | "subcategory" | "document";
  path?: string; // For documents
  readCount?: number;
}

// Link types for the Sankey diagram
interface SankeyLink {
  source: number;
  target: number;
  value: number; // Thickness of the link
}

const SankeyKnowledgeFlow: React.FC<SankeyKnowledgeFlowProps> = ({
  readingHistory,
  categories,
}) => {
  const { isMobile } = useMobile();

  // Process reading history to get counts by document path
  const documentCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    readingHistory.forEach((item) => {
      counts[item.path] = (counts[item.path] || 0) + 1;
    });

    return counts;
  }, [readingHistory]);

  // Build Sankey diagram data structure
  const sankeyData = useMemo(() => {
    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];
    const nodeMap: Record<string, number> = {}; // Maps node IDs to their index in the nodes array

    // Helper to get or create node index
    const getNodeIndex = (
      id: string,
      name: string,
      type: SankeyNode["type"],
      path?: string
    ): number => {
      if (nodeMap[id] !== undefined) {
        return nodeMap[id];
      }

      const index = nodes.length;
      nodes.push({
        name,
        originalId: id,
        type,
        path,
        readCount: path ? documentCounts[path] || 0 : undefined,
      });
      nodeMap[id] = index;
      return index;
    };

    // Process categories and their relationships
    categories.forEach((category) => {
      const categoryNodeIndex = getNodeIndex(
        `category-${category.id}`,
        category.name,
        "category"
      );

      // Process subcategories
      if (category.subcategories) {
        category.subcategories.forEach((subcategory) => {
          const subcategoryNodeIndex = getNodeIndex(
            `subcategory-${subcategory.id}`,
            subcategory.name,
            "subcategory"
          );

          // Link category to subcategory
          const subcategoryReadCount = (subcategory.files || []).reduce(
            (sum, file) => sum + (documentCounts[file.path] || 0),
            0
          );

          if (subcategoryReadCount > 0) {
            links.push({
              source: categoryNodeIndex,
              target: subcategoryNodeIndex,
              value: subcategoryReadCount,
            });
          }

          // Process documents in subcategory
          if (subcategory.files) {
            subcategory.files.forEach((file) => {
              const readCount = documentCounts[file.path] || 0;

              if (readCount > 0) {
                const documentNodeIndex = getNodeIndex(
                  `document-${file.path}`,
                  file.title,
                  "document",
                  file.path
                );

                // Link subcategory to document
                links.push({
                  source: subcategoryNodeIndex,
                  target: documentNodeIndex,
                  value: readCount,
                });
              }
            });
          }
        });
      }

      // Process documents directly in category
      if (category.files) {
        category.files.forEach((file) => {
          const readCount = documentCounts[file.path] || 0;

          if (readCount > 0) {
            const documentNodeIndex = getNodeIndex(
              `document-${file.path}`,
              file.title,
              "document",
              file.path
            );

            // Link category to document
            links.push({
              source: categoryNodeIndex,
              target: documentNodeIndex,
              value: readCount,
            });
          }
        });
      }
    });

    // Filter out orphaned nodes (those with no links)
    const connectedNodeIndices = new Set<number>();
    links.forEach((link) => {
      connectedNodeIndices.add(link.source);
      connectedNodeIndices.add(link.target);
    });

    const filteredNodes = nodes.filter((_, index) =>
      connectedNodeIndices.has(index)
    );

    // Rebuild node map with new indices
    const newNodeMap: Record<string, number> = {};
    filteredNodes.forEach((node, index) => {
      if (node.originalId) {
        newNodeMap[node.originalId] = index;
      }
    });

    // Update link indices
    const filteredLinks = links
      .map((link) => ({
        source: newNodeMap[nodes[link.source].originalId || ""],
        target: newNodeMap[nodes[link.target].originalId || ""],
        value: link.value,
      }))
      .filter((link) => link.source !== undefined && link.target !== undefined);

    return { nodes: filteredNodes, links: filteredLinks };
  }, [categories, documentCounts]);

  // Calculate stats for the knowledge flow
  const flowStats = useMemo(() => {
    const totalFlows = sankeyData.links.reduce(
      (sum, link) => sum + link.value,
      0
    );
    const uniqueDocuments = new Set(
      sankeyData.nodes
        .filter(
          (node) =>
            node.type === "document" && node.readCount && node.readCount > 0
        )
        .map((node) => node.originalId)
    ).size;

    const categoriesCount = new Set(
      sankeyData.nodes
        .filter((node) => node.type === "category")
        .map((node) => node.originalId)
    ).size;

    return {
      totalFlows,
      uniqueDocuments,
      categoriesCount,
    };
  }, [sankeyData]);

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
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={sankeyData}
              node={(nodeProps) => {
                const { x, y, width, height, index } = nodeProps;
                const node = sankeyData.nodes[index];

                // Determine color based on node type
                let fillColor;
                if (node.type === "category") {
                  fillColor = COLORS[0];
                } else if (node.type === "subcategory") {
                  fillColor = COLORS[2];
                } else {
                  // document
                  fillColor = COLORS[4];
                }

                return (
                  <Rectangle
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={fillColor}
                    fillOpacity={0.8}
                    style={{ cursor: "pointer" }}
                  />
                );
              }}
              link={{ stroke: "#77777730" }}
              nodePadding={isMobile ? 20 : 50}
              nodeWidth={isMobile ? 8 : 15}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <RechartsTooltip
                formatter={(
                  value: number,
                  _name: string,
                  props: {
                    payload?: {
                      payload?: SankeyNode;
                    };
                  }
                ) => {
                  const nodeData = props.payload;
                  if (nodeData?.payload) {
                    // Node tooltip
                    const node = nodeData.payload;
                    return [
                      node.readCount ? `${node.readCount} reads` : "",
                      node.name,
                    ];
                  } else {
                    // Link tooltip
                    return [`${value} connections`, "Flow strength"];
                  }
                }}
                contentStyle={{
                  backgroundColor: "rgba(22, 22, 22, 0.9)",
                  border: "1px solid #333",
                  borderRadius: "4px",
                }}
              />
            </Sankey>
          </ResponsiveContainer>
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
          the strength of that learning pathway.
        </p>
        <p className="text-center mt-1">
          Click on any node to explore that category or document.
        </p>
      </div>
    </Card>
  );
};

export default SankeyKnowledgeFlow;
