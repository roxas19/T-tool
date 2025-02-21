import React, { useState, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useGlobalUI } from "./context/GlobalUIContext"; // Adjust the import path as needed

// --- Types ---
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

// Define a unified display mode type.
export type DisplayMode = "regular" | "draw";

// --- Props for ExcalidrawComponent ---
interface ExcalidrawComponentProps {
  setExcalidrawAPI: React.Dispatch<React.SetStateAction<CustomExcalidrawAPI | null>>;
  // Note: displayMode is no longer received via props.
}

const ExcalidrawComponent: React.FC<ExcalidrawComponentProps> = ({ setExcalidrawAPI }) => {
  // Access the global displayMode directly from the GlobalUIContext.
  const { displayMode } = useGlobalUI();

  const [excalidrawAPI, setLocalExcalidrawAPI] = useState<CustomExcalidrawAPI | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Capture and set the Excalidraw API.
  const handleExcalidrawAPI = (api: any) => {
    const typedAPI = api as unknown as CustomExcalidrawAPI;
    setLocalExcalidrawAPI(typedAPI);
    setExcalidrawAPI(typedAPI);
  };

  // When displayMode changes, update the scene without forcing a remount.
  useEffect(() => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({
        appState: {
          viewBackgroundColor: displayMode === "draw" ? "transparent" : "#ffffff",
        },
      });
    }
  }, [displayMode, excalidrawAPI]);

  // Helper to compute wrapper class based on displayMode.
  const getWrapperClass = (mode: DisplayMode) => (mode === "draw" ? "excalidraw-draw-mode" : "");

  // Helper to compute wrapper style based on displayMode.
  const getWrapperStyle = (mode: DisplayMode): React.CSSProperties =>
    mode === "draw"
      ? ({
          backgroundColor: "transparent",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        } as React.CSSProperties)
      : ({ width: "100%", height: "100%" } as React.CSSProperties);

  const wrapperClass = getWrapperClass(displayMode);
  const wrapperStyle = getWrapperStyle(displayMode);

  // Compute initial data based on displayMode (used only on initial mount).
  const initialData = {
    appState: {
      viewBackgroundColor: displayMode === "draw" ? "transparent" : "#ffffff",
      gridSize: null,
    },
  };

  return (
    <>
      {/* Inline CSS for this component */}
      <style>{`
        .excalidraw-draw-mode {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1002; /* Above webcam container but below toolbars */
          background-color: transparent;
          pointer-events: auto;
          transition: opacity 0.2s ease-in-out;
        }
        .custom-toolbar {
          position: fixed;
          right: 10px;
          top: 50px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #f8f9fa;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          pointer-events: auto;
        }
        .custom-toolbar.stream-toolbar {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          z-index: 1003; /* Ensure toolbar appears above the Excalidraw overlay */
        }
        .custom-toolbar button {
          padding: 8px;
          border: 1px solid #ccc;
          background-color: #ffffff;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          text-align: center;
          width: 80px;
        }
        .custom-toolbar button:hover {
          background-color: #e0e0e0;
        }
      `}</style>

      <div className="excalidraw-component" style={{ height: "100%", position: "relative" }}>
        {/* Render the custom toolbar, adding "stream-toolbar" when in draw mode */}
        <CustomToolbar
          className={`custom-toolbar ${displayMode === "draw" ? "stream-toolbar" : ""}`}
          excalidrawAPI={excalidrawAPI}
          onToolSelect={(tool) => setSelectedTool(tool)}
        />

        {/* Excalidraw Canvas */}
        <div className={wrapperClass} style={wrapperStyle}>
          <Excalidraw
            excalidrawAPI={handleExcalidrawAPI}
            initialData={initialData}
          />
        </div>
      </div>
    </>
  );
};

export default ExcalidrawComponent;

/**
 * Custom Toolbar Component
 */
interface CustomToolbarProps {
  className?: string;
  excalidrawAPI: CustomExcalidrawAPI | null;
  onToolSelect: (toolType: string) => void;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({ className, excalidrawAPI, onToolSelect }) => {
  const activateTool = (tool: string) => {
    excalidrawAPI?.setActiveTool({ type: tool });
    onToolSelect(tool);
  };

  return (
    <div className={className}>
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
