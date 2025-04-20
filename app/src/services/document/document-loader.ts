import { withCache } from "@/utils/functions/cache";
import matter from "gray-matter";
import { Buffer } from "buffer";

// Make Buffer globally available
globalThis.Buffer = Buffer;

export type MarkdownFrontmatter = {
  title: string;
  createdAt?: string;
  updatedAt?: string;
  id?: string;
  description?: string;
  category?: string;
  tags?: string[];
};

export interface ParsedMarkdown {
  content: string;
  frontmatter: MarkdownFrontmatter;
}

/**
 * Interface for a category in the index
 */
export type Category = {
  id: string;
  name: string;
  icon?: string;
  subcategories?: Category[];
  files?: FileMetadata[];
};

/**
 * Interface for the complete index structure
 */
export type ContentIndex = {
  categories: Category[];
  files: FileMetadata[];
};

/**
/**
 * Interface for file metadata in the index
 */
export type FileMetadata = {
  path: string;
  title: string;
  description?: string;
};

const fetchContentIndex = async (): Promise<ContentIndex> => {
  try {
    const baseUrl = getBaseContentUrl();
    const indexFileName = "index.json";
    const response = await fetch(`${baseUrl}${indexFileName}`);

    if (!response.ok) {
      console.error(`Failed to load content index. Status: ${response.status}`);
      throw new Error("Failed to load content index");
    }

    const data = await response.json();
    return data as ContentIndex;
  } catch (error) {
    console.error("Error loading content index:", error);
    return { categories: [], files: [] };
  }
};

const loadContentIndex = withCache(fetchContentIndex);

/**
 * Get the base URL for content files based on the environment
 * This ensures paths work both locally and on GitHub Pages
 */
const getBaseContentUrl = (): string => {
  const isProduction = import.meta.env.PROD;

  const base = import.meta.env.BASE_URL || "";

  if (isProduction) {
    return "/content/";
  }

  return `${base}content/`.replace(/\/\/+/g, "/");
};

const getCategories = async (): Promise<Category[]> => {
  try {
    const index = await loadContentIndex();
    return index.categories || [];
  } catch (error) {
    console.error("Error loading categories:", error);
    return [];
  }
};

const loadMarkdownContent = async (
  filepath: string
): Promise<ParsedMarkdown | null> => {
  try {
    // Get file metadata to enhance frontmatter if available
    const fileMetadata = await findFileMetadata(filepath);
    const baseUrl = getBaseContentUrl();

    // Log the full URL being requested (helps with debugging)
    const fullUrl = `${baseUrl}${filepath}`;

    // Fetch the markdown file
    const response = await fetch(fullUrl);
    if (!response.ok) {
      console.error(
        `Failed to load markdown file: ${filepath} - Status: ${response.status}`
      );
      throw new Error(`Failed to load markdown file: ${filepath}`);
    }

    const markdownText = await response.text();
    const { data: frontmatter, content } = matter(markdownText);

    if (fileMetadata) {
      if (!frontmatter.title && fileMetadata.title) {
        frontmatter.title = fileMetadata.title;
      }
      if (!frontmatter.description && fileMetadata.description) {
        frontmatter.description = fileMetadata.description;
      }
    }

    return {
      content,
      frontmatter: frontmatter as MarkdownFrontmatter,
    };
  } catch (error) {
    console.error(`Error loading markdown file ${filepath}:`, error);
    return null;
  }
};

const findFileMetadata = async (path: string): Promise<FileMetadata | null> => {
  const index = await loadContentIndex();

  // Check root files
  const rootFile = index.files.find((file) => file.path === path);
  if (rootFile) {
    return rootFile;
  }

  // Search in categories recursively
  const searchInCategory = (category: Category): FileMetadata | null => {
    if (category.files) {
      const foundFile = category.files.find((file) => file.path === path);
      if (foundFile) return foundFile;
    }

    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        const result = searchInCategory(subcategory);
        if (result) {
          return result;
        }
      }
    }

    return null;
  };

  for (const category of index.categories) {
    const result = searchInCategory(category);
    if (result) return result;
  }

  return null;
};

const getFileBreadcrumbs = async (
  path: string,
  contentIndex: ContentIndex
): Promise<{ id: string; name: string; icon?: string }[]> => {
  const breadcrumbs: { id: string; name: string; icon?: string }[] = [];

  // Check if it's a root file
  const rootFile = contentIndex.files.find((file) => file.path === path);
  if (rootFile) {
    return breadcrumbs; // Empty breadcrumbs for root files
  }

  // Helper function to search categories recursively
  const searchInCategory = (
    category: Category,
    currentPath: { id: string; name: string; icon?: string }[] = []
  ): boolean => {
    const newPath = [
      ...currentPath,
      {
        id: category.id,
        name: category.name,
        icon: category.icon,
      },
    ];

    // Check if file is directly in this category
    if (category.files && category.files.some((file) => file.path === path)) {
      breadcrumbs.push(...newPath);
      return true;
    }

    // Search subcategories
    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        if (searchInCategory(subcategory, newPath)) {
          return true;
        }
      }
    }

    return false;
  };

  // Search in all categories
  for (const category of contentIndex.categories) {
    if (searchInCategory(category)) {
      break;
    }
  }

  return breadcrumbs;
};

export {
  getCategories,
  getBaseContentUrl,
  loadContentIndex,
  loadMarkdownContent,
  getFileBreadcrumbs,
};
