// RealView.tsx
import React, { useEffect, useRef, useState } from "react";
import { useRealViewContext } from "./context/RealViewContext";
import { useOverlayManager } from "./context/OverlayManagerContext";
import DrawIcon from "./icons/draw.svg";
import ControlPanel from "./utils/ControlPanel"; // Imported our new ControlPanel component
import "./css/RealView.css";

export type DisplayMode = "regular" | "draw";

type RealViewProps = {
  onClose: () => void;
};

const RealView: React.FC<RealViewProps> = ({ onClose }) => {
  const { realViewState, realViewDispatch } = useRealViewContext();
  const { overlayState, overlayDispatch } = useOverlayManager();
  const displayMode = overlayState.displayMode;
  const overlayZIndices = overlayState.overlayZIndices;
  const isStreamMode = realViewState.isStreamMode;
  const realViewOn = realViewState.on;

  const [isScreenShare, setIsScreenShare] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startMedia = async () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
      }
      if (realViewOn) {
        try {
          const stream = isScreenShare
            ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
            : await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true });
          setVideoStream(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (error) {
          console.error("Error accessing media:", error);
        }
      }
    };

    startMedia();
    return () => videoStream?.getTracks().forEach((track) => track.stop());
  }, [realViewOn, isScreenShare, facingMode]);

  const handleSwitchCamera = async () => {
    if (!isScreenShare) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === "videoinput");
      if (cams.length > 1)
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
      else console.warn("No secondary camera found");
    }
  };

  if (!realViewOn || !isStreamMode) return null;

  return (
    <>
      <div
        className={`realview-container ${isStreamMode ? "fullscreen" : ""} ${displayMode === "draw" ? "draw-mode" : "regular-mode"}`}
        style={{ zIndex: overlayZIndices.background }}
      >
        <video ref={videoRef} autoPlay muted className="realview-video" />
      </div>

      {isStreamMode && (
        <ControlPanel
          containerClassName="realview-controls" // This will use your existing RealView CSS rules
          style={{ zIndex: overlayZIndices.controls }}
          leftContent={
            <>
              {!isScreenShare && (
                <button onClick={handleSwitchCamera} className="control-button">
                  Switch Camera
                </button>
              )}
              <button
                onClick={() =>
                  overlayDispatch({
                    type: "SET_DISPLAY_MODE",
                    payload: displayMode === "draw" ? "regular" : "draw",
                  })
                }
                className={`icon-button draw-btn ${displayMode === "draw" ? "active" : ""}`}
                aria-pressed={displayMode === "draw"}
              >
                <img src={DrawIcon} alt={displayMode === "draw" ? "Exit Draw" : "Draw"} />
              </button>
              <button onClick={() => setIsScreenShare((prev) => !prev)} className="control-button">
                {isScreenShare ? "Use Webcam" : "Screen Share"}
              </button>
            </>
          }
        />
      )}
    </>
  );
};

export default RealView;
