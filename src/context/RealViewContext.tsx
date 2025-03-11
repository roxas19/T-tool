// src/context/RealViewContext.tsx
import React, { createContext, useContext, useReducer } from "react";

export type RealViewState = {
  on: boolean;
  isStreamMode: boolean;
};

const initialRealViewState: RealViewState = {
  on: false,
  isStreamMode: false,
};

type RealViewAction =
  | { type: "SET_REALVIEW_ON"; payload: boolean }
  | { type: "SET_REALVIEW_STREAM_MODE"; payload: boolean };

function realViewReducer(state: RealViewState, action: RealViewAction): RealViewState {
  switch (action.type) {
    case "SET_REALVIEW_ON":
      return { ...state, on: action.payload };
    case "SET_REALVIEW_STREAM_MODE":
      return { ...state, isStreamMode: action.payload };
    default:
      return state;
  }
}

type RealViewContextType = {
  realViewState: RealViewState;
  realViewDispatch: React.Dispatch<RealViewAction>;
};

const RealViewContext = createContext<RealViewContextType | undefined>(undefined);

export const RealViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [realViewState, realViewDispatch] = useReducer(realViewReducer, initialRealViewState);
  return (
    <RealViewContext.Provider value={{ realViewState, realViewDispatch }}>
      {children}
    </RealViewContext.Provider>
  );
};

export const useRealViewContext = () => {
  const context = useContext(RealViewContext);
  if (!context) {
    throw new Error("useRealViewContext must be used within a RealViewProvider");
  }
  return context;
};
