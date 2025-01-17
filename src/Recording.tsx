import React, { useEffect, useRef } from "react";
import { openDB, IDBPDatabase } from "idb";

type RecordingProps = {
  isRecording: boolean;
};

const Recording: React.FC<RecordingProps> = ({ isRecording }) => {
  const [db, setDb] = React.useState<IDBPDatabase | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingQueue = useRef<Blob[]>([]); // Queue for chunks

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        await indexedDB.deleteDatabase("RecordingDB");
        console.log("Old IndexedDB deleted successfully.");

        const db = await openDB("RecordingDB", 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains("chunks")) {
              db.createObjectStore("chunks", { keyPath: "id", autoIncrement: true });
            }
          },
        });

        console.log("New IndexedDB initialized.");
        setDb(db);
      } catch (error) {
        console.error("Failed to initialize IndexedDB:", error);
      }
    };

    initDB();

    return () => {
      clearIndexedDB();
    };
  }, []);

  // Trigger recording start/stop
  useEffect(() => {
    if (isRecording) {
      console.log("Recording started.");
      startRecording();
    } else {
      console.log("Recording stopped.");
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: { echoCancellation: true },
      });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("New video chunk recorded:", event.data);
          recordingQueue.current.push(event.data); // Add chunk to queue

          // Periodically flush the queue to IndexedDB
          setTimeout(async () => {
            await flushQueueToIndexedDB();
          }, 10000); // Every 10 seconds
        }
      };

      recorder.start(10000); // Record in 10-second chunks
      mediaRecorderRef.current = recorder;
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      console.log("Flushing remaining chunks to IndexedDB...");
      await flushQueueToIndexedDB();

      console.log("Preparing full recording for download...");
      const finalBlob = await stitchChunks();
      if (finalBlob) {
        console.log("Full recording Blob created:", finalBlob);
        downloadBlob(finalBlob);
      }

      clearIndexedDB();
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const flushQueueToIndexedDB = async () => {
    if (!db || recordingQueue.current.length === 0) {
      console.warn("Nothing to flush to IndexedDB.");
      return;
    }

    try {
      const tx = db.transaction("chunks", "readwrite");
      const store = tx.store;

      while (recordingQueue.current.length > 0) {
        const chunk = recordingQueue.current.shift();
        if (chunk) {
          console.log("Flushing chunk to IndexedDB:", chunk);
          await store.add({ data: chunk });
        }
      }

      console.log("All queued chunks flushed to IndexedDB.");
      await tx.done;
    } catch (error) {
      console.error("Failed to flush queue to IndexedDB:", error);
    }
  };
  const clearIndexedDB = async () => {
    if (db) {
      try {
        const tx = db.transaction("chunks", "readwrite");
        await tx.store.clear();
        console.log("IndexedDB cleared.");
      } catch (error) {
        console.error("Failed to clear IndexedDB:", error);
      }
    }
  };

  const stitchChunks = async (): Promise<Blob | null> => {
    if (!db) return null;

    const tx = db.transaction("chunks", "readonly");
    const store = tx.store;
    const allChunks: Blob[] = [];

    let cursor = await store.openCursor();
    while (cursor) {
      console.log("Retrieved chunk for stitching:", cursor.value.data);
      allChunks.push(cursor.value.data);
      cursor = await cursor.continue();
    }

    if (allChunks.length === 0) {
      console.warn("No chunks to stitch.");
      return null;
    }

    return new Blob(allChunks, { type: "video/webm" });
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {isRecording && <div>Recording in progress...</div>}
      {!isRecording && <div>Recording stopped. Preparing the file...</div>}
    </div>
  );
};

export default Recording;
