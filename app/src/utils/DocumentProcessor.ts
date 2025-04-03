import { v4 as uuidv4 } from "uuid"; // You'll need to install this package

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

/**
 * DocumentProcessor is a utility class that processes documents and their blocks,
 * ensuring they have unique IDs and preparing them for navigation.
 */
export class DocumentProcessor {
  /**
   * Process a document by ensuring all blocks have unique IDs
   * and preparing headings for navigation.
   *
   * @param document The document to process
   * @returns The processed document with IDs assigned to all blocks
   */
  static processDocument(document: Document): Document {
    // Create a copy of the document to avoid mutating the original
    const processedDoc: Document = {
      ...document,
      blocks: document.blocks.map((block) => this.processBlock(block)),
    };

    return processedDoc;
  }

  /**
   * Process a block by ensuring it has a unique ID.
   * For heading blocks, generate a navigation-friendly ID based on content.
   *
   * @param block The block to process
   * @returns The processed block with ID assigned
   */
  static processBlock(block: Block): Block {
    // If the block already has an ID, use it
    if (block.id) {
      return block;
    }

    // Generate a unique ID
    const id = this.generateId(block);

    // Create a new block with the ID
    const processedBlock = {
      ...block,
      id,
    };

    // For list blocks, process each item to ensure they have IDs
    if (this.isList(processedBlock)) {
      return {
        ...processedBlock,
        items: processedBlock.items.map((item) => ({
          ...item,
          id: item.id || uuidv4(),
        })),
      };
    }

    return processedBlock;
  }

  /**
   * Generate an ID for a block. For heading blocks, generate a slug based on content.
   * For other blocks, generate a UUID.
   *
   * @param block The block to generate an ID for
   * @returns The generated ID
   */
  static generateId(block: Block): string {
    // For heading blocks, generate a slug based on content
    if (this.isHeading(block)) {
      const textBlock = block as TextBlock;
      return `heading-${this.slugify(textBlock.content)}`;
    }

    // For other blocks, generate a UUID
    return uuidv4();
  }

  /**
   * Convert a string to a slug for use in URLs or IDs.
   *
   * @param text The text to convert to a slug
   * @returns The slugified text
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

  /**
   * Check if a block is a heading block.
   *
   * @param block The block to check
   * @returns True if the block is a heading block, false otherwise
   */
  static isHeading(block: Block): boolean {
    return ["heading-1", "heading-2", "heading-3"].includes(block.type);
  }

  /**
   * Check if a block is a list block.
   *
   * @param block The block to check
   * @returns True if the block is a list block, false otherwise
   */
  static isList(block: Block): block is ListBlock {
    return ["bulleted-list", "numbered-list"].includes(block.type);
  }

  /**
   * Generate a table of contents from a document.
   *
   * @param document The document to generate a table of contents from
   * @returns An array of TOC items with id, content, level, and indentation
   */
  static generateTableOfContents(document: Document) {
    const toc = document.blocks
      .filter((block) => this.isHeading(block))
      .map((block) => {
        const textBlock = block as TextBlock;
        const level = parseInt(block.type.split("-")[1]);
        return {
          id: block.id,
          content: textBlock.content,
          level,
          indent: (level - 1) * 16, // 16px per level of indentation
        };
      });

    return toc;
  }
}
