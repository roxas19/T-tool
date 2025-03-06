// src/context/WebcamContext.tsx
import React, { createContext, useContext, useReducer } from "react";

export type WebcamState = {
  on: boolean;
  isOverlayVisible: boolean;
  isStreamMode: boolean;
};

const initialWebcamState: WebcamState = {
  on: false,
  isOverlayVisible: false,
  isStreamMode: false,
};

type WebcamAction =
  | { type: "SET_WEBCAM_ON"; payload: boolean }
  | { type: "SET_WEBCAM_OVERLAY_VISIBLE"; payload: boolean }
  | { type: "SET_WEBCAM_STREAM_MODE"; payload: boolean };

function webcamReducer(state: WebcamState, action: WebcamAction): WebcamState {
  switch (action.type) {
    case "SET_WEBCAM_ON":
      return { ...state, on: action.payload };
    case "SET_WEBCAM_OVERLAY_VISIBLE":
      return { ...state, isOverlayVisible: action.payload };
    case "SET_WEBCAM_STREAM_MODE":
      return { ...state, isStreamMode: action.payload };
    default:
      return state;
  }
}

type WebcamContextType = {
  webcamState: WebcamState;
  webcamDispatch: React.Dispatch<WebcamAction>;
};

const WebcamContext = createContext<WebcamContextType | undefined>(undefined);

export const WebcamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webcamState, webcamDispatch] = useReducer(webcamReducer, initialWebcamState);
  return (
    <WebcamContext.Provider value={{ webcamState, webcamDispatch }}>
      {children}
    </WebcamContext.Provider>
  );
};

export const useWebcamContext = () => {
  const context = useContext(WebcamContext);
  if (!context) {
    throw new Error("useWebcamContext must be used within a WebcamProvider");
  }
  return context;
};
