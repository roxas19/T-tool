// GlobalUIContext.tsx
import React, { createContext, useContext, useState } from "react";

// Optionally, you could import proper types from Excalidraw if available.
// import { ExcalidrawElement, AppState, BinaryFiles } from "@excalidraw/excalidraw";

/**
 * Updated CustomExcalidrawAPI type to match Excalidraw's latest API.
 * We use `any` for simplicity, but you can replace these with proper types if available.
 */
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

/**
 * OverlayZIndices defines the stacking order for various UI layers.
 * The recommended usage is:
 * - background: For big behind-the-scenes overlays (PDF viewer, fullscreen webcam)
 * - overlay: For content overlays (Excalidraw in draw mode, small webcam overlay, etc.)
 * - controls: For UI controls that must appear above overlays (toolbars, meeting controls)
 * - extra: For absolutely top-level elements (e.g., emergency modals)
 */
export interface OverlayZIndices {
  background: number;
  overlay: number;
  controls: number;
  extra: number;
}

interface GlobalUIState {
  pdfViewerMode: boolean;
  setPdfViewerMode: React.Dispatch<React.SetStateAction<boolean>>;
  pdfSrc: string | null;
  setPdfSrc: React.Dispatch<React.SetStateAction<string | null>>;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  isMeetingActive: boolean;
  setIsMeetingActive: React.Dispatch<React.SetStateAction<boolean>>;
  isMeetingMinimized: boolean;
  setIsMeetingMinimized: React.Dispatch<React.SetStateAction<boolean>>;
  meetingState: "setup" | "inProgress";
  setMeetingState: React.Dispatch<React.SetStateAction<"setup" | "inProgress">>;
  displayMode: "regular" | "draw";
  setDisplayMode: React.Dispatch<React.SetStateAction<"regular" | "draw">>;
  isStreamMode: boolean;
  setIsStreamMode: React.Dispatch<React.SetStateAction<boolean>>;
  isWebcamOverlayVisible: boolean;
  setIsWebcamOverlayVisible: React.Dispatch<React.SetStateAction<boolean>>;
  webcamOn: boolean;
  setWebcamOn: React.Dispatch<React.SetStateAction<boolean>>;
  // New state for Excalidraw API
  excalidrawAPI: CustomExcalidrawAPI | null;
  setExcalidrawAPI: React.Dispatch<React.SetStateAction<CustomExcalidrawAPI | null>>;
  // Overlay manager state for centralized z-index handling
  overlayZIndices: OverlayZIndices;
  setOverlayZIndices: React.Dispatch<React.SetStateAction<OverlayZIndices>>;
  // Optional helper for retrieving a specific z-index by name
  getZIndex: (layer: keyof OverlayZIndices) => number;
}

const GlobalUIContext = createContext<GlobalUIState | undefined>(undefined);

export const GlobalUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // UI states
  const [pdfViewerMode, setPdfViewerMode] = useState(false);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isMeetingMinimized, setIsMeetingMinimized] = useState(false);
  const [meetingState, setMeetingState] = useState<"setup" | "inProgress">("setup");
  const [displayMode, setDisplayMode] = useState<"regular" | "draw">("regular");
  const [isStreamMode, setIsStreamMode] = useState(false);
  const [isWebcamOverlayVisible, setIsWebcamOverlayVisible] = useState(false);
  const [webcamOn, setWebcamOn] = useState(false);
  // Excalidraw API reference
  const [excalidrawAPI, setExcalidrawAPI] = useState<CustomExcalidrawAPI | null>(null);
  
  // Centralized overlay manager state (z-index definitions).
  const [overlayZIndices, setOverlayZIndices] = useState<OverlayZIndices>({
    background: 1000, // e.g., PDF viewer, fullscreen webcam
    overlay: 1002,    // e.g., Excalidraw in draw mode, small webcam overlay
    controls: 1010,   // e.g., meeting controls, main toolbar
    extra: 1100,      // e.g., absolutely top-level elements (emergency modals)
  });

  // Optional convenience helper to get a specific z-index
  const getZIndex = (layer: keyof OverlayZIndices) => overlayZIndices[layer];

  return (
    <GlobalUIContext.Provider
      value={{
        pdfViewerMode,
        setPdfViewerMode,
        pdfSrc,
        setPdfSrc,
        isRecording,
        setIsRecording,
        isMeetingActive,
        setIsMeetingActive,
        isMeetingMinimized,
        setIsMeetingMinimized,
        meetingState,
        setMeetingState,
        displayMode,
        setDisplayMode,
        isStreamMode,
        setIsStreamMode,
        isWebcamOverlayVisible,
        setIsWebcamOverlayVisible,
        webcamOn,
        setWebcamOn,
        excalidrawAPI,
        setExcalidrawAPI,
        overlayZIndices,
        setOverlayZIndices,
        getZIndex,
      }}
    >
      {children}
    </GlobalUIContext.Provider>
  );
};

export const useGlobalUI = () => {
  const context = useContext(GlobalUIContext);
  if (context === undefined) {
    throw new Error("useGlobalUI must be used within a GlobalUIProvider");
  }
  return context;
};

/**
 * (Optional) A hook to quickly get booleans for each overlay.
 * You can import and use this in other components for convenience.
 */
export const useActiveOverlays = () => {
  const {
    pdfViewerMode,
    isMeetingActive,
    isStreamMode,
    isWebcamOverlayVisible,
  } = useGlobalUI();

  return {
    pdfActive: pdfViewerMode,
    meetingActive: isMeetingActive,
    streamActive: isStreamMode,
    webcamOverlayActive: isWebcamOverlayVisible,
  };
};
