// src/Excalidraw/ExcalidrawCanvas.tsx
import React, { useState, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useExcalidrawContext } from "../context/ExcalidrawContext";
import { useOverlayManager } from "../context/OverlayManagerContext";
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
  // Retrieve the Excalidraw API from its specialized context.
  const { excalidrawState, excalidrawDispatch } = useExcalidrawContext();
  // Retrieve display mode and overlay z-index values from the overlay manager context.
  const { overlayState } = useOverlayManager();
  const displayMode = overlayState.displayMode; // assumed to be "regular" or "draw"
  const overlayZIndices = overlayState.overlayZIndices; // assumed to be part of the overlay state

  // Local state for the Excalidraw API reference.
  const [localExcalidrawAPI, setLocalExcalidrawAPI] = useState<CustomExcalidrawAPI | null>(null);

  // Capture and forward the Excalidraw API to the Excalidraw context.
  const handleExcalidrawAPI = (api: any) => {
    const typedAPI = api as CustomExcalidrawAPI;
    setLocalExcalidrawAPI(typedAPI);
    excalidrawDispatch({ type: "SET_EXCALIDRAW_API", payload: typedAPI });
  };

  // Update the canvas background color based on display mode.
  useEffect(() => {
    if (localExcalidrawAPI) {
      localExcalidrawAPI.updateScene({
        appState: {
          viewBackgroundColor: displayMode === "draw" ? "transparent" : "#ffffff",
        },
      });
    }
  }, [displayMode, localExcalidrawAPI]);

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
      : { width: "100%", height: "100%" };

  // Initial Excalidraw configuration.
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
