import React, { useEffect, useRef, useState } from "react";
import "./WebcamDisplay.css";

type WebcamDisplayProps = {
  onClose: () => void; // Callback to close the webcam view
  fullscreen?: boolean; // Determines if the webcam is in fullscreen mode
  webcamOn: boolean; // Determines if the webcam feed should be active
  isWebcamOverlayVisible: boolean; // Controls overlay visibility
  setWebcamOverlayVisible: (visible: boolean) => void; // Toggles overlay visibility
};

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({
  onClose,
  fullscreen = false,
  webcamOn,
  isWebcamOverlayVisible,
  setWebcamOverlayVisible,
}) => {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize or stop the webcam feed based on `webcamOn`
  useEffect(() => {
    const startWebcam = async () => {
      try {
        if (videoStream) {
          // Stop any existing streams
          videoStream.getTracks().forEach((track) => track.stop());
          setVideoStream(null);
        }

        if (webcamOn) {
          // Start a new stream
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
          });
          setVideoStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startWebcam();

    return () => {
      // Cleanup: Stop the video stream when the component unmounts or `webcamOn` changes
      videoStream?.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    };
  }, [webcamOn, facingMode]);

  // Handle switching between front and back cameras
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

  // Hide the component when the webcam is off or not visible
  if (!webcamOn || (!fullscreen && !isWebcamOverlayVisible)) return null;

  return (
    <div
      className={`webcam-container ${fullscreen ? "fullscreen" : ""}`}
      style={{
        position: fullscreen ? "fixed" : "absolute",
        top: fullscreen ? "0" : "10px",
        right: fullscreen ? "0" : "10px",
        zIndex: fullscreen ? 1000 : 10,
        width: fullscreen ? "100vw" : "200px",
        height: fullscreen ? "100vh" : "150px",
        backgroundColor: fullscreen ? "black" : "transparent",
      }}
    >
      {/* Webcam Video */}
      <video ref={videoRef} autoPlay muted className="webcam-video" />

      {/* Webcam Controls */}
      <div className="webcam-controls">
        <button
          onClick={() => {
            onClose();
            if (!fullscreen) {
              setWebcamOverlayVisible(false); // Hide overlay only if not in fullscreen
            }
          }}
        >
          {fullscreen ? "Exit Stream" : "Close"}
        </button>
        <button onClick={handleSwitchCamera}>Switch Camera</button>
      </div>
    </div>
  );
};

export default WebcamDisplay;
