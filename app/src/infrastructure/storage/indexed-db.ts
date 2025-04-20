/**
 * 📚 Core service for managing IndexedDB operations
 *
 * This service provides a friendly interface to work with IndexedDB.
 * It handles all the low-level database operations so you don't have to!
 * Perfect for storing reading history, sessions, and user progress.
 */
export class DatabaseService {
  private readonly DB_NAME = "firstPrinciplesDB";
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;

  private readonly cache: Map<string, { data: unknown; timestamp: number }> =
    new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache lifetime

  /**
   * 🚀 Sets up the database and creates all necessary storage containers
   *
   * This initializes our app's database and creates all the object stores
   * we need for tracking reading history, sessions, lists, and achievements.
   */
  public async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = (event) => {
        console.error("Database error:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log("Database initialized successfully");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("readingHistory")) {
          const historyStore = db.createObjectStore("readingHistory", {
            keyPath: "id",
            autoIncrement: true,
          });
          historyStore.createIndex("path", "path", { unique: false });
          historyStore.createIndex("lastReadAt", "lastReadAt", {
            unique: false,
          });
        }

        if (!db.objectStoreNames.contains("readingSessions")) {
          const sessionsStore = db.createObjectStore("readingSessions", {
            keyPath: "id",
            autoIncrement: true,
          });
          sessionsStore.createIndex("path", "path", { unique: false });
          sessionsStore.createIndex("startTime", "startTime", {
            unique: false,
          });
          sessionsStore.createIndex("endTime", "endTime", { unique: false });
        }

        if (!db.objectStoreNames.contains("readingLists")) {
          const todoStore = db.createObjectStore("readingLists", {
            keyPath: "id",
          });
          todoStore.createIndex("path", "path", { unique: false });
          todoStore.createIndex("completed", "completed", { unique: false });
        }

        if (!db.objectStoreNames.contains("stats")) {
          db.createObjectStore("stats", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("achievements")) {
          db.createObjectStore("achievements", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("challenges")) {
          db.createObjectStore("challenges", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("sectionReadings")) {
          const sectionStore = db.createObjectStore("sectionReadings", {
            keyPath: "id",
            autoIncrement: true,
          });
          sectionStore.createIndex("documentPath", "documentPath", {
            unique: false,
          });
          sectionStore.createIndex("sectionId", "sectionId", { unique: false });
          sectionStore.createIndex("startTime", "startTime", { unique: false });
          sectionStore.createIndex("category", "category", { unique: false });
          sectionStore.createIndex("wordCount", "wordCount", { unique: false });
          sectionStore.createIndex("lastReadAt", "lastReadAt", {
            unique: false,
          });
          sectionStore.createIndex("isComplete", "isComplete", {
            unique: false,
          });

          // Compound indexes for more complex queries
          sectionStore.createIndex(
            "category_lastReadAt",
            ["category", "lastReadAt"],
            { unique: false }
          );
        }

        // Document Stats store
        if (!db.objectStoreNames.contains("documentStats")) {
          const docStatsStore = db.createObjectStore("documentStats", {
            keyPath: "path",
          });
          docStatsStore.createIndex("path", "path", { unique: true });
          docStatsStore.createIndex(
            "completionPercentage",
            "completionPercentage",
            { unique: false }
          );
          docStatsStore.createIndex("lastReadAt", "lastReadAt", {
            unique: false,
          });
          docStatsStore.createIndex("category", "category", {
            unique: false,
          });
        }
      };
    });
  }

  /**
   * ✨ Adds a new item to our database
   *
   * Like adding a new book to your shelf! This stores a new item
   * in the specified collection.
   */
  public async add<T>(storeName: string, item: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => {
        resolve(request.result);
        this.invalidateCache(storeName);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 📋 Gets all items from a collection
   *
   * Fetches everything from a specific storage area, like getting
   * all books from your bookshelf at once.
   */
  public async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const cacheKey = `getAll_${storeName}`;
      const cached = this.getFromCache<T[]>(cacheKey);
      if (cached) {
        resolve(cached);
        return;
      }

      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result as T[];
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        resolve(result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 🔍 Finds a specific item by its unique key
   *
   * Like finding a specific book when you know exactly where it is!
   * This retrieves a single item using its unique identifier.
   */
  public async getByKey<T>(
    storeName: string,
    key: IDBValidKey
  ): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result as T);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 🧩 Finds items by a specific property
   *
   * Like finding all books by your favorite author! This searches
   * for items that match a specific characteristic.
   */
  public async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: string | number | Date
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const cacheKey = `getByIndex_${storeName}_${indexName}_${value}`;
      const cached = this.getFromCache<T[]>(cacheKey);
      if (cached) {
        resolve(cached);
        return;
      }

      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        const result = request.result as T[];
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        resolve(result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 📝 Updates an existing item
   *
   * Like updating the notes in your favorite book! This changes
   * the information for an item that's already in the database.
   */
  public async update<T extends { id: IDBValidKey }>(
    storeName: string,
    item: T
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve();
        this.invalidateCache(storeName);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 🗑️ Removes an item from the database
   *
   * Like taking a book off your shelf when you're done with it!
   * This permanently removes an item from storage.
   */
  public async delete(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 🧹 Cleans out an entire collection
   *
   * Like clearing an entire bookshelf to start fresh! This removes
   * all items from a specific storage area.
   */
  public async clearStore(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
        this.invalidateCache(storeName);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 🧹 Invalidates the cache for a specific store
   *
   * Clears the cache for a specific store or all stores if no store name is provided.
   */
  public invalidateCache(storeName?: string): void {
    if (storeName) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`getAll_${storeName}`)) {
          this.cache.delete(key);
        }
      }
    } else this.cache.clear();
  }

  private getFromCache<T>(cacheKey: string): T | undefined {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return undefined;
  }
}
