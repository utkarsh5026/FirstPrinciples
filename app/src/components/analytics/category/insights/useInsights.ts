import { useMemo } from "react";
import type { Category, FileMetadata } from "@/utils/MarkdownLoader";
import type { ReadingHistoryItem } from "@/hooks/useDocumentManager";

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

const useInsights = (
  selectedCategory: string | null,
  selectedSubcategory: string | null,
  availableDocuments: FileMetadata[],
  categories: Category[],
  readingHistory: ReadingHistoryItem[]
) => {
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

  const categoryData = useMemo(() => {
    if (categories.length === 0 || availableDocuments.length === 0) {
      return [];
    }

    // Process categories to build hierarchical structure
    const processCategory = (category: Category): CategoryNode => {
      let totalDocs = 0;
      let readDocs = 0;
      const documents: CategoryNode["documents"] = [];

      // Process files directly in this category
      if (category.files) {
        category.files.forEach((file) => {
          totalDocs++;
          const readCount = documentCounts[file.path]?.count || 0;
          if (readCount > 0) readDocs++;

          documents.push({
            path: file.path,
            title: file.title,
            count: readCount,
            lastRead: documentCounts[file.path]?.lastRead,
          });
        });
      }

      // Process subcategories
      const children: CategoryNode[] = [];
      if (category.subcategories) {
        category.subcategories.forEach((subcategory) => {
          const subcategoryNode = processCategory(subcategory);
          children.push(subcategoryNode);
          totalDocs += subcategoryNode.totalDocuments;
          readDocs += subcategoryNode.count;
        });
      }

      return {
        id: category.id,
        name: category.name,
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

  // Filter data based on selected category
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

  // Data for TreeMap visualization
  const treeMapData = useMemo(() => {
    // If we're looking at a specific category or subcategory, use that data
    const sourceData = filteredData.length > 0 ? filteredData : categoryData;

    const mapData = sourceData.map((category) => ({
      name: category.name,
      size: category.count,
      value: category.count,
      children: category.children?.map((subcategory) => ({
        name: subcategory.name,
        size: subcategory.count,
        value: subcategory.count,
      })),
    }));

    return { name: "Categories", children: mapData };
  }, [categoryData, filteredData]);

  // Data for distribution chart
  const distributionData = useMemo(() => {
    // If looking at a specific category/subcategory, get document distribution
    if (selectedCategory) {
      const category = categoryData.find((c) => c.id === selectedCategory);
      if (!category) return [];

      if (selectedSubcategory) {
        const subcategory = category.children?.find(
          (sc) => sc.id === selectedSubcategory
        );
        return (
          subcategory?.documents
            ?.map((doc) => ({
              name:
                doc.title.length > 15
                  ? doc.title.substring(0, 15) + "..."
                  : doc.title,
              fullName: doc.title,
              count: doc.count,
              path: doc.path,
            }))
            .sort((a, b) => b.count - a.count) || []
        );
      }

      // Show subcategories distribution
      return (
        category.children
          ?.map((subcategory) => ({
            name: subcategory.name,
            count: subcategory.count,
            totalDocuments: subcategory.totalDocuments,
            percentage: subcategory.percentage,
          }))
          .sort((a, b) => b.count - a.count) || []
      );
    }

    // Default: show main categories distribution
    return categoryData
      .map((category) => ({
        name: category.name,
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
