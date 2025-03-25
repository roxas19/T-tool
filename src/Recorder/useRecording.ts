// src/recording/useRecording.ts
import { useState, useRef, useEffect, useCallback } from "react";
import { IDBPDatabase } from "idb";
import {
  initRecordingDB,
  flushQueueToIndexedDB,
  stitchChunks,
  downloadBlob,
  clearIndexedDBs,
} from "./recordingDB";

// Helper to create a delay promise.
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useRecording = () => {
  const [db, setDb] = useState<IDBPDatabase | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingQueue = useRef<Blob[]>([]);
  const hasRecordingStarted = useRef<boolean>(false);

  // Initialize IndexedDB on mount.
  useEffect(() => {
    const initDB = async () => {
      const dbInstance = await initRecordingDB();
      setDb(dbInstance);
    };
    initDB();
    return () => {
      clearIndexedDBs(db);
    };
    // We intentionally run this effect once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(
    (stream: MediaStream) => {
      if (!stream) return;
      streamRef.current = stream;
      try {
        const recorder = new MediaRecorder(stream, {
          mimeType: "video/webm; codecs=vp9",
        });
        recorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            console.log("New video chunk recorded:", event.data);
            recordingQueue.current.push(event.data);
            await flushQueueToIndexedDB(db, recordingQueue.current);
          }
        };
        // Start recording with a 10-second timeslice.
        recorder.start(10000);
        mediaRecorderRef.current = recorder;
      } catch (error) {
        console.error("Failed to start recording:", error);
      }
    },
    [db]
  );

  const stopRecording = useCallback(async () => {
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
      await flushQueueToIndexedDB(db, recordingQueue.current);
      setProcessing(true);
      // Start stitching immediately and wait concurrently for 1 second.
      const [finalBlob] = await Promise.all([stitchChunks(db), delay(1000)]);
      if (finalBlob) {
        console.log("Full recording Blob created:", finalBlob);
        downloadBlob(finalBlob, `recording-${Date.now()}.webm`);
      }
      setProcessing(false);
      clearIndexedDBs(db);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setProcessing(false);
    }
  }, [db]);

  const toggleRecording = useCallback(async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: { echoCancellation: true },
        });
        setRecordingStream(stream);
        setIsRecording(true);
        hasRecordingStarted.current = true;
        startRecording(stream);
      } catch (error) {
        console.error("Permission denied or error:", error);
      }
    } else {
      setIsRecording(false);
      if (recordingStream) {
        recordingStream.getTracks().forEach((track) => track.stop());
        setRecordingStream(null);
      }
      await stopRecording();
    }
  }, [isRecording, recordingStream, startRecording, stopRecording]);

  const downloadLast15Minutes = useCallback(async () => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.requestData();
        await delay(200);
        await flushQueueToIndexedDB(db, recordingQueue.current);
      }
      setProcessing(true);
      // Stitch chunks only from the last 15 minutes and wait concurrently.
      const [blob] = await Promise.all([stitchChunks(db, 15), delay(1000)]);
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
  }, [db]);

  return { isRecording, processing, toggleRecording, downloadLast15Minutes };
};
