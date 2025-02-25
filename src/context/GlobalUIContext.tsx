// GlobalUIContext.tsx
import React, { createContext, useContext, useState } from "react";
// Optionally, you could import proper types from Excalidraw if available:
// import { ExcalidrawElement, AppState, BinaryFiles } from "@excalidraw/excalidraw";

/**
 * Updated CustomExcalidrawAPI type to match Excalidraw's latest API.
 * Here we use `any` for simplicity, but you can replace these with proper types if available.
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
}

const GlobalUIContext = createContext<GlobalUIState | undefined>(undefined);

export const GlobalUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  // New state for Excalidraw API
  const [excalidrawAPI, setExcalidrawAPI] = useState<CustomExcalidrawAPI | null>(null);

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
