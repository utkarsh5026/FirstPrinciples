import { withCache } from "@/utils/functions/cache";
import matter from "gray-matter";
import { Buffer } from "buffer";
import { fromSnakeToTitleCase } from "@/utils/string";

globalThis.Buffer = Buffer;

/**
 * 🔍 Convert File Path to File Name
 *
 * Converts a file path into a file name by removing the extension and
 * converting the path to title case.
 *
 */
export function fromFilePathToFileName(filePath: string): string {
  const cleaned = filePath.replace(".md", "");
  return fromSnakeToTitleCase(cleaned.split("/").pop() ?? "");
}

/**
 * 📄 Markdown Frontmatter
 *
 * The essential metadata that makes our documents organized and discoverable!
 * Contains titles, dates, and categorization info for all our content. ✨
 */
export type MarkdownFrontmatter = {
  title: string;
  createdAt?: string;
  updatedAt?: string;
  id?: string;
  description?: string;
  category?: string;
  tags?: string[];
};

/**
 * 📝 Parsed Markdown
 *
 * A neatly packaged markdown document with its content and metadata separated!
 * Makes rendering and displaying documents a breeze! 🌈
 */
export interface ParsedMarkdown {
  content: string;
  frontmatter: MarkdownFrontmatter;
}

/**
 * 📁 Content Category
 *
 * Organizes our documents into beautiful hierarchical structures!
 * Creates an intuitive navigation system for exploring content. 🗂️
 */
export type Category = {
  id: string;
  name: string;
  icon?: string;
  categories?: Category[];
  files?: FileMetadata[];
  fileCount?: number;
  path: string;
};

/**
 * 🗺️ Content Index
 *
 * The master map of all our content organization!
 * Helps users discover and navigate through our document library. 🧭
 */
export type ContentIndex = {
  categories: Category[];
  files: FileMetadata[];
};

/**
 * 📌 File Metadata
 *
 * The essential details about each document in our system!
 * Makes documents searchable and helps with quick previews. 🔍
 */
export type FileMetadata = {
  path: string;
  title: string;
  description?: string;
};

/**
 * 🔄 Fetch Content Index
 *
 * Retrieves our content structure from the server!
 * Builds the foundation for our entire document navigation system. 🏗️
 */
const fetchContentIndex = async (): Promise<ContentIndex> => {
  try {
    /**
     * 🔄 Add Title to Files
     *
     * Adds a title to each file in the content index.
     */
    const addTitleToFiles = (files: FileMetadata[]): FileMetadata[] => {
      return files.map((file) => ({
        ...file,
        title: fromFilePathToFileName(file.path),
      }));
    };

    /**
     * 🔄 Traverse Categories
     *
     * Recursively traverses through all categories and adds titles to files.
     */
    const traverseCategories = (categories: Category[]): Category[] => {
      return categories.map((category) => ({
        ...category,
        files: addTitleToFiles(category.files || []),
        categories: traverseCategories(category.categories || []),
      }));
    };

    /**
     *
     */
    const addFileCountToCategories = (categories: Category[]): number => {
      let fileCount = 0;
      categories.forEach((category) => {
        const currentFiles = category.files?.length ?? 0;
        const currentCategories = addFileCountToCategories(
          category.categories || []
        );
        category.fileCount = currentFiles + currentCategories;
        fileCount += currentFiles + currentCategories;
      });

      return fileCount;
    };

    const addPathToCategory = (parentPathSoFar: string, category: Category) => {
      category.path = `${parentPathSoFar}${category.id}/`;
      category.categories?.forEach((subcategory) => {
        addPathToCategory(category.path, subcategory);
      });
      return category;
    };

    const baseUrl = getBaseContentUrl();
    const indexFileName = "index.json";
    const response = await fetch(`${baseUrl}${indexFileName}`);

    if (!response.ok) {
      console.error(`Failed to load content index. Status: ${response.status}`);
      throw new Error("Failed to load content index");
    }

    const data = (await response.json()) as ContentIndex;
    data.categories = traverseCategories(data.categories);
    data.categories.forEach((category) => {
      category.fileCount = addFileCountToCategories(category.categories || []);
    });
    data.categories = data.categories.map((c) => addPathToCategory("", c));
    return data;
  } catch (error) {
    console.error("Error loading content index:", error);
    return { categories: [], files: [] };
  }
};

/**
 * 💾 Load Content Index
 *
 * Gets our content structure with smart caching!
 * Speeds up the app by avoiding unnecessary network requests. ⚡
 */
const loadContentIndex = withCache(fetchContentIndex);

/**
 * 🔗 Get Base Content URL
 *
 * Figures out where our content lives based on the environment!
 * Works seamlessly in development and production environments. 🌐
 */
const getBaseContentUrl = (): string => {
  if (import.meta.env.PROD) return "/content/";

  const base = import.meta.env.BASE_URL || "";
  return `${base}content/`.replace(/\/\/+/g, "/");
};

/**
 * 📂 Get Categories
 *
 * Fetches all the content categories for navigation!
 * Builds the foundation of our sidebar navigation. 🧩
 */
const getCategories = async (): Promise<Category[]> => {
  try {
    const index = await loadContentIndex();
    return index.categories || [];
  } catch (error) {
    console.error("Error loading categories:", error);
    return [];
  }
};

/**
 * 📚 Load Markdown Content
 *
 * Fetches and parses a markdown document for display!
 * Transforms raw markdown into structured content ready for rendering. ✨
 */
const loadMarkdownContent = async (
  filepath: string
): Promise<ParsedMarkdown | null> => {
  try {
    const fileMetadata = await findFileMetadata(filepath);
    const baseUrl = getBaseContentUrl();
    const fullUrl = `${baseUrl}${filepath}`;

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

/**
 * 🔍 Find File Metadata
 *
 * Hunts through our content index to find details about a specific file!
 * Helps enhance document display with titles and descriptions. 🕵️‍♀️
 */
const findFileMetadata = async (path: string): Promise<FileMetadata | null> => {
  const index = await loadContentIndex();

  const rootFile = index.files.find((file) => file.path === path);
  if (rootFile) {
    return rootFile;
  }

  const searchInCategory = (category: Category): FileMetadata | null => {
    if (category.files) {
      const foundFile = category.files.find((file) => file.path === path);
      if (foundFile) return foundFile;
    }

    if (category.categories) {
      for (const subcategory of category.categories) {
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

/**
 * 🧭 Get File Breadcrumbs
 *
 * Creates a trail of breadcrumbs to show where a document lives!
 * Helps users understand document hierarchy and navigate back easily. 🍞
 */
const getFileBreadcrumbs = async (
  path: string,
  contentIndex: ContentIndex
): Promise<{ id: string; name: string; icon?: string }[]> => {
  const breadcrumbs: { id: string; name: string; icon?: string }[] = [];

  const rootFile = contentIndex.files.find((file) => file.path === path);
  if (rootFile) {
    return breadcrumbs;
  }

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

    if (category.files?.some((file) => file.path === path)) {
      breadcrumbs.push(...newPath);
      return true;
    }

    if (category.categories) {
      for (const subcategory of category.categories) {
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
