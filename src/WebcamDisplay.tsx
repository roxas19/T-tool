import React, { useEffect, useRef, useState } from "react";
import "./WebcamDisplay.css";

type WebcamDisplayProps = {
  onClose: () => void; // Callback to close the webcam view
  fullscreen?: boolean; // Determines if the webcam is in fullscreen mode
  webcamOn: boolean; // Determines if the webcam feed should be active
  isWebcamOverlayVisible: boolean; // Controls overlay visibility
  setWebcamOverlayVisible: (visible: boolean) => void; // Toggles overlay visibility
  onToggleDrawingMode: (active: boolean) => void; // Toggles drawing mode
  isDrawingMode: boolean; // Indicates if drawing mode is active
};

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({
  onClose,
  fullscreen = false,
  webcamOn,
  isWebcamOverlayVisible,
  setWebcamOverlayVisible,
  onToggleDrawingMode,
  isDrawingMode,
}) => {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize or stop the webcam feed based on `webcamOn`
  useEffect(() => {
    const startWebcam = async () => {
      try {
        if (videoStream) {
          videoStream.getTracks().forEach((track) => track.stop());
          setVideoStream(null);
        }

        if (webcamOn) {
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
      videoStream?.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    };
  }, [webcamOn, facingMode]);

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

  if (!webcamOn || (!fullscreen && !isWebcamOverlayVisible)) return null;

  return (
    <>
      <div
        className={`webcam-container ${fullscreen ? "fullscreen" : ""} ${
          isDrawingMode ? "draw-mode" : "stream-mode"
        }`}
      >
        {/* Webcam Video */}
        <video ref={videoRef} autoPlay muted className="webcam-video" />

        {/* Excalidraw Overlay */}
        {isDrawingMode && (
          <div className="excalidraw-overlay">
            <button onClick={() => onToggleDrawingMode(false)}>Exit Drawing</button>
          </div>
        )}
      </div>

      {/* Webcam Controls */}
      <div className="webcam-controls" style={{ zIndex: 1010 }}>
        <button
          onClick={() => {
            onClose();
            if (!fullscreen) {
              setWebcamOverlayVisible(false);
            }
          }}
        >
          {fullscreen ? "Exit Stream" : "Close"}
        </button>
        <button onClick={handleSwitchCamera}>Switch Camera</button>
        <button onClick={() => onToggleDrawingMode(!isDrawingMode)}>
          {isDrawingMode ? "Exit Draw" : "Draw"}
        </button>
      </div>
    </>
  );
};

export default WebcamDisplay;
