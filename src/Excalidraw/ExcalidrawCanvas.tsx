// ExcalidrawCanvas.tsx
import React, { useState, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useGlobalUI } from "../context/GlobalUIContext";
import "../css/Excalidraw.css"; // Import our custom CSS overrides

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
  onChange: (
    callback: (elements: readonly any[], appState: any, files: any) => void
  ) => () => void;
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

// Define the props for ExcalidrawCanvas.
interface ExcalidrawCanvasProps {
  onSelectedElementChange?: (selectedElement: any) => void;
}

const ExcalidrawCanvas: React.FC<ExcalidrawCanvasProps> = ({
  onSelectedElementChange,
}) => {
  const { displayMode, setExcalidrawAPI } = useGlobalUI();
  const [excalidrawAPI, setLocalExcalidrawAPI] = useState<CustomExcalidrawAPI | null>(null);

  // Capture and forward the Excalidraw API to global context.
  const handleExcalidrawAPI = (api: any) => {
    const typedAPI = api as CustomExcalidrawAPI;
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

  // onChange callback: capture the selected element and notify parent.
  const handleChange = (
    elements: readonly any[],
    appState: any,
    files: any
  ) => {
    let selEl = null;
    if (appState.selectedElementIds && Object.keys(appState.selectedElementIds).length > 0) {
      // Get the first selected element ID.
      const selectedId = Object.keys(appState.selectedElementIds)[0];
      // Find the element in the current scene.
      selEl = elements.find((el) => el.id === selectedId) || null;
    }
    if (onSelectedElementChange) {
      onSelectedElementChange(selEl);
    }
  };

  const wrapperClass = displayMode === "draw" ? "excalidraw-draw-mode" : "";
  const wrapperStyle: React.CSSProperties =
    displayMode === "draw"
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        }
      : {
          width: "100%",
          height: "100%",
        };

  const initialData = {
    appState: {
      viewBackgroundColor: displayMode === "draw" ? "transparent" : "#ffffff",
      gridSize: null,
    },
  };

  return (
    <div className="excalidraw-canvas" style={{ height: "100%", position: "relative" }}>
      <div className={wrapperClass} style={wrapperStyle}>
        <Excalidraw
          excalidrawAPI={handleExcalidrawAPI}
          initialData={initialData}
          onChange={handleChange}
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: false,
              clearCanvas: false,
              export: false,
              loadScene: false,
              saveToActiveFile: false,
              toggleTheme: false,
              saveAsImage: false,
            },
            welcomeScreen: false,
          }}
          renderTopRightUI={() => null}
        />
      </div>
    </div>
  );
};

export default ExcalidrawCanvas;
