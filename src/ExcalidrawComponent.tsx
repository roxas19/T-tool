// ExcalidrawComponent.tsx

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

  // Excalidraw initial data
  const initialData = {
    appState: {
      viewBackgroundColor: isStreamMode ? "transparent" : "#ffffff",
      gridSize: null,
    },
  };

  return (
    <div
      className="excalidraw-component"
      style={{ height: "100%", position: "relative" }}
    >
      {/* Custom Toolbar */}
      <div className={`custom-toolbar-wrapper ${isStreamMode ? "stream-toolbar" : ""}`}>
        <CustomToolbar
          excalidrawAPI={excalidrawAPI} // ✅ Pass actual excalidrawAPI state, NOT the setter function
          onToolSelect={(tool) => setSelectedTool(tool)}
        />
      </div>

      {/* Excalidraw Canvas */}
      <Excalidraw
        excalidrawAPI={handleExcalidrawAPI} // ✅ This now properly updates excalidrawAPI state
        initialData={initialData}
      />
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
    excalidrawAPI?.setActiveTool({ type: tool }); // ✅ Fix: `setActiveTool` should be used to select tools
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
