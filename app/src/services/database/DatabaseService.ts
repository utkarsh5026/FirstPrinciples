/**
 * Core service for managing IndexedDB operations
 */
export class DatabaseService {
  private readonly DB_NAME = "firstPrinciplesDB";
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;

  /**
   * Initialize the database and create object stores
   * @returns Promise that resolves when database is ready
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

        // Create the object stores

        // Reading History store
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

        // Reading Sessions store (for tracking time spent)
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

        // Reading Lists (todo) store
        if (!db.objectStoreNames.contains("readingLists")) {
          const todoStore = db.createObjectStore("readingLists", {
            keyPath: "id",
          });
          todoStore.createIndex("path", "path", { unique: false });
          todoStore.createIndex("completed", "completed", { unique: false });
        }

        // Stats store
        if (!db.objectStoreNames.contains("stats")) {
          db.createObjectStore("stats", { keyPath: "id" });
        }

        // Achievements store
        if (!db.objectStoreNames.contains("achievements")) {
          db.createObjectStore("achievements", { keyPath: "id" });
        }

        // Challenges store
        if (!db.objectStoreNames.contains("challenges")) {
          db.createObjectStore("challenges", { keyPath: "id" });
        }
      };
    });
  }

  /**
   * Add an item to a specific object store
   * @param storeName The object store name
   * @param item The item to add
   * @returns Promise with the generated key
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
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get all items from a specific object store
   * @param storeName The object store name
   * @returns Promise with the array of items
   */
  public async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as T[]);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get an item by its key from a specific object store
   * @param storeName The object store name
   * @param key The key to retrieve
   * @returns Promise with the item or undefined if not found
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
   * Get items by an index value from a specific object store
   * @param storeName The object store name
   * @param indexName The index name
   * @param value The value to search for
   * @returns Promise with an array of matching items
   */
  public async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve(request.result as T[]);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Update an item in a specific object store
   * @param storeName The object store name
   * @param item The item to update (must include the key)
   * @returns Promise that resolves when the update is complete
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
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Delete an item from a specific object store
   * @param storeName The object store name
   * @param key The key of the item to delete
   * @returns Promise that resolves when the deletion is complete
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
   * Clear all data from a specific object store
   * @param storeName The object store name
   * @returns Promise that resolves when the store is cleared
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
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

// Create and export a singleton instance
export const databaseService = new DatabaseService();
