// src/WebcamDisplay.tsx
import React, { useEffect, useRef, useState } from "react";
import { useWebcamContext } from "./context/WebcamContext";
import { useOverlayManager } from "./context/OverlayManagerContext";
import "./css/WebcamDisplay.css";
import InteractiveButton from "./utils/InteractiveButton";

export type DisplayMode = "regular" | "draw";

type WebcamDisplayProps = {
  onClose: () => void; // Callback to close the webcam view
};

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({ onClose }) => {
  // Use specialized context for webcam state.
  const { webcamState, webcamDispatch } = useWebcamContext();
  // Use Overlay Manager context for display mode and overlay z-indices.
  const { overlayState, overlayDispatch } = useOverlayManager();

  const displayMode = overlayState.displayMode;
  const overlayZIndices = overlayState.overlayZIndices; // "regular" or "draw"
  const isStreamMode = webcamState.isStreamMode;
  const isWebcamOverlayVisible = webcamState.isOverlayVisible;
  const webcamOn = webcamState.on;
  

  // Local state for the media source: false means webcam, true means screen share.
  const [isScreenShare, setIsScreenShare] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Effect to initialize or stop the media stream based on webcamOn and source type.
  useEffect(() => {
    const startMedia = async () => {
      try {
        // Stop existing stream, if any.
        if (videoStream) {
          videoStream.getTracks().forEach((track) => track.stop());
          setVideoStream(null);
        }
        if (webcamOn) {
          let stream: MediaStream;
          if (isScreenShare) {
            // Use screen sharing API.
            stream = await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: false,
            });
          } else {
            // Use webcam API.
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode },
              audio: true,
            });
          }
          setVideoStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (error) {
        console.error("Error accessing media:", error);
      }
    };

    startMedia();

    return () => {
      videoStream?.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    };
  }, [webcamOn, isScreenShare, facingMode]);

  // Function to switch camera facing mode (only for webcam, not screen share).
  const handleSwitchCamera = async () => {
    if (isScreenShare) return; // Do nothing if in screen share mode.
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

  // Render only if the webcam is on and either in stream mode or overlay mode.
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
        <video ref={videoRef} autoPlay muted className="webcam-video" />
      </div>

      {isStreamMode && (
        <div className="webcam-controls" style={{ zIndex: overlayZIndices.controls }}>
          <InteractiveButton
            onClick={() => {
              // Exit full-screen stream view: set overlay visible and disable stream mode.
              webcamDispatch({ type: "SET_WEBCAM_OVERLAY_VISIBLE", payload: true });
              webcamDispatch({ type: "SET_WEBCAM_STREAM_MODE", payload: false });
              onClose();
            }}
          >
            Exit Stream
          </InteractiveButton>
          {!isScreenShare && (
            <InteractiveButton onClick={handleSwitchCamera}>
              Switch Camera
            </InteractiveButton>
          )}
          <InteractiveButton
            onClick={() => {
              // Toggle display mode (draw vs regular).
              overlayDispatch({
                type: "SET_DISPLAY_MODE",
                payload: displayMode === "draw" ? "regular" : "draw",
              });
            }}
          >
            {displayMode === "draw" ? "Exit Draw" : "Draw"}
          </InteractiveButton>
          <InteractiveButton
            onClick={() => {
              // Toggle the media source between webcam and screen share.
              setIsScreenShare((prev) => !prev);
            }}
          >
            {isScreenShare ? "Use Webcam" : "Screen Share"}
          </InteractiveButton>
        </div>
      )}
    </>
  );
};

export default WebcamDisplay;
