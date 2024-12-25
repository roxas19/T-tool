import React, { useEffect, useRef, useState } from "react";
import "./WebcamDisplay.css";

type WebcamDisplayProps = {
  onClose: () => void; // Callback to close the webcam view
  fullscreen?: boolean; // Determines if the webcam is in fullscreen mode
};

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({ onClose, fullscreen = false }) => {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize or restart webcam when facing mode changes
  useEffect(() => {
    const startWebcam = async () => {
      try {
        // Stop any existing streams
        videoStream?.getTracks().forEach((track) => track.stop());

        // Start a new stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startWebcam();

    // Cleanup: Stop the stream on unmount
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null); // Reset state
      }
    };
  }, [facingMode]);

  // Switch between front and back cameras
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
    <div className={`webcam-container ${fullscreen ? "fullscreen" : ""}`}>
      {/* Webcam Video */}
      <video ref={videoRef} autoPlay muted className="webcam-video" />

      {/* Webcam Controls */}
      <div className="webcam-controls">
        <button onClick={onClose}>Close</button>
        <button onClick={handleSwitchCamera}>Switch Camera</button>
      </div>
    </div>
  );
};

export default WebcamDisplay;
