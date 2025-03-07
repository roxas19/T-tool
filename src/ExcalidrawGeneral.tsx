// src/Excalidraw/ExcalidrawGeneral.tsx
import React, { useState } from "react";
import ExcalidrawCanvas from "./Excalidraw/ExcalidrawCanvas";
import ExcalidrawToolbar from "./Excalidraw/ExcalidrawToolbar";
import "./css/Excalidraw.css";

// Import specialized hooks:
import { useOverlayManager } from "./context/OverlayManagerContext";
import { usePdfContext } from "./context/PdfContext";
import { useWebcamContext } from "./context/WebcamContext";
import { useMeetingContext } from "./context/MeetingContext"; // NEW

const ExcalidrawGeneral: React.FC = () => {
  
  const { overlayState } = useOverlayManager();
  const displayMode = overlayState.displayMode; // "regular" or "draw"
  const overlayZIndices = overlayState.overlayZIndices;

  // Get PDF viewer state from PdfContext.
  const { pdfState } = usePdfContext();
  const pdfViewerMode = pdfState.isViewerActive;

  // Get stream mode from WebcamContext.
  const { webcamState } = useWebcamContext();
  const isStreamMode = webcamState.isStreamMode;

  // Get meeting state from MeetingContext.
  const { meetingState } = useMeetingContext();

  // Local state for the built-in "island" (editor panel)
  const [isIslandVisible, setIsIslandVisible] = useState<boolean>(true);
  // Local state for the currently selected tool.
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Compute whether to hide Excalidraw:
  // Hide if PDF viewer, stream mode, or meeting is active and we are not in "draw" mode.
  const shouldHideExcalidraw = ((pdfViewerMode || isStreamMode || meetingState.isActive) && displayMode !== "draw");

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  const toggleIslandVisibility = () => {
    setIsIslandVisible((prev) => !prev);
  };

  // Build the container class based on the current state.
  const containerClass = `excalidraw-general ${
    shouldHideExcalidraw ? "excalidraw-hidden" : ""
  } ${!isIslandVisible ? "hide-island" : ""} ${
    displayMode === "draw" ? "excalidraw-draw-active" : ""
  }`;

  // Apply the overlay z-index when in draw mode.
  const containerStyle: React.CSSProperties = {
    height: "100%",
    ...(displayMode === "draw" && { zIndex: overlayZIndices.overlay }),
  };

  return (
    <div className={containerClass} style={containerStyle}>
      {/* Toggle button for the built-in island editor */}
      <button className="excalidraw-toggle-btn" onClick={toggleIslandVisibility}>
        {isIslandVisible ? "Hide Island" : "Show Island"}
      </button>
      <ExcalidrawCanvas />
      <ExcalidrawToolbar
        className={`custom-toolbar ${displayMode === "draw" ? "stream-toolbar" : ""}`}
        onToolSelect={handleToolSelect}
      />
    </div>
  );
};

export default ExcalidrawGeneral;
