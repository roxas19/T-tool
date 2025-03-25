// src/SmallWebcam.tsx
import React, { useEffect, useRef, useState } from "react";
import "./css/Webcam.css";

const SmallWebcam: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  useEffect(() => {
    const startMedia = async () => {
      try {
        // Stop any existing stream.
        if (videoStream) {
          videoStream.getTracks().forEach((track) => track.stop());
          setVideoStream(null);
        }
        // Request video (no audio).
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing small webcam:", error);
      }
    };

    startMedia();

    // Cleanup on unmount.
    return () => {
      videoStream?.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    };
  }, [facingMode]);

  const handleSwitchCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      if (videoDevices.length > 1) {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
      } else {
        console.warn("No secondary camera found");
      }
    } catch (error) {
      console.error("Error switching cameras:", error);
    }
  };

  return (
    <>
      <video ref={videoRef} autoPlay muted className="small-webcam-video" />
      <div className="small-webcam-controls">
        <button onClick={handleSwitchCamera}>Switch Camera</button>
      </div>
    </>
  );
};

export default SmallWebcam;
