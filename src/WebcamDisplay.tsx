// src/WebcamDisplay.tsx

import React, { useEffect, useRef, useState } from "react";
import { useGlobalUI } from "./context/GlobalUIContext";
import "./css/WebcamDisplay.css";
import InteractiveButton from "./utils/InteractiveButton";

export type DisplayMode = "regular" | "draw";

type WebcamDisplayProps = {
  onClose: () => void; // Callback to close the webcam view
};

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({ onClose }) => {
  // Extract grouped state and dispatch from the global context.
  const { state, dispatch } = useGlobalUI();
  const displayMode = state.displayMode;
  const isStreamMode = state.webcam.isStreamMode;
  const isWebcamOverlayVisible = state.webcam.isOverlayVisible;
  const webcamOn = state.webcam.on;
  const overlayZIndices = state.overlayZIndices;

  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize or stop the webcam feed based on global 'webcamOn'
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

  // Function to switch camera facing mode.
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

  // Render only if the webcam is on and either in stream mode or the overlay is visible.
  if (!webcamOn || (!isStreamMode && !isWebcamOverlayVisible)) return null;

  // For full-screen mode, use the background z-index.
  const containerStyle: React.CSSProperties = isStreamMode
    ? { zIndex: overlayZIndices.background }
    : {};

  return (
    <>
      <div
        className={`webcam-container ${isStreamMode ? "fullscreen" : ""} ${
          displayMode === "draw" ? "draw-mode" : "stream-mode"
        }`}
        style={containerStyle}
      >
        {/* Webcam Video */}
        <video ref={videoRef} autoPlay muted className="webcam-video" />
      </div>

      {/* Webcam Controls: Render only in full-screen stream mode */}
      {isStreamMode && (
        <div
          className="webcam-controls"
          style={{ zIndex: overlayZIndices.controls }}
        >
          <InteractiveButton
            onClick={() => {
              // Exit full-screen stream view:
              dispatch({ type: "SET_WEBCAM_OVERLAY_VISIBLE", payload: true }); // Keep small overlay visible.
              dispatch({ type: "SET_WEBCAM_STREAM_MODE", payload: false });
              onClose();
            }}
          >
            Exit Stream
          </InteractiveButton>
          <InteractiveButton onClick={handleSwitchCamera}>
            Switch Camera
          </InteractiveButton>
          <InteractiveButton
            onClick={() =>
              dispatch({
                type: "SET_DISPLAY_MODE",
                payload: displayMode === "draw" ? "regular" : "draw",
              })
            }
          >
            {displayMode === "draw" ? "Exit Draw" : "Draw"}
          </InteractiveButton>
        </div>
      )}
    </>
  );
};

export default WebcamDisplay;
