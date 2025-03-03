import React, { useState, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useGlobalUI } from "../context/GlobalUIContext";
import "../css/Excalidraw.css";

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

interface ExcalidrawCanvasProps {}

const ExcalidrawCanvas: React.FC<ExcalidrawCanvasProps> = () => {
  const { displayMode, setExcalidrawAPI, overlayZIndices } = useGlobalUI();
  const [excalidrawAPI, setLocalExcalidrawAPI] = useState<CustomExcalidrawAPI | null>(null);

  // Capture and forward the Excalidraw API to global state.
  const handleExcalidrawAPI = (api: any) => {
    const typedAPI = api as CustomExcalidrawAPI;
    setLocalExcalidrawAPI(typedAPI);
    setExcalidrawAPI(typedAPI);
  };

  // Update the canvas background color based on the display mode.
  useEffect(() => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({
        appState: {
          viewBackgroundColor: displayMode === "draw" ? "transparent" : "#ffffff",
        },
      });
    }
  }, [displayMode, excalidrawAPI]);

  // Compute the wrapper style.
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
          zIndex: overlayZIndices.overlay,
        }
      : {
          width: "100%",
          height: "100%",
        };

  // Initial Excalidraw configuration
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
