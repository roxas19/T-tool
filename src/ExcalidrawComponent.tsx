import React, { useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

// --- Types ---
type ExcalidrawElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  [key: string]: any;
};

type CustomExcalidrawAPI = {
  updateScene: (sceneData: any, opts?: { commitToStore?: boolean }) => void;
  getSceneElements: () => readonly any[];
  getAppState: () => any;
  exportToBlob: () => Promise<Blob>;
  resetScene: () => void;
  undo: () => void;
  redo: () => void;
  setActiveTool: (tool: any) => void;
  onChange: (callback: (elements: any[], appState: any) => void) => () => void;
  onPointerDown: (
    callback: (
      activeTool: any,
      pointerDownState: any,
      event: React.PointerEvent<HTMLElement>
    ) => void
  ) => () => void;
  onPointerUp: (
    callback: (
      activeTool: any,
      pointerDownState: any,
      event: PointerEvent
    ) => void
  ) => () => void;
};

// --- Props for ExcalidrawComponent ---
interface ExcalidrawComponentProps {
  isStreamMode: boolean;
  webcamOn: boolean;
  setIsStreamMode: React.Dispatch<React.SetStateAction<boolean>>;
  setWebcamOn: React.Dispatch<React.SetStateAction<boolean>>;
  toggleWebcam: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  isDrawingMode: boolean;
  setIsDrawingMode: (value: boolean) => void;
  setExcalidrawAPI: React.Dispatch<React.SetStateAction<CustomExcalidrawAPI | null>>;
}

const ExcalidrawComponent: React.FC<ExcalidrawComponentProps> = ({
  isStreamMode,
  webcamOn,
  setIsStreamMode,
  setWebcamOn,
  toggleWebcam,
  isRecording,
  onToggleRecording,
  isDrawingMode,
  setIsDrawingMode,
  setExcalidrawAPI,
}) => {
  const [excalidrawAPI, setLocalExcalidrawAPI] = useState<CustomExcalidrawAPI | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Capture and set Excalidraw API
  const handleExcalidrawAPI = (api: any) => {
    const typedAPI = api as unknown as CustomExcalidrawAPI;
    setLocalExcalidrawAPI(typedAPI);
    setExcalidrawAPI(typedAPI);
  };

  // When in stream mode, toggle between "draw" and "hidden" classes.
  // Outside stream mode, we don’t want any extra class.
  const canvasWrapperClass = isStreamMode
    ? (isDrawingMode ? "excalidraw-draw-mode" : "excalidraw-hidden")
    : "";

  // When in stream mode and drawing mode is active, we want a transparent background.
  // Otherwise use white (via initialData) while the container always gets full width/height in regular mode.
  const initialData = {
    appState: {
      viewBackgroundColor: isStreamMode && isDrawingMode ? "transparent" : "#ffffff",
      gridSize: null,
    },
  };

  // Define styles based on mode:
  const canvasWrapperStyle = isStreamMode
    ? { backgroundColor: "transparent" } // stream mode CSS classes handle size/positioning
    : { width: "100%", height: "100%", backgroundColor: "transparent" };

  return (
    <div className="excalidraw-component" style={{ height: "100%", position: "relative" }}>
      {/* Custom Toolbar - always visible */}
      <div
        className={`custom-toolbar-wrapper ${isStreamMode ? "stream-toolbar" : ""}`}
        style={{ position: "absolute", top: "50px", right: "10px", zIndex: 1004 }}
      >
        <CustomToolbar
          excalidrawAPI={excalidrawAPI}
          onToolSelect={(tool) => setSelectedTool(tool)}
        />
      </div>

      {/* Excalidraw Canvas */}
      <div className={canvasWrapperClass} style={canvasWrapperStyle}>
        <Excalidraw
          key={isStreamMode ? (isDrawingMode ? "draw-mode" : "hidden-mode") : "regular-mode"}
          excalidrawAPI={handleExcalidrawAPI}
          initialData={initialData}
        />
      </div>
    </div>
  );
};

export default ExcalidrawComponent;

/**
 * Custom Toolbar Component
 */
const CustomToolbar: React.FC<{
  excalidrawAPI: CustomExcalidrawAPI | null;
  onToolSelect: (toolType: string) => void;
}> = ({ excalidrawAPI, onToolSelect }) => {
  const activateTool = (tool: string) => {
    excalidrawAPI?.setActiveTool({ type: tool });
    onToolSelect(tool);
  };

  return (
    <div className="custom-toolbar">
      <button onClick={() => activateTool("selection")}>Selection</button>
      <button onClick={() => activateTool("freedraw")}>Pen</button>
      <button onClick={() => activateTool("eraser")}>Eraser</button>
      <button onClick={() => activateTool("rectangle")}>Rectangle</button>
      <button onClick={() => activateTool("ellipse")}>Ellipse</button>
      <button onClick={() => activateTool("diamond")}>Diamond</button>
      <button onClick={() => activateTool("arrow")}>Arrow</button>
      <button onClick={() => activateTool("line")}>Line</button>
      <button onClick={() => activateTool("text")}>Text</button>
      <button onClick={() => activateTool("laser")}>Laser Pointer</button>
    </div>
  );
};
