import React, { useEffect, useRef } from "react";
import { openDB, IDBPDatabase } from "idb";
import "./css/Recording.css";

type RecordingProps = {
  isRecording: boolean;
};

const Recording: React.FC<RecordingProps> = ({ isRecording }) => {
  const [db, setDb] = React.useState<IDBPDatabase | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingQueue = useRef<Blob[]>([]);

  // Initialize IndexedDB for recording
  useEffect(() => {
    const initDB = async () => {
      try {
        await indexedDB.deleteDatabase("RecordingDB");
        console.log("Old RecordingDB deleted successfully.");

        const recordingDb = await openDB("RecordingDB", 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains("chunks")) {
              db.createObjectStore("chunks", { keyPath: "id", autoIncrement: true });
            }
          },
        });

        console.log("New IndexedDB initialized.");
        setDb(recordingDb);
      } catch (error) {
        console.error("Failed to initialize IndexedDB:", error);
      }
    };

    initDB();

    return () => {
      clearIndexedDBs();
    };
  }, []);

  // Start or stop recording based on the isRecording prop
  useEffect(() => {
    if (isRecording) {
      console.log("Recording started.");
      startRecording();
    } else {
      console.log("Recording stopped.");
      stopRecording();
    }
  }, [isRecording]);

  // Start recording using getDisplayMedia and a MediaRecorder instance
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
          recordingQueue.current.push(event.data);
          flushQueueToIndexedDB();
        }
      };

      // Start recording with a 10-second timeslice.
      recorder.start(10000);
      mediaRecorderRef.current = recorder;
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  // Stop recording and flush any pending data
  const stopRecording = async () => {
    try {
      if (mediaRecorderRef.current) {
        // Request any pending data and then stop the recorder.
        mediaRecorderRef.current.requestData();
        await new Promise((resolve) => setTimeout(resolve, 200));
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      console.log("Flushing remaining chunks to IndexedDB...");
      await flushQueueToIndexedDB();

      console.log("Preparing full recording for download...");
      const finalBlob = await stitchChunks(); // Stitch all chunks together for the full recording
      if (finalBlob) {
        console.log("Full recording Blob created:", finalBlob);
        downloadBlob(finalBlob, `recording-${Date.now()}.webm`);
      }

      clearIndexedDBs();
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  // Flush the in-memory recording queue into the IndexedDB store ("chunks")
  const flushQueueToIndexedDB = async () => {
    if (!db || recordingQueue.current.length === 0) return;
    const tx = db.transaction("chunks", "readwrite");
    const store = tx.store;
    while (recordingQueue.current.length > 0) {
      const chunk = recordingQueue.current.shift();
      if (chunk) {
        await store.add({ data: chunk, timestamp: Date.now() });
      }
    }
    await tx.done;
  };

  // Stitch together chunks from IndexedDB; if lastMinutes is provided, only include chunks within that time window.
  const stitchChunks = async (lastMinutes = 0): Promise<Blob | null> => {
    if (!db) return null;
    const tx = db.transaction("chunks", "readonly");
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

  // Create a temporary anchor to download the blob as a file.
  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear the IndexedDB store ("chunks") after downloading.
  const clearIndexedDBs = async () => {
    if (db) {
      const tx = db.transaction("chunks", "readwrite");
      await tx.store.clear();
    }
  };

  // This component is now headless; it does not render any UI.
  // All recording UI is handled by the main toolbar's RecordButton.
  return null;
};

export default Recording;
