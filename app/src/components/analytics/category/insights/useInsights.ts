import { useMemo } from "react";
import type { Category, FileMetadata } from "@/utils/MarkdownLoader";
import type { ReadingHistoryItem } from "@/services/analytics/ReadingHistoryService";

export type CategoryNode = {
  id: string;
  name: string;
  count: number;
  totalDocuments: number;
  percentage: number;
  icon?: string;
  children?: CategoryNode[];
  documents?: {
    path: string;
    title: string;
    count: number;
    lastRead?: number;
  }[];
};

export type TreeMapData = {
  name: string;
  size: number;
  value: number;
  children?: TreeMapData[];
};

/**
 * Enhanced useInsights hook that processes category and reading data
 * for various visualizations. This improved version fixes several issues:
 *
 * - Handles edge cases and empty data gracefully
 * - Improves data processing for visualizations
 * - Ensures data is properly structured for all visualizations
 * - Handles inconsistent data formats
 * - Adds better sorting for more meaningful data presentation
 */
const useInsights = (
  selectedCategory: string | null,
  selectedSubcategory: string | null,
  availableDocuments: FileMetadata[],
  categories: Category[],
  readingHistory: ReadingHistoryItem[]
) => {
  // Create a map of document read counts
  const documentCounts = useMemo(() => {
    const counts: Record<string, { count: number; lastRead?: number }> = {};

    readingHistory.forEach((item) => {
      if (!counts[item.path]) {
        counts[item.path] = { count: 0 };
      }
      counts[item.path].count += 1;

      // Track most recent read timestamp
      if (
        !counts[item.path].lastRead ||
        item.lastReadAt > (counts[item.path].lastRead || 0)
      ) {
        counts[item.path].lastRead = item.lastReadAt;
      }
    });

    return counts;
  }, [readingHistory]);

  // Process categories into hierarchical structure
  const categoryData = useMemo(() => {
    if (
      !categories ||
      categories.length === 0 ||
      !availableDocuments ||
      availableDocuments.length === 0
    ) {
      return [];
    }

    // Process a single category to build its node
    const processCategory = (category: Category): CategoryNode => {
      let totalDocs = 0;
      let readDocs = 0;
      const documents: CategoryNode["documents"] = [];

      // Process files directly in this category
      if (category.files && Array.isArray(category.files)) {
        category.files.forEach((file) => {
          if (!file || !file.path) return; // Skip invalid files

          totalDocs++;
          const readCount = documentCounts[file.path]?.count || 0;
          if (readCount > 0) readDocs++;

          documents.push({
            path: file.path,
            title: file.title || file.path.split("/").pop() || "Untitled",
            count: readCount,
            lastRead: documentCounts[file.path]?.lastRead,
          });
        });
      }

      // Process subcategories
      const children: CategoryNode[] = [];
      if (category.subcategories && Array.isArray(category.subcategories)) {
        category.subcategories.forEach((subcategory) => {
          if (!subcategory) return; // Skip invalid subcategories

          const subcategoryNode = processCategory(subcategory);
          children.push(subcategoryNode);
          totalDocs += subcategoryNode.totalDocuments;
          readDocs += subcategoryNode.count;
        });
      }

      return {
        id: category.id || "",
        name: category.name || "Unnamed Category",
        count: readDocs,
        totalDocuments: totalDocs,
        percentage: totalDocs > 0 ? (readDocs / totalDocs) * 100 : 0,
        icon: category.icon,
        children: children.length > 0 ? children : undefined,
        documents: documents.length > 0 ? documents : undefined,
      };
    };

    return categories.map(processCategory);
  }, [categories, availableDocuments, documentCounts]);

  // Filter data based on selected category/subcategory
  const filteredData = useMemo(() => {
    if (!selectedCategory) {
      return categoryData;
    }

    const category = categoryData.find((c) => c.id === selectedCategory);
    if (!category) return [];

    if (!selectedSubcategory) {
      return [category];
    }

    const subcategory = category.children?.find(
      (sc) => sc.id === selectedSubcategory
    );
    return subcategory ? [subcategory] : [];
  }, [categoryData, selectedCategory, selectedSubcategory]);

  // Prepare data for TreeMap visualization
  const treeMapData = useMemo(() => {
    // Use filtered data if available, otherwise use all categoryData
    const sourceData = filteredData.length > 0 ? filteredData : categoryData;

    // Handle empty data case
    if (sourceData.length === 0) {
      return { name: "Categories", children: [] };
    }

    // Process data for treemap structure
    const mapData = sourceData.map((category) => {
      // For categories with children, create nested structure
      if (category.children && category.children.length > 0) {
        return {
          name: category.name,
          size: category.count > 0 ? category.count : 1, // Ensure at least size 1 for visibility
          value: category.count > 0 ? category.count : 1,
          children: category.children.map((subcategory) => ({
            name: subcategory.name,
            size: subcategory.count > 0 ? subcategory.count : 1,
            value: subcategory.count > 0 ? subcategory.count : 1,
          })),
        };
      }

      // For categories without children or with documents
      return {
        name: category.name,
        size: category.count > 0 ? category.count : 1,
        value: category.count > 0 ? category.count : 1,
        // If documents exist, create children based on documents
        children: category.documents?.map((doc) => ({
          name: doc.title,
          size: doc.count > 0 ? doc.count : 1,
          value: doc.count > 0 ? doc.count : 1,
        })),
      };
    });

    return { name: "Categories", children: mapData };
  }, [categoryData, filteredData]);

  // Prepare data for distribution charts
  const distributionData = useMemo(() => {
    // If looking at a specific category/subcategory, show document distribution
    if (selectedCategory) {
      const category = categoryData.find((c) => c.id === selectedCategory);
      if (!category) return [];

      if (selectedSubcategory) {
        const subcategory = category.children?.find(
          (sc) => sc.id === selectedSubcategory
        );

        // Show documents in subcategory
        return (
          subcategory?.documents
            ?.map((doc) => ({
              name: doc.title || "Untitled",
              fullName: doc.title || "Untitled",
              count: doc.count,
              path: doc.path,
            }))
            .sort((a, b) => b.count - a.count) || []
        );
      }

      // Show subcategories distribution
      if (category.children && category.children.length > 0) {
        return category.children
          .map((subcategory) => ({
            name: subcategory.name || "Unnamed",
            count: subcategory.count,
            totalDocuments: subcategory.totalDocuments,
            percentage: subcategory.percentage,
          }))
          .sort((a, b) => b.count - a.count);
      }

      // If no subcategories, show documents in category
      return (
        category.documents
          ?.map((doc) => ({
            name: doc.title || "Untitled",
            fullName: doc.title || "Untitled",
            count: doc.count,
            path: doc.path,
          }))
          .sort((a, b) => b.count - a.count) || []
      );
    }

    // Default: show main categories distribution
    return categoryData
      .map((category) => ({
        name: category.name || "Unnamed",
        count: category.count,
        totalDocuments: category.totalDocuments,
        percentage: category.percentage,
      }))
      .sort((a, b) => b.count - a.count);
  }, [categoryData, selectedCategory, selectedSubcategory]);

  return {
    distributionData,
    treeMapData,
    filteredData,
    categoryData,
  };
};

export default useInsights;
