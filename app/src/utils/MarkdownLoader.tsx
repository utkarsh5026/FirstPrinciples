// Modified MarkdownLoader.tsx with GitHub Pages compatibility
import matter from "gray-matter";
import { Buffer } from "buffer";

// Make Buffer globally available
globalThis.Buffer = Buffer;

/**
 * Interface for parsed frontmatter metadata from markdown files
 */
export interface MarkdownFrontmatter {
  title: string;
  createdAt?: string;
  updatedAt?: string;
  id?: string;
  description?: string;
  category?: string;
  tags?: string[];
  [key: string]: any;
}

/**
 * Interface for parsed markdown content with frontmatter
 */
export interface ParsedMarkdown {
  content: string;
  frontmatter: MarkdownFrontmatter;
}

/**
 * Interface for file metadata in the index
 */
export interface FileMetadata {
  path: string;
  title: string;
  description?: string;
}

/**
 * Interface for a category in the index
 */
export interface Category {
  id: string;
  name: string;
  icon?: string;
  subcategories?: Category[];
  files?: FileMetadata[];
}

/**
 * Interface for the complete index structure
 */
export interface ContentIndex {
  categories: Category[];
  files: FileMetadata[];
}

/**
 * Helper class for loading and handling markdown files
 */
export class MarkdownLoader {
  private static contentIndex: ContentIndex | null = null;

  /**
   * Get the base URL for content files based on the environment
   * This ensures paths work both locally and on GitHub Pages
   */
  private static getBaseContentUrl(): string {
    // Get any base URL path from Vite
    const base = import.meta.env.BASE_URL || "";
    // Return a normalized path that works for both local dev and GitHub Pages
    return `${base}content/`.replace(/\/\/+/g, "/");
  }

  /**
   * Load the content index, caching it for future use
   */
  static async loadContentIndex(): Promise<ContentIndex> {
    if (this.contentIndex) {
      return this.contentIndex;
    }

    try {
      const baseUrl = this.getBaseContentUrl();
      const response = await fetch(`${baseUrl}index.json`);

      if (!response.ok) {
        console.error(
          `Failed to load content index. Status: ${response.status}`
        );
        throw new Error("Failed to load content index");
      }

      const data = await response.json();
      this.contentIndex = data as ContentIndex;
      return this.contentIndex;
    } catch (error) {
      console.error("Error loading content index:", error);
      // Return an empty index structure
      return { categories: [], files: [] };
    }
  }

  /**
   * Fetch all available markdown files from the content directory
   * (Legacy method for backwards compatibility)
   * @returns A list of available markdown files
   */
  static async getAvailableFiles(): Promise<string[]> {
    try {
      const index = await this.loadContentIndex();
      const files: string[] = [];

      // Add root-level files
      index.files.forEach((file) => files.push(file.path));

      // Recursively add files from categories
      const addFilesFromCategory = (category: Category) => {
        if (category.files) {
          category.files.forEach((file) => files.push(file.path));
        }
        if (category.subcategories) {
          category.subcategories.forEach(addFilesFromCategory);
        }
      };

      index.categories.forEach(addFilesFromCategory);

      return files;
    } catch (error) {
      console.error("Error loading markdown file list:", error);
      return [];
    }
  }

  /**
   * Get all categories from the index
   * @returns The complete category structure
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const index = await this.loadContentIndex();
      return index.categories || [];
    } catch (error) {
      console.error("Error loading categories:", error);
      return [];
    }
  }

  /**
   * Find file metadata from its path
   * @param path The file path to find
   * @returns The file metadata or null if not found
   */
  static async findFileMetadata(path: string): Promise<FileMetadata | null> {
    const index = await this.loadContentIndex();

    // Check root files
    const rootFile = index.files.find((file) => file.path === path);
    if (rootFile) {
      return rootFile;
    }

    // Search in categories recursively
    const searchInCategory = (category: Category): FileMetadata | null => {
      if (category.files) {
        const foundFile = category.files.find((file) => file.path === path);
        if (foundFile) {
          return foundFile;
        }
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
      if (result) {
        return result;
      }
    }

    return null;
  }

  /**
   * Get file breadcrumbs (category path) from its path
   * @param path The file path to find
   * @returns Array of breadcrumb items (categories) leading to the file
   */
  static async getFileBreadcrumbs(
    path: string
  ): Promise<{ id: string; name: string; icon?: string }[]> {
    const index = await this.loadContentIndex();
    const breadcrumbs: { id: string; name: string; icon?: string }[] = [];

    // Check if it's a root file
    const rootFile = index.files.find((file) => file.path === path);
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
    for (const category of index.categories) {
      if (searchInCategory(category)) {
        break;
      }
    }

    return breadcrumbs;
  }

  /**
   * Load raw markdown content directly from a file
   * @param filepath The path of the markdown file to load
   * @returns An object with the raw markdown content and parsed frontmatter
   */
  static async loadMarkdownContent(
    filepath: string
  ): Promise<ParsedMarkdown | null> {
    try {
      // Get file metadata to enhance frontmatter if available
      const fileMetadata = await this.findFileMetadata(filepath);
      const baseUrl = this.getBaseContentUrl();

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

      // Parse frontmatter
      const { data: frontmatter, content } = matter(markdownText);

      // Merge file metadata with frontmatter if available
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
  }

  /**
   * Extract headings from markdown content for table of contents
   * @param markdownContent The markdown content to parse
   * @returns An array of heading objects with id, text, and level
   */
  static extractHeadingsFromMarkdown(markdownContent: string): Array<{
    id: string;
    text: string;
    level: number;
  }> {
    const headings: Array<{ id: string; text: string; level: number }> = [];
    const lines = markdownContent.split("\n");

    // Flag to track if we're inside a code block
    let inCodeBlock = false;

    for (const line of lines) {
      // Check if we're entering/exiting a code block
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // Skip heading detection inside code blocks
      if (inCodeBlock) continue;

      // Detect ATX-style headings (# Heading)
      const headingRegex = /^(\s*)(#{1,6})(\s+)(.+?)(\s+#+)?$/;
      const headingMatch = headingRegex.exec(line.trim());

      if (headingMatch) {
        const level = headingMatch[2].length;
        const text = headingMatch[4].trim();
        const id = this.slugify(text);

        if (text) {
          headings.push({ id, text, level });
        }
      }
    }

    return headings;
  }

  /**
   * Convert text to a URL-friendly slug
   * @param text The text to slugify
   * @returns A slugified version of the text
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/\-\-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+/, "") // Remove leading hyphens
      .replace(/-+$/, ""); // Remove trailing hyphens
  }

  /**
   * Download a markdown file
   * @param filename The filename to download as
   * @param content The content of the markdown file
   */
  static downloadMarkdown(filename: string, content: string): void {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });

    element.href = URL.createObjectURL(file);
    element.download = filename;

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
