import React, { createContext, useContext, useReducer, useMemo } from "react";

export type OverlayType = "pdf" | "realview" | "excalidraw" | "meeting";

export interface OverlayZIndices {
  background: number;
  overlay: number;
  controls: number;
  extra: number;
}

export type OverlayManagerState = {
  activeStack: OverlayType[];
  displayMode: "regular" | "draw";
  overlayZIndices: OverlayZIndices;
};

const initialOverlayManagerState: OverlayManagerState = {
  activeStack: [],
  displayMode: "regular",
  overlayZIndices: {
    background: 1000,
    overlay: 1002,
    controls: 1010,
    extra: 1100,
  },
};

type OverlayManagerAction =
  | { type: "PUSH_OVERLAY"; payload: OverlayType }
  | { type: "POP_OVERLAY" }
  | { type: "SET_DISPLAY_MODE"; payload: "regular" | "draw" }
  | { type: "SET_OVERLAY_ZINDICES"; payload: OverlayZIndices };

function overlayManagerReducer(
  state: OverlayManagerState,
  action: OverlayManagerAction
): OverlayManagerState {
  switch (action.type) {
    case "PUSH_OVERLAY":
      return {
        ...state,
        activeStack: [
          ...state.activeStack.filter((o) => o !== action.payload),
          action.payload,
        ],
      };
    case "POP_OVERLAY":
      return { ...state, activeStack: state.activeStack.slice(0, -1) };
    case "SET_DISPLAY_MODE":
      return { ...state, displayMode: action.payload };
    case "SET_OVERLAY_ZINDICES":
      return { ...state, overlayZIndices: action.payload };
    default:
      return state;
  }
}

export interface OverlayStatus {
  isActive: boolean;
  isCurrent: boolean;
  zIndex: number;
}

export const overlayUtils = {
  isOverlayActive: (
    state: OverlayManagerState,
    type: OverlayType
  ): boolean => state.activeStack.includes(type),

  isCurrentOverlay: (
    state: OverlayManagerState,
    type: OverlayType
  ): boolean => state.activeStack[state.activeStack.length - 1] === type,

  getOverlayStatus: (
    state: OverlayManagerState,
    type: OverlayType
  ): OverlayStatus => ({
    isActive: state.activeStack.includes(type),
    isCurrent: state.activeStack[state.activeStack.length - 1] === type,
    // Calculate z-index relative to the overlay base plus the type's position
    zIndex: state.overlayZIndices.overlay + state.activeStack.indexOf(type),
  }),
};

interface OverlayManagerContextType {
  overlayState: OverlayManagerState;
  overlayDispatch: React.Dispatch<OverlayManagerAction>;
}

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
  const { overlayState, overlayDispatch } = context;
  const utils = useMemo(
    () => ({
      isOverlayActive: (type: OverlayType) => overlayUtils.isOverlayActive(overlayState, type),
      isCurrentOverlay: (type: OverlayType) => overlayUtils.isCurrentOverlay(overlayState, type),
      getOverlayStatus: (type: OverlayType) => overlayUtils.getOverlayStatus(overlayState, type),
    }),
    [overlayState]
  );
  return { overlayState, overlayDispatch, utils };
};