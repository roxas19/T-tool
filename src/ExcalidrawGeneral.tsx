import React, { useState } from "react";
import { useGlobalUI } from "./context/GlobalUIContext";
import ExcalidrawCanvas from "./Excalidraw/ExcalidrawCanvas";
import ExcalidrawToolbar from "./Excalidraw/ExcalidrawToolbar";
import "./css/Excalidraw.css";

const ExcalidrawGeneral: React.FC = () => {
  const { displayMode, isStreamMode, pdfViewerMode, overlayZIndices } = useGlobalUI();

  // Local state for the built-in "island" (editor panel)
  const [isIslandVisible, setIsIslandVisible] = useState<boolean>(true);
  // No need to track the selected tool here beyond local usage.
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Compute visibility: hide Excalidraw when in PDF or stream mode (unless in draw mode)
  const shouldHideExcalidraw = ((pdfViewerMode || isStreamMode) && displayMode !== "draw");

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  const toggleIslandVisibility = () => {
    setIsIslandVisible((prev) => !prev);
  };

  // Compose the container class based on current state
  const containerClass = `excalidraw-general ${
    shouldHideExcalidraw ? "excalidraw-hidden" : ""
  } ${!isIslandVisible ? "hide-island" : ""} ${
    displayMode === "draw" ? "excalidraw-draw-active" : ""
  }`;

  // If in draw mode, apply the overlay z-index from the context
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
