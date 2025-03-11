import React, { useState } from "react";
import { useExcalidrawContext } from "../context/ExcalidrawContext";
import AIDiagrammingPanel from "./AIDiagrammingPanel";

// Import SVG icons from the icons folder
import SelectionIcon from "../icons/selection-tool.svg";
import FreeDrawIcon from "../icons/freedraw-tool.svg";
import EraserIcon from "../icons/eraser-tool.svg";
import TextIcon from "../icons/text-tool.svg";
import LaserPointerIcon from "../icons/laserpointer-tool.svg";
import ShapesIcon from "../icons/shapes-tool.svg";
import ResetIcon from "../icons/reset-tool.svg";
import UploadImageIcon from "../icons/uploadimage-tool.svg";
import AIOpsIcon from "../icons/aiops.svg";

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

  // Handle a tool button click
  const activateTool = (tool: string) => {
    if (excalidrawAPI) {
      excalidrawAPI.setActiveTool({ type: tool });
    }
    onToolSelect(tool);
  };

  const toggleShapesPanel = () => {
    setShapesPanelOpen((prev) => !prev);
  };

  // Reset the Excalidraw canvas
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

  // Activate the image upload tool
  const handleImageUpload = () => {
    if (excalidrawAPI) {
      excalidrawAPI.setActiveTool({
        type: "image",
        insertOnCanvasDirectly: true,
      });
    }
    console.log("Image tool activated for upload.");
  };

  return (
    <div className={`${className} ${mode === "ai" ? "ai-mode" : ""}`}>
      {mode === "ai" ? (
        <AIDiagrammingPanel
          onDragStart={(elements) => {
            console.log("AI Diagram dragged:", elements);
          }}
          onSwitchToToolbar={() => setMode("normal")}
        />
      ) : (
        <>
          <button onClick={() => activateTool("selection")}>
            <img src={SelectionIcon} alt="Selection" />
          </button>

          <button onClick={() => activateTool("freedraw")}>
            <img src={FreeDrawIcon} alt="Pen" />
          </button>

          <button onClick={() => activateTool("eraser")}>
            <img src={EraserIcon} alt="Eraser" />
          </button>

          <button onClick={() => activateTool("text")}>
            <img src={TextIcon} alt="Text" />
          </button>

          <button onClick={() => activateTool("laser")}>
            <img src={LaserPointerIcon} alt="Laser Pointer" />
          </button>

          <button onClick={toggleShapesPanel}>
            <img src={ShapesIcon} alt="Shapes" />
          </button>

          {/* Reset Button */}
          <button onClick={handleResetCanvas}>
            <img src={ResetIcon} alt="Reset" />
          </button>

          {/* Upload Image Button */}
          <button onClick={handleImageUpload}>
            <img src={UploadImageIcon} alt="Upload Image" />
          </button>

          {/* AI Operations Button */}
          <button onClick={() => setMode("ai")}>
            <img src={AIOpsIcon} alt="AI Ops" />
          </button>

          {shapesPanelOpen && (
            <div className="shapes-panel">
              <button onClick={() => activateTool("rectangle")}>Rectangle</button>
              <button onClick={() => activateTool("ellipse")}>Ellipse</button>
              <button onClick={() => activateTool("diamond")}>Diamond</button>
              <button onClick={() => activateTool("arrow")}>Arrow</button>
              <button onClick={() => activateTool("line")}>Line</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExcalidrawToolbar;
