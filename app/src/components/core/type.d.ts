// src/types/document.ts

/**
 * Represents the different types of blocks that can exist in our document
 */
export type BlockType =
  | "paragraph"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "bulleted-list"
  | "numbered-list"
  | "code"
  | "quote"
  | "divider"
  | "image";

/**
 * Base interface for all block types
 */
export interface BaseBlock {
  id: string;
  type: BlockType;
}

/**
 * Text-based block with content
 */
export interface TextBlock extends BaseBlock {
  type: "paragraph" | "heading-1" | "heading-2" | "heading-3" | "quote";
  content: string;
}

/**
 * List item with content
 */
export interface ListItemBlock {
  id: string;
  content: string;
}

/**
 * List block containing multiple list items
 */
export interface ListBlock extends BaseBlock {
  type: "bulleted-list" | "numbered-list";
  items: ListItemBlock[];
}

/**
 * Code block with content and optional language
 */
export interface CodeBlock extends BaseBlock {
  type: "code";
  content: string;
  language?: string;
}

/**
 * Simple divider block
 */
export interface DividerBlock extends BaseBlock {
  type: "divider";
}

/**
 * Image block with source URL and optional caption
 */
export interface ImageBlock extends BaseBlock {
  type: "image";
  url: string;
  caption?: string;
}

/**
 * Union type of all possible block types
 */
export type Block =
  | TextBlock
  | ListBlock
  | CodeBlock
  | DividerBlock
  | ImageBlock;

/**
 * Represents a complete document made up of blocks
 */
export interface Document {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}
