/**
 * A type representing a reading history item
 */
export type ReadingHistoryItem = {
  path: string;
  title: string;
  lastReadAt: number; // timestamp
  readCount: number;
};

/**
 * A type representing a reading todo item
 */
export type ReadingTodoItem = {
  id: string;
  path: string;
  title: string;
  addedAt: number; // timestamp
  completed: boolean;
};
