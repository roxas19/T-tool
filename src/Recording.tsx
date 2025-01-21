import React, { useEffect, useRef } from "react";
import { openDB, IDBPDatabase } from "idb";
import "./Recording.css";

type RecordingProps = {
  isRecording: boolean;
};

const Recording: React.FC<RecordingProps> = ({ isRecording }) => {
  const [db, setDb] = React.useState<IDBPDatabase | null>(null);
  const [playbackDb, setPlaybackDb] = React.useState<IDBPDatabase | null>(null); // For 15-minute playback storage
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingQueue = useRef<Blob[]>([]);

  useEffect(() => {
    const initDBs = async () => {
      try {
        await indexedDB.deleteDatabase("RecordingDB");
        await indexedDB.deleteDatabase("PlaybackDB");
        console.log("Old IndexedDBs deleted successfully.");

        const recordingDb = await openDB("RecordingDB", 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains("chunks")) {
              db.createObjectStore("chunks", { keyPath: "id", autoIncrement: true });
            }
          },
        });

        const playbackDb = await openDB("PlaybackDB", 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains("playback")) {
              db.createObjectStore("playback", { keyPath: "id" });
            }
          },
        });

        console.log("New IndexedDBs initialized.");
        setDb(recordingDb);
        setPlaybackDb(playbackDb);
      } catch (error) {
        console.error("Failed to initialize IndexedDBs:", error);
      }
    };

    initDBs();

    return () => {
      clearIndexedDBs();
    };
  }, []);

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
          recordingQueue.current.push(event.data);

          flushQueueToIndexedDB();
        }
      };

      recorder.start(10000); // Save chunks every 10 seconds
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
        downloadBlob(finalBlob, `recording-${Date.now()}.webm`);
      }

      clearIndexedDBs();
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };
  const flushQueueToIndexedDB = async () => {
    if (!db || recordingQueue.current.length === 0) return;

    const tx = db.transaction("chunks", "readwrite");
    const store = tx.store;

    while (recordingQueue.current.length > 0) {
      const chunk = recordingQueue.current.shift();
      if (chunk) await store.add({ data: chunk, timestamp: Date.now() });
    }
    await tx.done;
  };

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

  const getPlaybackBlob = async (): Promise<Blob | null> => {
    const blob = await stitchChunks(15); // Retrieve the last 15 minutes
    return blob;
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearIndexedDBs = async () => {
    if (db) {
      const tx = db.transaction("chunks", "readwrite");
      await tx.store.clear();
    }
    if (playbackDb) {
      const tx = playbackDb.transaction("playback", "readwrite");
      await tx.store.clear();
    }
  };

  return (
    <div className="recording-toolbar">
      <div className="recording-status">
        {isRecording ? "Recording in progress..." : "Recording stopped"}
      </div>
      <button
        onClick={async () => {
          const blob = await getPlaybackBlob();
          if (blob) downloadBlob(blob, `last-15-minutes-${Date.now()}.webm`);
          else console.warn("No video data available for the last 15 minutes.");
        }}
        disabled={!isRecording}
        className="recording-button"
      >
        Download Last 15 Minutes
      </button>
    </div>
  );
};

export default Recording;
