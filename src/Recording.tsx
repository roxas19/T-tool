import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { openDB, IDBPDatabase } from "idb";
import "./css/ProcessingOverlay.css"; // Import the CSS file for the overlay styles

export type RecordingHandle = {
  downloadLast15Minutes: () => void;
};

type RecordingProps = {
  isRecording: boolean;
  stream: MediaStream | null;
};

// Helper to create a delay promise.
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A headless component for recording video. It captures chunks via MediaRecorder,
 * stores them in IndexedDB, and supports downloading either the full recording (on stop)
 * or the last 15 minutes (via an imperative handle).
 *
 * A 1‑second buffer is used before triggering the download: the stitching process begins
 * immediately in parallel, and once both stitching and the 1‑second delay complete, the download is prompted.
 *
 * A flag (hasRecordingStarted) is used to avoid showing the processing overlay on initial load.
 */
const Recording = forwardRef<RecordingHandle, RecordingProps>(
  ({ isRecording, stream }, ref) => {
    const [db, setDb] = useState<IDBPDatabase | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordingQueue = useRef<Blob[]>([]);
    const hasRecordingStarted = useRef<boolean>(false);

    // Initialize IndexedDB when the component mounts.
    useEffect(() => {
      const initDB = async () => {
        try {
          await indexedDB.deleteDatabase("RecordingDB");
          console.log("Old RecordingDB deleted successfully.");

          const recordingDb = await openDB("RecordingDB", 1, {
            upgrade(db) {
              if (!db.objectStoreNames.contains("chunks")) {
                db.createObjectStore("chunks", {
                  keyPath: "id",
                  autoIncrement: true,
                });
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

      // Clear IndexedDB on component unmount.
      return () => {
        clearIndexedDBs();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Start or stop recording based on the isRecording prop and stream availability.
    useEffect(() => {
      if (isRecording && stream) {
        // Mark that a recording session has started.
        if (!hasRecordingStarted.current) {
          hasRecordingStarted.current = true;
          console.log("Recording started.");
          startRecording();
        } else {
          // In case isRecording toggles to true again while a session is already in progress.
          console.log("Recording already in progress.");
        }
      } else if (!isRecording && hasRecordingStarted.current) {
        console.log("Recording stopped.");
        stopRecording();
      } else if (!isRecording && !hasRecordingStarted.current) {
        // No recording session has started yet; we clear IndexedDB silently.
        clearIndexedDBs();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRecording, stream]);

    // Starts recording using a MediaRecorder that emits data every 10 seconds.
    const startRecording = () => {
      try {
        if (!stream) {
          console.error("No media stream provided for recording.");
          return;
        }
        streamRef.current = stream;
        const recorder = new MediaRecorder(stream, {
          mimeType: "video/webm; codecs=vp9",
        });
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

    // Stops recording, flushes pending data, then concurrently stitches the video and waits 1 second before downloading.
    const stopRecording = async () => {
      try {
        if (mediaRecorderRef.current) {
          // Request any pending data so the final incomplete chunk is captured.
          mediaRecorderRef.current.requestData();
          await delay(200); // Allow time for final chunk.
          mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        await flushQueueToIndexedDB();

        setProcessing(true);
        // Start stitching immediately and concurrently wait for 1 second.
        const [finalBlob] = await Promise.all([stitchChunks(), delay(1000)]);

        if (finalBlob) {
          console.log("Full recording Blob created:", finalBlob);
          downloadBlob(finalBlob, `recording-${Date.now()}.webm`);
        }
        setProcessing(false);
        clearIndexedDBs();
      } catch (error) {
        console.error("Failed to stop recording:", error);
        setProcessing(false);
      }
    };

    // Flush the in-memory recording queue to the IndexedDB store ("chunks").
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

    // Stitch together chunks from IndexedDB. When lastMinutes > 0, only include chunks within that time window.
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

    // Create a temporary anchor element to trigger the download of the blob.
    const downloadBlob = (blob: Blob, fileName: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    };

    // Clear the IndexedDB store ("chunks").
    const clearIndexedDBs = async () => {
      if (db) {
        const tx = db.transaction("chunks", "readwrite");
        await tx.store.clear();
      }
    };

    /**
     * Exposed method to download the last 15 minutes of recording.
     * This method flushes any pending data (thus capturing the final incomplete chunk)
     * and then concurrently starts stitching and a 1-second delay before triggering the download.
     */
    const downloadLast15Minutes = async () => {
      try {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          mediaRecorderRef.current.requestData();
          await delay(200);
          await flushQueueToIndexedDB();
        }

        setProcessing(true);
        // Start stitching for the last 15 minutes immediately and concurrently wait for 1 second.
        const [blob] = await Promise.all([stitchChunks(15), delay(1000)]);

        if (blob) {
          console.log("Last 15 minutes Blob created:", blob);
          downloadBlob(blob, `recording-last15-${Date.now()}.webm`);
        } else {
          console.log("No recording available for the last 15 minutes.");
        }
        setProcessing(false);
      } catch (error) {
        console.error("Failed to download last 15 minutes:", error);
        setProcessing(false);
      }
    };

    // Expose the downloadLast15Minutes method to parent components.
    useImperativeHandle(ref, () => ({
      downloadLast15Minutes,
    }));

    return (
      <>
        {processing && (
          <div className="processing-overlay">
            <div className="processing-message">Processing video...</div>
          </div>
        )}
      </>
    );
  }
);

export default Recording;
