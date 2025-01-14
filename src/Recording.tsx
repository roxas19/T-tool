import React, { useEffect, useRef } from "react";
import { openDB, IDBPDatabase } from "idb"; // For IndexedDB storage
import "./Recording.css"; // Minimal UI styles

type RecordingProps = {
  isRecording: boolean; // Accepts isRecording as a prop
};

const Recording: React.FC<RecordingProps> = ({ isRecording }) => {
  const [bufferChunks, setBufferChunks] = React.useState<Blob[]>([]);
  const [db, setDb] = React.useState<IDBPDatabase | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bufferSize = 15 * 60 / 10; // 90 chunks for 15 minutes (10s chunks)

  useEffect(() => {
    // Initialize IndexedDB on component mount
    const initDB = async () => {
      const db = await openDB("RecordingDB", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("chunks")) {
            db.createObjectStore("chunks", { keyPath: "id", autoIncrement: true });
          }
        },
      });
      setDb(db);
    };
    initDB();
  }, []);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const startRecording = async () => {
    // Reset MediaRecorder and bufferChunks before starting
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    setBufferChunks([]);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: { echoCancellation: true },
      });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          setBufferChunks((prev) => {
            const updated = [...prev, event.data];
            return updated.length > bufferSize ? updated.slice(-bufferSize) : updated;
          });

          if (db) {
            await db.put("chunks", { data: event.data, timestamp: Date.now() });
          }
        }
      };

      recorder.start(10000); // Record in 10-second chunks
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    console.log("Recording stopped. Preparing final video...");
    await stitchChunks();
    await clearIndexedDB(); // Clear old data after stitching
  };

  const stitchChunks = async () => {
    if (!db) return;

    const chunks = [];
    let cursor = await db.transaction("chunks").objectStore("chunks").openCursor();

    while (cursor) {
      chunks.push(cursor.value.data);
      cursor = await cursor.continue();
    }

    const fullBlob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(fullBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);

    console.log("Final video stitched and saved.");
  };

  const clearIndexedDB = async () => {
    if (db) {
      const tx = db.transaction("chunks", "readwrite");
      const store = tx.objectStore("chunks");
      await store.clear();
      console.log("IndexedDB cleared.");
    }
  };

  return (
    <div>
      {isRecording && <div className="recording-indicator">Recording in progress...</div>}
    </div>
  );
};

export default Recording;
