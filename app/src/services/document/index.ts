import {
  loadMarkdownContent,
  getCategories,
  getFileBreadcrumbs,
  type ContentIndex,
  type Category,
  type FileMetadata,
  type ParsedMarkdown,
} from "./document-loader";
import {
  extractHeadingsFromMarkdown,
  slugify,
  getFilenameFromPath,
} from "./document-parser";

export {
  loadMarkdownContent,
  getCategories,
  extractHeadingsFromMarkdown,
  slugify,
  getFilenameFromPath,
  getFileBreadcrumbs,
  type ContentIndex,
  type Category,
  type FileMetadata,
  type ParsedMarkdown,
};
