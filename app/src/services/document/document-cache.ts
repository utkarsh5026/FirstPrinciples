import { type ParsedMarkdown, loadMarkdownContent } from "./document-loader";

/**
 * 📚 Document Cache Service
 *
 * A cozy little home for your documents! This service keeps your
 * frequently accessed markdown documents close at hand so you don't
 * have to wait for them to load every time.
 *
 * Think of it as a helpful librarian who remembers which books
 * you've been reading recently!
 */
export class DocumentCache {
  private static instance: DocumentCache;
  private readonly cache: Map<
    string,
    { document: ParsedMarkdown; timestamp: number }
  > = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * 🔒 Private constructor for our singleton pattern
   */
  private constructor() {}

  /**
   * 🏠 Get the single instance of our cache
   *
   * Everyone shares the same document library - this ensures
   * we're all on the same page!
   */
  public static getInstance(): DocumentCache {
    if (!DocumentCache.instance) {
      DocumentCache.instance = new DocumentCache();
    }
    return DocumentCache.instance;
  }

  /**
   * 📖 Fetch a document by its path
   *
   * First checks if we already have it on our shelf, and if not,
   * goes to fetch it from storage. Like a helpful librarian who
   * either hands you the book immediately or runs to the archives!
   */
  public async getDocument(path: string): Promise<ParsedMarkdown | null> {
    // Check cache
    const cached = this.cache.get(path);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.document;
    }

    try {
      const document = await loadMarkdownContent(path);

      if (document) {
        this.cache.set(path, {
          document,
          timestamp: Date.now(),
        });
      }

      return document;
    } catch (error) {
      console.error(`Error loading document: ${path}`, error);
      return null;
    }
  }

  /**
   * 🧹 Clear the entire cache
   *
   * Sometimes you just need a fresh start! This removes all
   * documents from our temporary storage, like cleaning off
   * an entire bookshelf.
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * 🗑️ Remove a specific document from cache
   *
   * When a particular document needs refreshing, this removes
   * just that one from our collection so it will be fetched
   * fresh next time.
   */
  public removeFromCache(path: string): void {
    this.cache.delete(path);
  }
}
