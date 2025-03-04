import React, { useState } from "react";
import { useGlobalUI } from "./context/GlobalUIContext";
import ExcalidrawCanvas from "./Excalidraw/ExcalidrawCanvas";
import ExcalidrawToolbar from "./Excalidraw/ExcalidrawToolbar";
import "./css/Excalidraw.css";

const ExcalidrawGeneral: React.FC = () => {
  const { state } = useGlobalUI();
  const displayMode = state.displayMode; // "regular" or "draw"
  const pdfViewerMode = state.pdf.isViewerActive; // from our new grouped pdf state
  const isStreamMode = state.webcam.isStreamMode; // from our new grouped webcam state
  const overlayZIndices = state.overlayZIndices;

  // Local state for the built-in "island" (editor panel)
  const [isIslandVisible, setIsIslandVisible] = useState<boolean>(true);
  // Local state for the currently selected tool
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Hide Excalidraw if PDF viewer is active or if stream mode is active—unless we're in "draw" mode.
  const shouldHideExcalidraw = ((pdfViewerMode || isStreamMode) && displayMode !== "draw");

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  const toggleIslandVisibility = () => {
    setIsIslandVisible((prev) => !prev);
  };

  // Build the container class based on current state.
  const containerClass = `excalidraw-general ${
    shouldHideExcalidraw ? "excalidraw-hidden" : ""
  } ${!isIslandVisible ? "hide-island" : ""} ${
    displayMode === "draw" ? "excalidraw-draw-active" : ""
  }`;

  // When in draw mode, apply the overlay z-index.
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
