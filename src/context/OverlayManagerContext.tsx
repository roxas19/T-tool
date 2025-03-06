import React, { createContext, useContext, useReducer } from "react";

export type OverlayType = "pdf" | "webcam" | "excalidraw" | "meeting" | null;

export interface OverlayZIndices {
  background: number;
  overlay: number;
  controls: number;
  extra: number;
}

// Extend the state to include displayMode and overlayZIndices.
export type OverlayManagerState = {
  activeBackground: OverlayType;
  displayMode: "regular" | "draw";
  overlayZIndices: OverlayZIndices;
};

const initialOverlayManagerState: OverlayManagerState = {
  activeBackground: null,
  displayMode: "regular", // default mode
  overlayZIndices: {
    background: 1000,
    overlay: 1002,
    controls: 1010,
    extra: 1100,
  },
};

type OverlayManagerAction =
  | { type: "SET_ACTIVE_BACKGROUND"; payload: OverlayType }
  | { type: "SET_DISPLAY_MODE"; payload: "regular" | "draw" }
  | { type: "SET_OVERLAY_ZINDICES"; payload: OverlayZIndices };

function overlayManagerReducer(
  state: OverlayManagerState,
  action: OverlayManagerAction
): OverlayManagerState {
  switch (action.type) {
    case "SET_ACTIVE_BACKGROUND":
      return { ...state, activeBackground: action.payload };
    case "SET_DISPLAY_MODE":
      return { ...state, displayMode: action.payload };
    case "SET_OVERLAY_ZINDICES":
      return { ...state, overlayZIndices: action.payload };
    default:
      return state;
  }
}

type OverlayManagerContextType = {
  overlayState: OverlayManagerState;
  overlayDispatch: React.Dispatch<OverlayManagerAction>;
};

const OverlayManagerContext = createContext<OverlayManagerContextType | undefined>(undefined);

export const OverlayManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [overlayState, overlayDispatch] = useReducer(overlayManagerReducer, initialOverlayManagerState);
  return (
    <OverlayManagerContext.Provider value={{ overlayState, overlayDispatch }}>
      {children}
    </OverlayManagerContext.Provider>
  );
};

export const useOverlayManager = () => {
  const context = useContext(OverlayManagerContext);
  if (!context) {
    throw new Error("useOverlayManager must be used within an OverlayManagerProvider");
  }
  return context;
};