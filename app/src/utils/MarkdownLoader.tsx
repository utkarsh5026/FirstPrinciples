// src/utils/markdown-loader.ts
import matter from "gray-matter";
import { Buffer } from "buffer";

// Make Buffer globally available
// Add this line right after the imports
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
 * Helper class for loading and handling markdown files
 */
export class MarkdownLoader {
  /**
   * Fetch all available markdown files from the content directory
   * @returns A list of available markdown files
   */
  static async getAvailableFiles(): Promise<string[]> {
    try {
      // Fetch the index file which lists all available md files
      const response = await fetch("/content/index.json");
      if (!response.ok) {
        throw new Error("Failed to load content index");
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error("Error loading markdown file list:", error);
      return [];
    }
  }

  /**
   * Get categories from the index file
   * @returns A map of categories to file arrays
   */
  static async getCategories(): Promise<Record<string, string[]>> {
    try {
      const response = await fetch("/content/index.json");
      if (!response.ok) {
        throw new Error("Failed to load content index");
      }

      const data = await response.json();
      return data.categories || {};
    } catch (error) {
      console.error("Error loading categories:", error);
      return {};
    }
  }

  /**
   * Load raw markdown content directly from a file
   * @param filename The name of the markdown file to load
   * @returns An object with the raw markdown content and parsed frontmatter
   */
  static async loadMarkdownContent(
    filename: string
  ): Promise<ParsedMarkdown | null> {
    try {
      // Fetch the markdown file
      const response = await fetch(`/content/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load markdown file: ${filename}`);
      }

      const markdownText = await response.text();

      // Parse frontmatter
      const { data: frontmatter, content } = matter(markdownText);

      return {
        content,
        frontmatter: frontmatter as MarkdownFrontmatter,
      };
    } catch (error) {
      console.error(`Error loading markdown file ${filename}:`, error);
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

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        const id = this.slugify(text);

        headings.push({
          id,
          text,
          level,
        });
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
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
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
