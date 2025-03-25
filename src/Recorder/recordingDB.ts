// src/recording/recordingDB.ts
import { openDB, IDBPDatabase } from "idb";

export const DB_NAME = "RecordingDB";
export const STORE_NAME = "chunks";

/** Initializes the IndexedDB by deleting any old version and creating a new one. */
export const initRecordingDB = async (): Promise<IDBPDatabase | null> => {
  try {
    await indexedDB.deleteDatabase(DB_NAME);
    console.log("Old RecordingDB deleted successfully.");
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        }
      },
    });
    console.log("New IndexedDB initialized.");
    return db;
  } catch (error) {
    console.error("Failed to initialize IndexedDB:", error);
    return null;
  }
};

/** Flushes an array of Blob chunks to the IndexedDB store. */
export const flushQueueToIndexedDB = async (db: IDBPDatabase | null, queue: Blob[]): Promise<void> => {
  if (!db || queue.length === 0) return;
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.store;
  while (queue.length > 0) {
    const chunk = queue.shift();
    if (chunk) {
      await store.add({ data: chunk, timestamp: Date.now() });
    }
  }
  await tx.done;
};

/** Stitches together Blob chunks stored in IndexedDB. Optionally, only include chunks within the last "lastMinutes". */
export const stitchChunks = async (db: IDBPDatabase | null, lastMinutes = 0): Promise<Blob | null> => {
  if (!db) return null;
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.store;
  const now = Date.now();
  const timeLimit = lastMinutes ? now - lastMinutes * 60 * 1000 : 0;
  const chunks: Blob[] = [];
  let cursor = await store.openCursor();
  while (cursor) {
    if (!lastMinutes || cursor.value.timestamp >= timeLimit) {
      chunks.push(cursor.value.data);
    }
    cursor = await cursor.continue();
  }
  if (chunks.length === 0) return null;
  return new Blob(chunks, { type: "video/webm" });
};

/** Triggers a download of the provided Blob with the given file name. */
export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

/** Clears the IndexedDB store. */
export const clearIndexedDBs = async (db: IDBPDatabase | null): Promise<void> => {
  if (db) {
    const tx = db.transaction(STORE_NAME, "readwrite");
    await tx.store.clear();
  }
};
