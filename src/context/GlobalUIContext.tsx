// src/context/GlobalUIContext.tsx
import React, { createContext, useContext, useReducer } from "react";

// ---------------------
// Excalidraw API type (unchanged for now)
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

// ---------------------
// Overlay Z-Indices
export interface OverlayZIndices {
  background: number;
  overlay: number;
  controls: number;
  extra: number;
}

// ---------------------
// Global UI State: Grouped by domain (recording removed)
export type GlobalUIState = {
  pdf: {
    isViewerActive: boolean;
    src: string | null;
  };
  meeting: {
    isActive: boolean;
    isMinimized: boolean;
    state: "setup" | "inProgress";
  };
  displayMode: "regular" | "draw"; // "draw" mode means Excalidraw overlay is active.
  webcam: {
    on: boolean;
    isOverlayVisible: boolean;
    isStreamMode: boolean;
  };
  excalidrawAPI: CustomExcalidrawAPI | null;
  overlayZIndices: OverlayZIndices;
};

// ---------------------
// Initial state definition (recording removed)
const initialState: GlobalUIState = {
  pdf: { isViewerActive: false, src: null },
  meeting: { isActive: false, isMinimized: false, state: "setup" },
  displayMode: "regular",
  webcam: { on: false, isOverlayVisible: false, isStreamMode: false },
  excalidrawAPI: null,
  overlayZIndices: {
    background: 1000, // background components (e.g. current main view)
    overlay: 1002,    // Excalidraw draw mode overlay
    controls: 1010,   // controls, meeting buttons, toolbars, etc.
    extra: 1100,      // absolutely top-level elements (emergency modals, toggle buttons)
  },
};

// ---------------------
// Define actions for state transitions (recording actions removed)
type Action =
  | { type: "OPEN_PDF_VIEWER"; payload: string }
  | { type: "CLOSE_PDF_VIEWER" }
  | { type: "OPEN_MEETING" }
  | { type: "MINIMIZE_MEETING" }
  | { type: "CLOSE_MEETING" }
  | { type: "SET_DISPLAY_MODE"; payload: "regular" | "draw" }
  | { type: "SET_WEBCAM_ON"; payload: boolean }
  | { type: "SET_WEBCAM_OVERLAY_VISIBLE"; payload: boolean }
  | { type: "SET_WEBCAM_STREAM_MODE"; payload: boolean }
  | { type: "SET_EXCALIDRAW_API"; payload: CustomExcalidrawAPI | null }
  | { type: "SET_OVERLAY_ZINDICES"; payload: OverlayZIndices };

// ---------------------
// Reducer: Handles all state transitions (recording actions removed)
function globalUIReducer(state: GlobalUIState, action: Action): GlobalUIState {
  switch (action.type) {
    case "OPEN_PDF_VIEWER":
      return { ...state, pdf: { isViewerActive: true, src: action.payload } };
    case "CLOSE_PDF_VIEWER":
      return { ...state, pdf: { isViewerActive: false, src: null } };
    case "OPEN_MEETING":
      return { ...state, meeting: { isActive: true, isMinimized: false, state: "setup" } };
    case "MINIMIZE_MEETING":
      return { ...state, meeting: { ...state.meeting, isMinimized: true } };
    case "CLOSE_MEETING":
      return { ...state, meeting: { isActive: false, isMinimized: false, state: "setup" } };
    case "SET_DISPLAY_MODE":
      return { ...state, displayMode: action.payload };
    case "SET_WEBCAM_ON":
      return { ...state, webcam: { ...state.webcam, on: action.payload } };
    case "SET_WEBCAM_OVERLAY_VISIBLE":
      return { ...state, webcam: { ...state.webcam, isOverlayVisible: action.payload } };
    case "SET_WEBCAM_STREAM_MODE":
      return { ...state, webcam: { ...state.webcam, isStreamMode: action.payload } };
    case "SET_EXCALIDRAW_API":
      return { ...state, excalidrawAPI: action.payload };
    case "SET_OVERLAY_ZINDICES":
      return { ...state, overlayZIndices: action.payload };
    default:
      return state;
  }
}

// ---------------------
// Create context with state and dispatch
type GlobalUIDispatch = React.Dispatch<Action>;
const GlobalUIContext = createContext<{ state: GlobalUIState; dispatch: GlobalUIDispatch } | undefined>(undefined);

// ---------------------
// GlobalUIProvider component
export const GlobalUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(globalUIReducer, initialState);
  return (
    <GlobalUIContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalUIContext.Provider>
  );
};

// ---------------------
// Custom hook for accessing Global UI context
export const useGlobalUI = () => {
  const context = useContext(GlobalUIContext);
  if (context === undefined) {
    throw new Error("useGlobalUI must be used within a GlobalUIProvider");
  }
  return context;
};
