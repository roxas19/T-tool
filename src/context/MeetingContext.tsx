// src/context/MeetingContext.tsx
import React, { createContext, useContext, useReducer } from "react";

export type MeetingState = {
  isActive: boolean;
  isMinimized: boolean;
  state: "setup" | "inProgress";
};

const initialMeetingState: MeetingState = {
  isActive: false,
  isMinimized: false,
  state: "setup",
};

type MeetingAction =
  | { type: "OPEN_MEETING" }
  | { type: "CLOSE_MEETING" }
  | { type: "SET_MINIMIZED"; payload: boolean };

function meetingReducer(state: MeetingState, action: MeetingAction): MeetingState {
  switch (action.type) {
    case "OPEN_MEETING":
      return { ...state, isActive: true, isMinimized: false, state: "setup" };
    case "CLOSE_MEETING":
      return { ...state, isActive: false, isMinimized: false, state: "setup" };
    case "SET_MINIMIZED":
      return { ...state, isMinimized: action.payload };
    default:
      return state;
  }
}

type MeetingContextType = {
  meetingState: MeetingState;
  meetingDispatch: React.Dispatch<MeetingAction>;
};

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meetingState, meetingDispatch] = useReducer(meetingReducer, initialMeetingState);
  return (
    <MeetingContext.Provider value={{ meetingState, meetingDispatch }}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetingContext = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeetingContext must be used within a MeetingProvider");
  }
  return context;
};
