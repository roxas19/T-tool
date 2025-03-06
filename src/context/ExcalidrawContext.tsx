// src/context/ExcalidrawContext.tsx
import React, { createContext, useContext, useReducer } from "react";

// Define the CustomExcalidrawAPI type locally
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

export type ExcalidrawState = {
  api: CustomExcalidrawAPI | null;
};

const initialExcalidrawState: ExcalidrawState = {
  api: null,
};

type ExcalidrawAction =
  | { type: "SET_EXCALIDRAW_API"; payload: CustomExcalidrawAPI | null };

function excalidrawReducer(state: ExcalidrawState, action: ExcalidrawAction): ExcalidrawState {
  switch (action.type) {
    case "SET_EXCALIDRAW_API":
      return { ...state, api: action.payload };
    default:
      return state;
  }
}

type ExcalidrawContextType = {
  excalidrawState: ExcalidrawState;
  excalidrawDispatch: React.Dispatch<ExcalidrawAction>;
};

const ExcalidrawContext = createContext<ExcalidrawContextType | undefined>(undefined);

export const ExcalidrawProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [excalidrawState, excalidrawDispatch] = useReducer(excalidrawReducer, initialExcalidrawState);
  return (
    <ExcalidrawContext.Provider value={{ excalidrawState, excalidrawDispatch }}>
      {children}
    </ExcalidrawContext.Provider>
  );
};

export const useExcalidrawContext = () => {
  const context = useContext(ExcalidrawContext);
  if (!context) {
    throw new Error("useExcalidrawContext must be used within an ExcalidrawProvider");
  }
  return context;
};
