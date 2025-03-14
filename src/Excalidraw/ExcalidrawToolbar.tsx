import React, { useState } from "react";
import { useExcalidrawContext } from "../context/ExcalidrawContext";
import AIDiagrammingPanel from "./AIDiagrammingPanel";
import { useOverlayManager } from "../context/OverlayManagerContext";

// Import SVG icons
import SelectionIcon from "../icons/selection-tool.svg";
import FreeDrawIcon from "../icons/freedraw-tool.svg";
import EraserIcon from "../icons/eraser-tool.svg";
import TextIcon from "../icons/text-tool.svg";
import LaserPointerIcon from "../icons/laserpointer-tool.svg";
import ShapesIcon from "../icons/shapes-tool.svg";
import ResetIcon from "../icons/reset-tool.svg";
import UploadImageIcon from "../icons/uploadimage-tool.svg";
import AIOpsIcon from "../icons/aiops.svg";
import "../css/Excalidraw.css";

export type CustomExcalidrawAPI = {
  updateScene: (sceneData: any, opts?: { commitToStore?: boolean }) => void;
  setActiveTool: (tool: { type: string; [key: string]: any }) => void;
};

export interface ExcalidrawToolbarProps {
  className?: string;
  onToolSelect: (toolType: string) => void;
}

const ExcalidrawToolbar: React.FC<ExcalidrawToolbarProps> = ({
  className = "custom-toolbar",
  onToolSelect,
}) => {
  const { excalidrawState } = useExcalidrawContext();
  const excalidrawAPI = excalidrawState.api;
  const [mode, setMode] = useState<"normal" | "ai">("normal");
  const [shapesPanelOpen, setShapesPanelOpen] = useState(false);
  const { overlayState } = useOverlayManager();

  // Local state to track the active tool
  const [activeTool, setActiveTool] = useState<string>("");

  // Activate a specific drawing tool.
  const activateTool = (tool: string) => {
    if (excalidrawAPI) {
      excalidrawAPI.setActiveTool({ type: tool });
    }
    setActiveTool(tool);
    onToolSelect(tool);
  };

  // Toggle the display of the shapes panel.
  const toggleShapesPanel = () => {
    setShapesPanelOpen((prev) => !prev);
  };

  // Reset the canvas to a clean state.
  const handleResetCanvas = () => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({
        elements: [],
        appState: {
          ...excalidrawAPI.getAppState(),
          viewBackgroundColor: "#ffffff",
        },
      });
    }
  };

  // Activate the image upload tool.
  const handleImageUpload = () => {
    if (excalidrawAPI) {
      excalidrawAPI.setActiveTool({
        type: "image",
        insertOnCanvasDirectly: true,
      });
    }
    setActiveTool("image");
    onToolSelect("image");
    console.log("Image tool activated for upload.");
  };

  return (
    <div
      className={`${className} ${mode === "ai" ? "ai-mode" : ""}`}
      style={{ zIndex: overlayState.overlayZIndices.extra }}
    >
      {mode === "ai" ? (
        <AIDiagrammingPanel
          onDragStart={(elements) => {
            console.log("AI Diagram dragged:", elements);
          }}
          onSwitchToToolbar={() => setMode("normal")}
        />
      ) : (
        <>
          <button
            onClick={() => activateTool("selection")}
            aria-label="Selection Tool"
            className={`toolbar-button ${activeTool === "selection" ? "active" : ""}`}
          >
            <img src={SelectionIcon} alt="Selection Icon" />
          </button>

          <button
            onClick={() => activateTool("freedraw")}
            aria-label="Free Draw Tool"
            className={`toolbar-button ${activeTool === "freedraw" ? "active" : ""}`}
          >
            <img src={FreeDrawIcon} alt="Free Draw Icon" />
          </button>

          <button
            onClick={() => activateTool("eraser")}
            aria-label="Eraser Tool"
            className={`toolbar-button ${activeTool === "eraser" ? "active" : ""}`}
          >
            <img src={EraserIcon} alt="Eraser Icon" />
          </button>

          <button
            onClick={() => activateTool("text")}
            aria-label="Text Tool"
            className={`toolbar-button ${activeTool === "text" ? "active" : ""}`}
          >
            <img src={TextIcon} alt="Text Icon" />
          </button>

          <button
            onClick={() => activateTool("laser")}
            aria-label="Laser Pointer Tool"
            className={`toolbar-button ${activeTool === "laser" ? "active" : ""}`}
          >
            <img src={LaserPointerIcon} alt="Laser Pointer Icon" />
          </button>

          <button
            onClick={toggleShapesPanel}
            aria-label="Shapes Tool"
            className={`toolbar-button ${activeTool === "shapes" ? "active" : ""}`}
          >
            <img src={ShapesIcon} alt="Shapes Icon" />
          </button>

          <button
            onClick={handleResetCanvas}
            aria-label="Reset Canvas"
            className="toolbar-button"
          >
            <img src={ResetIcon} alt="Reset Icon" />
          </button>

          <button
            onClick={handleImageUpload}
            aria-label="Upload Image"
            className={`toolbar-button ${activeTool === "image" ? "active" : ""}`}
          >
            <img src={UploadImageIcon} alt="Upload Image Icon" />
          </button>

          <button
            onClick={() => setMode("ai")}
            aria-label="Switch to AI Diagramming"
            className="toolbar-button"
          >
            <img src={AIOpsIcon} alt="AI Ops Icon" />
          </button>

          {shapesPanelOpen && (
            <div className="shapes-panel">
              <button
                onClick={() => activateTool("rectangle")}
                className={`shapes-panel-button ${activeTool === "rectangle" ? "active" : ""}`}
              >
                Rectangle
              </button>
              <button
                onClick={() => activateTool("ellipse")}
                className={`shapes-panel-button ${activeTool === "ellipse" ? "active" : ""}`}
              >
                Ellipse
              </button>
              <button
                onClick={() => activateTool("diamond")}
                className={`shapes-panel-button ${activeTool === "diamond" ? "active" : ""}`}
              >
                Diamond
              </button>
              <button
                onClick={() => activateTool("arrow")}
                className={`shapes-panel-button ${activeTool === "arrow" ? "active" : ""}`}
              >
                Arrow
              </button>
              <button
                onClick={() => activateTool("line")}
                className={`shapes-panel-button ${activeTool === "line" ? "active" : ""}`}
              >
                Line
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExcalidrawToolbar;
