import { useMemo } from "react";
import type { ReadingHistoryItem } from "@/services/history";
import type { Category } from "@/utils/MarkdownLoader";

export type SankeyNode = {
  name: string;
  originalId?: string;
  type: "category" | "subcategory" | "document";
  path?: string;
  readCount?: number;
};

export type SankeyLink = {
  source: number;
  target: number;
  value: number;
};

export type SankeyData = {
  nodes: SankeyNode[];
  links: {
    source: number;
    target: number;
    value: number;
  }[];
};

/**
 * 📊 useSankey Hook
 *
 * This hook processes reading history and category data to create a Sankey diagram
 * visualization of knowledge flow through your documentation.
 *
 * ✨ It tracks how users navigate between categories, subcategories, and documents,
 * showing the strength of connections between different parts of your knowledge base.
 *
 * 🔍 The hook analyzes reading patterns to identify popular pathways and document
 * relationships, helping you understand how information flows through your system.
 *
 * 📈 It also calculates helpful statistics about your knowledge base usage,
 * including total connections, unique documents, and active categories.
 */
const useSankey = (
  readingHistory: ReadingHistoryItem[],
  categories: Category[]
) => {
  /**
   * 🔄 Tracks document read counts
   *
   * Keeps track of how many times each document has been read
   * by analyzing the reading history.
   */
  const documentCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    readingHistory.forEach((item) => {
      counts[item.path] = (counts[item.path] || 0) + 1;
    });

    return counts;
  }, [readingHistory]);

  /**
   * 🌊 Builds the Sankey diagram data structure
   *
   * Creates a network of nodes and links showing how users flow through
   * your knowledge base - from categories to subcategories to documents.
   * The thickness of connections represents popularity of pathways.
   */
  const sankeyData = useMemo(() => {
    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];
    const nodeMap: Record<string, number> = {};

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

    categories.forEach((category) => {
      const categoryNodeIndex = getNodeIndex(
        `category-${category.id}`,
        category.name,
        "category"
      );

      if (!category.subcategories) return;

      category.subcategories.forEach((subcategory) => {
        const subcategoryNodeIndex = getNodeIndex(
          `subcategory-${subcategory.id}`,
          subcategory.name,
          "subcategory"
        );

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

        if (!subcategory.files) return;

        subcategory.files.forEach((file) => {
          const readCount = documentCounts[file.path] || 0;

          if (readCount <= 0) return;
          const documentNodeIndex = getNodeIndex(
            `document-${file.path}`,
            file.title,
            "document",
            file.path
          );

          links.push({
            source: subcategoryNodeIndex,
            target: documentNodeIndex,
            value: readCount,
          });
        });
      });
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
        source: newNodeMap[nodes[link.source].originalId ?? ""],
        target: newNodeMap[nodes[link.target].originalId ?? ""],
        value: link.value,
      }))
      .filter((link) => link.source !== undefined && link.target !== undefined);

    return { nodes: filteredNodes, links: filteredLinks };
  }, [categories, documentCounts]);

  /**
   * 📊 Calculates helpful knowledge flow statistics
   *
   * Gives you a bird's eye view of your documentation usage with metrics
   * like total navigation flows, number of unique documents being read,
   * and how many categories are actively being used.
   */
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

  return {
    documentCounts,
    sankeyData,
    flowStats,
  };
};

export default useSankey;
