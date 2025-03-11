// src/context/WebcamOverlayContext.tsx
import React, { createContext, useContext, useReducer } from "react";

export type WebcamOverlayState = {
  active: boolean;
};

const initialWebcamOverlayState: WebcamOverlayState = {
  active: false,
};

type WebcamOverlayAction =
  | { type: "SET_ACTIVE"; payload: boolean }
  | { type: "TOGGLE" };

function webcamOverlayReducer(
  state: WebcamOverlayState,
  action: WebcamOverlayAction
): WebcamOverlayState {
  switch (action.type) {
    case "SET_ACTIVE":
      return { ...state, active: action.payload };
    case "TOGGLE":
      return { ...state, active: !state.active };
    default:
      return state;
  }
}

type WebcamOverlayContextType = {
  webcamOverlayState: WebcamOverlayState;
  webcamOverlayDispatch: React.Dispatch<WebcamOverlayAction>;
};

const WebcamOverlayContext = createContext<WebcamOverlayContextType | undefined>(undefined);

export const WebcamOverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webcamOverlayState, webcamOverlayDispatch] = useReducer(
    webcamOverlayReducer,
    initialWebcamOverlayState
  );
  return (
    <WebcamOverlayContext.Provider value={{ webcamOverlayState, webcamOverlayDispatch }}>
      {children}
    </WebcamOverlayContext.Provider>
  );
};

export const useWebcamOverlay = () => {
  const context = useContext(WebcamOverlayContext);
  if (!context) {
    throw new Error("useWebcamOverlay must be used within a WebcamOverlayProvider");
  }
  return context;
};
