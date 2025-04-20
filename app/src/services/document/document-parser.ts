/**
 * 📄 Document Parser Utilities
 *
 * A collection of helpful functions for parsing and processing markdown documents.
 * These utilities make working with markdown content a breeze!
 */

/**
 * 🏷️ Converts a file path into a pretty, readable title
 *
 * Takes those ugly file paths and transforms them into beautiful,
 * human-friendly titles by removing extensions and formatting nicely!
 */
const getFilenameFromPath = (path: string): string => {
  const parts = path.split("/");
  const filename = parts[parts.length - 1];

  return filename
    .replace(".md", "") // extension
    .replace(/_/g, " ") // underscores
    .replace(/-/g, " ") // dashes
    .replace(/\b\w/g, (l) => l.toUpperCase()); // capitalize first letter of each word
};

/**
 * 📚 Extracts headings from markdown content
 *
 * Magically finds all the headings in your markdown and organizes them
 * into a structured format perfect for building tables of contents!
 * Smart enough to ignore headings inside code blocks too! ✨
 */
const extractHeadingsFromMarkdown = (
  markdownContent: string
): Array<{
  id: string;
  text: string;
  level: number;
}> => {
  const headings: Array<{ id: string; text: string; level: number }> = [];
  const lines = markdownContent.split("\n");

  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    const headingRegex = /^(\s*)(#{1,6})(\s+)(.+?)(\s+#+)?$/;
    const headingMatch = headingRegex.exec(line.trim());

    if (headingMatch) {
      const level = headingMatch[2].length;
      const text = headingMatch[4].trim();
      const id = slugify(text);

      if (text) {
        headings.push({ id, text, level });
      }
    }
  }

  return headings;
};

/**
 * 🔗 Creates URL-friendly slugs from text
 *
 * Transforms any text into clean, SEO-friendly strings perfect for IDs and URLs!
 * Makes your navigation and linking systems work beautifully with any content! 🌟
 */
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Remove leading hyphens
    .replace(/-+$/, ""); // Remove trailing hyphens
};

export { getFilenameFromPath, extractHeadingsFromMarkdown, slugify };
