// ExcalidrawGeneral.tsx
import React, { useState } from "react";
import { useGlobalUI } from "./context/GlobalUIContext";
import ExcalidrawCanvas from "./Excalidraw/ExcalidrawCanvas";
import ExcalidrawToolbar from "./Excalidraw/ExcalidrawToolbar";
import ExcalidrawElementEditor from "./Excalidraw/ExcalidrawElementEditor";
import "./css/Excalidraw.css";

const ExcalidrawGeneral: React.FC = () => {
  const { displayMode, isStreamMode, pdfViewerMode } = useGlobalUI();

  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<any | null>(null);
  // New state to control whether the built-in "island" (App-menu__left) is visible.
  const [isIslandVisible, setIsIslandVisible] = useState<boolean>(true);

  // Decide if we need to hide the entire Excalidraw UI.
  const shouldHideExcalidraw = pdfViewerMode || (isStreamMode && displayMode !== "draw");

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  // Toggle the visibility of the built-in island UI.
  const toggleIslandVisibility = () => {
    setIsIslandVisible((prev) => !prev);
  };

  return (
    <div
      className={`excalidraw-general ${shouldHideExcalidraw ? "excalidraw-hidden" : ""} ${!isIslandVisible ? "hide-island" : ""}`}
      style={{ height: "100%", position: "relative" }}
    >
      {/* Overlay toggle button in the top-left corner */}
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

      {/* ExcalidrawCanvas passes the selected element via onSelectedElementChange */}
      <ExcalidrawCanvas onSelectedElementChange={setSelectedElement} />

      {/* Custom toolbar for selecting tools */}
      <ExcalidrawToolbar
        className={`custom-toolbar ${displayMode === "draw" ? "stream-toolbar" : ""}`}
        onToolSelect={handleToolSelect}
      />

      {/* Render the custom editor panel only when an element is selected */}
      {selectedElement && (
        <ExcalidrawElementEditor
          selectedElement={selectedElement}
          onClose={() => setSelectedElement(null)}
        />
      )}
    </div>
  );
};

export default ExcalidrawGeneral;
