import React, { useState } from "react";
import { useGlobalUI } from "./context/GlobalUIContext";
import ExcalidrawCanvas from "./Excalidraw/ExcalidrawCanvas";
import ExcalidrawToolbar from "./Excalidraw/ExcalidrawToolbar";
import "./css/Excalidraw.css";

const ExcalidrawGeneral: React.FC = () => {
  const { displayMode, isStreamMode, pdfViewerMode } = useGlobalUI();

  // We no longer need to track selected element or custom editor state.
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  // State to control whether the built-in "island" (editor panel) is visible.
  const [isIslandVisible, setIsIslandVisible] = useState<boolean>(true);

  // Only hide Excalidraw if we're in PDF viewer mode or stream mode AND not in draw mode.
  const shouldHideExcalidraw = ((pdfViewerMode || isStreamMode) && displayMode !== "draw");

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  // Toggle the visibility of the built-in island editor.
  const toggleIslandVisibility = () => {
    setIsIslandVisible((prev) => !prev);
  };

  // When in draw mode, add a class to "hoist" the container
  const containerClass = `excalidraw-general ${shouldHideExcalidraw ? "excalidraw-hidden" : ""} ${!isIslandVisible ? "hide-island" : ""} ${displayMode === "draw" ? "excalidraw-draw-active" : ""}`;

  return (
    <div className={containerClass} style={{ height: "100%" }}>
      {/* Toggle button for the built-in island editor */}
      <button
        onClick={toggleIslandVisibility}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1200,
          padding: "5px 10px",
          fontSize: "14px",
        }}
      >
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
