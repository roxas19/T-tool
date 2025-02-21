// GlobalUIContext.tsx
import React, { createContext, useContext, useState } from "react";

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
  // New state for the small webcam overlay visibility:
  isWebcamOverlayVisible: boolean;
  setIsWebcamOverlayVisible: React.Dispatch<React.SetStateAction<boolean>>;
  // New state for webcam feed on/off
  webcamOn: boolean;
  setWebcamOn: React.Dispatch<React.SetStateAction<boolean>>;
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
  // For g5: When the webcam is toggled (but not in full stream view), the small webcam overlay should be visible.
  const [isWebcamOverlayVisible, setIsWebcamOverlayVisible] = useState(false);
  // NEW for g6: Manage webcam feed state globally.
  const [webcamOn, setWebcamOn] = useState(false);

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
