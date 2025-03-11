// src/RealView.tsx
import React, { useEffect, useRef, useState } from "react";
import { useRealViewContext } from "./context/RealViewContext";
import { useOverlayManager } from "./context/OverlayManagerContext";
import "./css/RealView.css"; // Ensure your CSS file is updated accordingly.
import InteractiveButton from "./utils/InteractiveButton";

export type DisplayMode = "regular" | "draw";

type RealViewProps = {
  onClose: () => void; // Callback to close the RealView overlay
};

const RealView: React.FC<RealViewProps> = ({ onClose }) => {
  // Get RealView state and dispatch from our context.
  const { realViewState, realViewDispatch } = useRealViewContext();
  // Get overlay state and dispatch.
  const { overlayState, overlayDispatch } = useOverlayManager();

  const displayMode = overlayState.displayMode;
  const overlayZIndices = overlayState.overlayZIndices;
  const isStreamMode = realViewState.isStreamMode;
  const realViewOn = realViewState.on;

  // Local state: false = use webcam; true = use screen share.
  const [isScreenShare, setIsScreenShare] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Effect to initialize/stop media stream based on realView state and source type.
  useEffect(() => {
    const startMedia = async () => {
      try {
        // Stop any existing stream.
        if (videoStream) {
          videoStream.getTracks().forEach((track) => track.stop());
          setVideoStream(null);
        }
        if (realViewOn) {
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
  }, [realViewOn, isScreenShare, facingMode]);

  // Function to switch camera (only for webcam, not for screen share).
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

  // Render RealView only if RealView is on and in stream mode.
  if (!realViewOn || !isStreamMode) return null;

  // For full-screen mode, apply the background z-index.
  const containerStyle: React.CSSProperties = isStreamMode
    ? { zIndex: overlayZIndices.background }
    : {};

  return (
    <>
      <div
        className={`realview-container ${isStreamMode ? "fullscreen" : ""} ${
          displayMode === "draw" ? "draw-mode" : "regular-mode"
        }`}
        style={containerStyle}
      >
        <video ref={videoRef} autoPlay muted className="realview-video" />
      </div>

      {isStreamMode && (
        <div className="realview-controls" style={{ zIndex: overlayZIndices.controls }}>
          <InteractiveButton
            onClick={() => {
              // Exit full-screen RealView: disable stream mode, then trigger onClose.
              realViewDispatch({ type: "SET_REALVIEW_STREAM_MODE", payload: false });
              onClose();
            }}
          >
            Exit RealView
          </InteractiveButton>
          {!isScreenShare && (
            <InteractiveButton onClick={handleSwitchCamera}>
              Switch Camera
            </InteractiveButton>
          )}
          <InteractiveButton
            onClick={() => {
              // Toggle display mode between draw and regular.
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
              // Toggle between webcam and screen share.
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

export default RealView;
