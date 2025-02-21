// ExcalidrawCanvas.tsx
import React, { useState, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useGlobalUI } from "../context/GlobalUIContext";

// --- Types ---
export type CustomExcalidrawAPI = {
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

export type DisplayMode = "regular" | "draw";

const ExcalidrawCanvas: React.FC = () => {
  // Get the displayMode and setExcalidrawAPI from the global UI context.
  const { displayMode, setExcalidrawAPI } = useGlobalUI();

  const [excalidrawAPI, setLocalExcalidrawAPI] = useState<CustomExcalidrawAPI | null>(null);

  // Callback to capture and forward the Excalidraw API to the global context.
  const handleExcalidrawAPI = (api: any) => {
    const typedAPI = api as unknown as CustomExcalidrawAPI;
    setLocalExcalidrawAPI(typedAPI);
    setExcalidrawAPI(typedAPI);
  };

  // Update the canvas background when displayMode changes.
  useEffect(() => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({
        appState: {
          viewBackgroundColor: displayMode === "draw" ? "transparent" : "#ffffff",
        },
      });
    }
  }, [displayMode, excalidrawAPI]);

  // Helper functions to compute wrapper class and style based on displayMode.
  const getWrapperClass = (mode: DisplayMode) => (mode === "draw" ? "excalidraw-draw-mode" : "");
  const getWrapperStyle = (mode: DisplayMode): React.CSSProperties =>
    mode === "draw"
      ? {
          backgroundColor: "transparent",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }
      : { width: "100%", height: "100%" };

  const wrapperClass = getWrapperClass(displayMode);
  const wrapperStyle = getWrapperStyle(displayMode);

  // Initial data for the Excalidraw canvas.
  const initialData = {
    appState: {
      viewBackgroundColor: displayMode === "draw" ? "transparent" : "#ffffff",
      gridSize: null,
    },
  };

  return (
    <>
      {/* Inline CSS for canvas-specific styling */}
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
      `}</style>

      <div className="excalidraw-canvas" style={{ height: "100%", position: "relative" }}>
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

export default ExcalidrawCanvas;
